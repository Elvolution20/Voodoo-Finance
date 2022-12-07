// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./lib/Babylonian.sol";
import "./owner/Operator.sol";
import "./utils/ContractGuard.sol";
import "./interfaces/IBasisAsset.sol";
import "./interfaces/IOracle.sol";
import "./interfaces/IStaking.sol";


contract Treasury is ContractGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    /* ========= CONSTANT VARIABLES ======== */

    uint256 public constant PERIOD = 6 hours;

    /* ========== STATE VARIABLES ========== */

    // governance
    address public operator;

    // flags
    bool public initialized = false;

    // epoch
    uint256 public startTime;
    uint256 public epoch = 0;
    uint256 public epochSupplyContractionLeft = 0;

    // exclusions from total supply
    address[] public excludedFromTotalSupply = [
        address(0x9A896d3c54D7e45B558BD5fFf26bF1E8C031F93b), // VoodooGenesisPool
        address(0xa7b9123f4b15fE0fF01F469ff5Eab2b41296dC0E), // new VoodooRewardPool
        address(0xA7B16703470055881e7EE093e9b0bF537f29CD4d) // old VoodooRewardPool
    ];

    // core components
    address public voodoo;
    address public vbond;
    address public vshare;

    address public staking;
    address public voodooOracle;

    // price
    uint256 public voodooPriceOne;
    uint256 public voodooPriceCeiling;

    uint256 public seigniorageSaved;

    uint256[] public supplyTiers;
    uint256[] public maxExpansionTiers;

    uint256 public maxSupplyExpansionPercent;
    uint256 public bondDepletionFloorPercent;
    uint256 public seigniorageExpansionFloorPercent;
    uint256 public maxSupplyContractionPercent;
    uint256 public maxDebtRatioPercent;

    // 28 first epochs (1 week) with 4.5% expansion regardless of VOODOO price
    uint256 public bootstrapEpochs;
    uint256 public bootstrapSupplyExpansionPercent;

    /* =================== Added variables =================== */
    uint256 public previousEpochVoodooPrice;
    uint256 public maxDiscountRate; // when purchasing bond
    uint256 public maxPremiumRate; // when redeeming bond
    uint256 public discountPercent;
    uint256 public premiumThreshold;
    uint256 public premiumPercent;
    uint256 public mintingFactorForPayingDebt; // print extra VOODOO during debt phase

    address public daoFund;
    uint256 public daoFundSharedPercent;

    address public devFund;
    uint256 public devFundSharedPercent;

    /* =================== Events =================== */

    event Initialized(address indexed executor, uint256 at);
    event BurnedBonds(address indexed from, uint256 bondAmount);
    event RedeemedBonds(address indexed from, uint256 voodooAmount, uint256 bondAmount);
    event boughtBonds(address indexed from, uint256 voodooAmount, uint256 bondAmount);
    event TreasuryFunded(uint256 timestamp, uint256 seigniorage);
    event StakingFunded(uint256 timestamp, uint256 seigniorage);
    event DaoFundFunded(uint256 timestamp, uint256 seigniorage);
    event DevFundFunded(uint256 timestamp, uint256 seigniorage);

    /* =================== Modifier =================== */

    modifier onlyOperator() {
        require(operator == msg.sender, "Treasury: caller is not the operator");
        _;
    }

    modifier checkCondition {
        require(now >= startTime, "Treasury: not started yet");

        _;
    }

    modifier checkEpoch {
        require(now >= nextEpochPoint(), "Treasury: not opened yet");

        _;

        epoch = epoch.add(1);
        epochSupplyContractionLeft = (getVoodooPrice() > voodooPriceCeiling) ? 0 : getVoodooCirculatingSupply().mul(maxSupplyContractionPercent).div(10000);
    }

    modifier checkOperator {
        require(
            IBasisAsset(voodoo).operator() == address(this) &&
                IBasisAsset(vbond).operator() == address(this) &&
                IBasisAsset(vshare).operator() == address(this) &&
                Operator(staking).operator() == address(this),
            "Treasury: need more permission"
        );

        _;
    }

    modifier notInitialized {
        require(!initialized, "Treasury: already initialized");

        _;
    }

    /* ========== VIEW FUNCTIONS ========== */

    function isInitialized() public view returns (bool) {
        return initialized;
    }

    // epoch
    function nextEpochPoint() public view returns (uint256) {
        return startTime.add(epoch.mul(PERIOD));
    }

    // oracle
    function getVoodooPrice() public view returns (uint256 voodooPrice) {
        try IOracle(voodooOracle).consult(voodoo, 1e18) returns (uint144 price) {
            return uint256(price);
        } catch {
            revert("Treasury: failed to consult VOODOO price from the oracle");
        }
    }

    function getVoodooUpdatedPrice() public view returns (uint256 _voodooPrice) {
        try IOracle(voodooOracle).twap(voodoo, 1e18) returns (uint144 price) {
            return uint256(price);
        } catch {
            revert("Treasury: failed to consult VOODOO price from the oracle");
        }
    }

    // budget
    function getReserve() public view returns (uint256) {
        return seigniorageSaved;
    }

    function getBurnableVoodooLeft() public view returns (uint256 _burnableVoodooLeft) {
        uint256 _voodooPrice = getVoodooPrice();
        if (_voodooPrice <= voodooPriceOne) {
            uint256 _voodooSupply = getVoodooCirculatingSupply();
            uint256 _bondMaxSupply = _voodooSupply.mul(maxDebtRatioPercent).div(10000);
            uint256 _bondSupply = IERC20(vbond).totalSupply();
            if (_bondMaxSupply > _bondSupply) {
                uint256 _maxMintableBond = _bondMaxSupply.sub(_bondSupply);
                uint256 _maxBurnableVoodoo = _maxMintableBond.mul(_voodooPrice).div(1e18);
                _burnableVoodooLeft = Math.min(epochSupplyContractionLeft, _maxBurnableVoodoo);
            }
        }
    }

    function getRedeemableBonds() public view returns (uint256 _redeemableBonds) {
        uint256 _voodooPrice = getVoodooPrice();
        if (_voodooPrice > voodooPriceCeiling) {
            uint256 _totalVoodoo = IERC20(voodoo).balanceOf(address(this));
            uint256 _rate = getBondPremiumRate();
            if (_rate > 0) {
                _redeemableBonds = _totalVoodoo.mul(1e18).div(_rate);
            }
        }
    }

    function getBondDiscountRate() public view returns (uint256 _rate) {
        uint256 _voodooPrice = getVoodooPrice();
        if (_voodooPrice <= voodooPriceOne) {
            if (discountPercent == 0) {
                // no discount
                _rate = voodooPriceOne;
            } else {
                uint256 _bondAmount = voodooPriceOne.mul(1e18).div(_voodooPrice); // to burn 1 VOODOO
                uint256 _discountAmount = _bondAmount.sub(voodooPriceOne).mul(discountPercent).div(10000);
                _rate = voodooPriceOne.add(_discountAmount);
                if (maxDiscountRate > 0 && _rate > maxDiscountRate) {
                    _rate = maxDiscountRate;
                }
            }
        }
    }

    function getBondPremiumRate() public view returns (uint256 _rate) {
        uint256 _voodooPrice = getVoodooPrice();
        if (_voodooPrice > voodooPriceCeiling) {
            uint256 _voodooPricePremiumThreshold = voodooPriceOne.mul(premiumThreshold).div(100);
            if (_voodooPrice >= _voodooPricePremiumThreshold) {
                //Price > 1.10
                uint256 _premiumAmount = _voodooPrice.sub(voodooPriceOne).mul(premiumPercent).div(10000);
                _rate = voodooPriceOne.add(_premiumAmount);
                if (maxPremiumRate > 0 && _rate > maxPremiumRate) {
                    _rate = maxPremiumRate;
                }
            } else {
                // no premium bonus
                _rate = voodooPriceOne;
            }
        }
    }

    /* ========== GOVERNANCE ========== */

    function initialize(
        address _voodoo,
        address _vbond,
        address _vshare,
        address _voodooOracle,
        address _staking,
        uint256 _startTime
    ) public notInitialized {
        voodoo = _voodoo;
        vbond = _vbond;
        vshare = _vshare;
        voodooOracle = _voodooOracle;
        staking = _staking;
        startTime = _startTime;

        voodooPriceOne = 10**18;
        voodooPriceCeiling = voodooPriceOne.mul(101).div(100);

        // Dynamic max expansion percent
        supplyTiers = [0 ether, 500000 ether, 1000000 ether, 1500000 ether, 2000000 ether, 5000000 ether, 10000000 ether, 20000000 ether, 50000000 ether];
        maxExpansionTiers = [450, 400, 350, 300, 250, 200, 150, 125, 100];

        maxSupplyExpansionPercent = 400; // Upto 4.0% supply for expansion

        bondDepletionFloorPercent = 10000; // 100% of Bond supply for depletion floor
        seigniorageExpansionFloorPercent = 3500; // At least 35% of expansion reserved for staking
        maxSupplyContractionPercent = 300; // Upto 3.0% supply for contraction (to burn VOODOO and mint vBOND)
        maxDebtRatioPercent = 3500; // Upto 35% supply of vBOND to purchase

        premiumThreshold = 110;
        premiumPercent = 7000;

        // First 28 epochs with 4.5% expansion
        bootstrapEpochs = 28;
        bootstrapSupplyExpansionPercent = 450;

        // set seigniorageSaved to it's balance
        seigniorageSaved = IERC20(voodoo).balanceOf(address(this));

        initialized = true;
        operator = msg.sender;
        emit Initialized(msg.sender, block.number);
    }

    function setOperator(address _operator) external onlyOperator {
        operator = _operator;
    }

    function setStaking(address _staking) external onlyOperator {
        staking = _staking;
    }

    function setVoodooOracle(address _voodooOracle) external onlyOperator {
        voodooOracle = _voodooOracle;
    }

    function setVoodooPriceCeiling(uint256 _voodooPriceCeiling) external onlyOperator {
        require(_voodooPriceCeiling >= voodooPriceOne && _voodooPriceCeiling <= voodooPriceOne.mul(120).div(100), "out of range"); // [$1.0, $1.2]
        voodooPriceCeiling = _voodooPriceCeiling;
    }

    function setMaxSupplyExpansionPercents(uint256 _maxSupplyExpansionPercent) external onlyOperator {
        require(_maxSupplyExpansionPercent >= 10 && _maxSupplyExpansionPercent <= 1000, "_maxSupplyExpansionPercent: out of range"); // [0.1%, 10%]
        maxSupplyExpansionPercent = _maxSupplyExpansionPercent;
    }

    function setSupplyTiersEntry(uint8 _index, uint256 _value) external onlyOperator returns (bool) {
        require(_index >= 0, "Index has to be higher than 0");
        require(_index < 9, "Index has to be lower than count of tiers");
        if (_index > 0) {
            require(_value > supplyTiers[_index - 1]);
        }
        if (_index < 8) {
            require(_value < supplyTiers[_index + 1]);
        }
        supplyTiers[_index] = _value;
        return true;
    }

    function setMaxExpansionTiersEntry(uint8 _index, uint256 _value) external onlyOperator returns (bool) {
        require(_index >= 0, "Index has to be higher than 0");
        require(_index < 9, "Index has to be lower than count of tiers");
        require(_value >= 10 && _value <= 1000, "_value: out of range"); // [0.1%, 10%]
        maxExpansionTiers[_index] = _value;
        return true;
    }

    function setBondDepletionFloorPercent(uint256 _bondDepletionFloorPercent) external onlyOperator {
        require(_bondDepletionFloorPercent >= 500 && _bondDepletionFloorPercent <= 10000, "out of range"); // [5%, 100%]
        bondDepletionFloorPercent = _bondDepletionFloorPercent;
    }

    function setMaxSupplyContractionPercent(uint256 _maxSupplyContractionPercent) external onlyOperator {
        require(_maxSupplyContractionPercent >= 100 && _maxSupplyContractionPercent <= 1500, "out of range"); // [0.1%, 15%]
        maxSupplyContractionPercent = _maxSupplyContractionPercent;
    }

    function setMaxDebtRatioPercent(uint256 _maxDebtRatioPercent) external onlyOperator {
        require(_maxDebtRatioPercent >= 1000 && _maxDebtRatioPercent <= 10000, "out of range"); // [10%, 100%]
        maxDebtRatioPercent = _maxDebtRatioPercent;
    }

    function setBootstrap(uint256 _bootstrapEpochs, uint256 _bootstrapSupplyExpansionPercent) external onlyOperator {
        require(_bootstrapEpochs <= 120, "_bootstrapEpochs: out of range"); // <= 1 month
        require(_bootstrapSupplyExpansionPercent >= 100 && _bootstrapSupplyExpansionPercent <= 1000, "_bootstrapSupplyExpansionPercent: out of range"); // [1%, 10%]
        bootstrapEpochs = _bootstrapEpochs;
        bootstrapSupplyExpansionPercent = _bootstrapSupplyExpansionPercent;
    }

    function setExtraFunds(
        address _daoFund,
        uint256 _daoFundSharedPercent,
        address _devFund,
        uint256 _devFundSharedPercent
    ) external onlyOperator {
        require(_daoFund != address(0), "zero");
        require(_daoFundSharedPercent <= 3000, "out of range"); // <= 30%
        require(_devFund != address(0), "zero");
        require(_devFundSharedPercent <= 1000, "out of range"); // <= 10%
        daoFund = _daoFund;
        daoFundSharedPercent = _daoFundSharedPercent;
        devFund = _devFund;
        devFundSharedPercent = _devFundSharedPercent;
    }

    function setMaxDiscountRate(uint256 _maxDiscountRate) external onlyOperator {
        maxDiscountRate = _maxDiscountRate;
    }

    function setMaxPremiumRate(uint256 _maxPremiumRate) external onlyOperator {
        maxPremiumRate = _maxPremiumRate;
    }

    function setDiscountPercent(uint256 _discountPercent) external onlyOperator {
        require(_discountPercent <= 20000, "_discountPercent is over 200%");
        discountPercent = _discountPercent;
    }

    function setPremiumThreshold(uint256 _premiumThreshold) external onlyOperator {
        require(_premiumThreshold >= voodooPriceCeiling, "_premiumThreshold exceeds voodooPriceCeiling");
        require(_premiumThreshold <= 150, "_premiumThreshold is higher than 1.5");
        premiumThreshold = _premiumThreshold;
    }

    function setPremiumPercent(uint256 _premiumPercent) external onlyOperator {
        require(_premiumPercent <= 20000, "_premiumPercent is over 200%");
        premiumPercent = _premiumPercent;
    }

    function setMintingFactorForPayingDebt(uint256 _mintingFactorForPayingDebt) external onlyOperator {
        require(_mintingFactorForPayingDebt >= 10000 && _mintingFactorForPayingDebt <= 20000, "_mintingFactorForPayingDebt: out of range"); // [100%, 200%]
        mintingFactorForPayingDebt = _mintingFactorForPayingDebt;
    }

    /* ========== MUTABLE FUNCTIONS ========== */

    function _updateVoodooPrice() internal {
        try IOracle(voodooOracle).update() {} catch {}
    }

    function getVoodooCirculatingSupply() public view returns (uint256) {
        IERC20 voodooErc20 = IERC20(voodoo);
        uint256 totalSupply = voodooErc20.totalSupply();
        uint256 balanceExcluded = 0;
        for (uint8 entryId = 0; entryId < excludedFromTotalSupply.length; ++entryId) {
            balanceExcluded = balanceExcluded.add(voodooErc20.balanceOf(excludedFromTotalSupply[entryId]));
        }
        return totalSupply.sub(balanceExcluded);
    }

    function buyBonds(uint256 _voodooAmount, uint256 targetPrice) external onlyOneBlock checkCondition checkOperator {
        require(_voodooAmount > 0, "Treasury: cannot purchase bonds with zero amount");

        uint256 voodooPrice = getVoodooPrice();
        require(voodooPrice == targetPrice, "Treasury: VOODOO price moved");
        require(
            voodooPrice < voodooPriceOne, // price < $1
            "Treasury: voodooPrice not eligible for bond purchase"
        );

        require(_voodooAmount <= epochSupplyContractionLeft, "Treasury: not enough bond left to purchase");

        uint256 _rate = getBondDiscountRate();
        require(_rate > 0, "Treasury: invalid bond rate");

        uint256 _bondAmount = _voodooAmount.mul(_rate).div(1e18);
        uint256 voodooSupply = getVoodooCirculatingSupply();
        uint256 newBondSupply = IERC20(vbond).totalSupply().add(_bondAmount);
        require(newBondSupply <= voodooSupply.mul(maxDebtRatioPercent).div(10000), "over max debt ratio");

        IBasisAsset(voodoo).burnFrom(msg.sender, _voodooAmount);
        IBasisAsset(vbond).mint(msg.sender, _bondAmount);

        epochSupplyContractionLeft = epochSupplyContractionLeft.sub(_voodooAmount);
        _updateVoodooPrice();

        emit boughtBonds(msg.sender, _voodooAmount, _bondAmount);
    }

    function redeemBonds(uint256 _bondAmount, uint256 targetPrice) external onlyOneBlock checkCondition checkOperator {
        require(_bondAmount > 0, "Treasury: cannot redeem bonds with zero amount");

        uint256 voodooPrice = getVoodooPrice();
        require(voodooPrice == targetPrice, "Treasury: VOODOO price moved");
        require(
            voodooPrice > voodooPriceCeiling, // price > $1.01
            "Treasury: voodooPrice not eligible for bond purchase"
        );

        uint256 _rate = getBondPremiumRate();
        require(_rate > 0, "Treasury: invalid bond rate");

        uint256 _voodooAmount = _bondAmount.mul(_rate).div(1e18);
        require(IERC20(voodoo).balanceOf(address(this)) >= _voodooAmount, "Treasury: treasury has no more budget");

        seigniorageSaved = seigniorageSaved.sub(Math.min(seigniorageSaved, _voodooAmount));

        IBasisAsset(vbond).burnFrom(msg.sender, _bondAmount);
        IERC20(voodoo).safeTransfer(msg.sender, _voodooAmount);

        _updateVoodooPrice();

        emit RedeemedBonds(msg.sender, _voodooAmount, _bondAmount);
    }

    function _sendToStaking(uint256 _amount) internal {
        IBasisAsset(voodoo).mint(address(this), _amount);

        uint256 _daoFundSharedAmount = 0;
        if (daoFundSharedPercent > 0) {
            _daoFundSharedAmount = _amount.mul(daoFundSharedPercent).div(10000);
            IERC20(voodoo).transfer(daoFund, _daoFundSharedAmount);
            emit DaoFundFunded(now, _daoFundSharedAmount);
        }

        uint256 _devFundSharedAmount = 0;
        if (devFundSharedPercent > 0) {
            _devFundSharedAmount = _amount.mul(devFundSharedPercent).div(10000);
            IERC20(voodoo).transfer(devFund, _devFundSharedAmount);
            emit DevFundFunded(now, _devFundSharedAmount);
        }

        _amount = _amount.sub(_daoFundSharedAmount).sub(_devFundSharedAmount);

        IERC20(voodoo).safeApprove(staking, 0);
        IERC20(voodoo).safeApprove(staking, _amount);
        IStaking(staking).allocateSeigniorage(_amount);
        emit StakingFunded(now, _amount);
    }

    function _calculateMaxSupplyExpansionPercent(uint256 _voodooSupply) internal returns (uint256) {
        for (uint8 tierId = 8; tierId >= 0; --tierId) {
            if (_voodooSupply >= supplyTiers[tierId]) {
                maxSupplyExpansionPercent = maxExpansionTiers[tierId];
                break;
            }
        }
        return maxSupplyExpansionPercent;
    }

    function allocateSeigniorage() external onlyOneBlock checkCondition checkEpoch checkOperator {
        _updateVoodooPrice();
        previousEpochVoodooPrice = getVoodooPrice();
        uint256 voodooSupply = getVoodooCirculatingSupply().sub(seigniorageSaved);
        if (epoch < bootstrapEpochs) {
            // 28 first epochs with 4.5% expansion
            _sendToStaking(voodooSupply.mul(bootstrapSupplyExpansionPercent).div(10000));
        } else {
            if (previousEpochVoodooPrice > voodooPriceCeiling) {
                // Expansion ($VOODOO Price > 1 $BTT): there is some seigniorage to be allocated
                uint256 bondSupply = IERC20(vbond).totalSupply();
                uint256 _percentage = previousEpochVoodooPrice.sub(voodooPriceOne);
                uint256 _savedForBond;
                uint256 _savedForStaking;
                uint256 _mse = _calculateMaxSupplyExpansionPercent(voodooSupply).mul(1e14);
                if (_percentage > _mse) {
                    _percentage = _mse;
                }
                if (seigniorageSaved >= bondSupply.mul(bondDepletionFloorPercent).div(10000)) {
                    // saved enough to pay debt, mint as usual rate
                    _savedForStaking = voodooSupply.mul(_percentage).div(1e18);
                } else {
                    // have not saved enough to pay debt, mint more
                    uint256 _seigniorage = voodooSupply.mul(_percentage).div(1e18);
                    _savedForStaking = _seigniorage.mul(seigniorageExpansionFloorPercent).div(10000);
                    _savedForBond = _seigniorage.sub(_savedForStaking);
                    if (mintingFactorForPayingDebt > 0) {
                        _savedForBond = _savedForBond.mul(mintingFactorForPayingDebt).div(10000);
                    }
                }
                if (_savedForStaking > 0) {
                    _sendToStaking(_savedForStaking);
                }
                if (_savedForBond > 0) {
                    seigniorageSaved = seigniorageSaved.add(_savedForBond);
                    IBasisAsset(voodoo).mint(address(this), _savedForBond);
                    emit TreasuryFunded(now, _savedForBond);
                }
            }
        }
    }

    function governanceRecoverUnsupported(
        IERC20 _token,
        uint256 _amount,
        address _to
    ) external onlyOperator {
        // do not allow to drain core tokens
        require(address(_token) != address(voodoo), "voodoo");
        require(address(_token) != address(vbond), "bond");
        require(address(_token) != address(vshare), "share");
        _token.safeTransfer(_to, _amount);
    }

    function stakingSetOperator(address _operator) external onlyOperator {
        IStaking(staking).setOperator(_operator);
    }

    function stakingSetLockUp(uint256 _withdrawLockupEpochs, uint256 _rewardLockupEpochs) external onlyOperator {
        IStaking(staking).setLockUp(_withdrawLockupEpochs, _rewardLockupEpochs);
    }

    function stakingAllocateSeigniorage(uint256 amount) external onlyOperator {
        IStaking(staking).allocateSeigniorage(amount);
    }

    function stakingGovernanceRecoverUnsupported(
        address _token,
        uint256 _amount,
        address _to
    ) external onlyOperator {
        IStaking(staking).governanceRecoverUnsupported(_token, _amount, _to);
    }
}