// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./owner/Operator.sol";
import "./interfaces/ITaxable.sol";
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IERC20.sol";

contract TaxOfficeV2 is Operator {
    using SafeMath for uint256;

    address public voodoo = address(0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7);
    address public wbtt = address(0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83);
    address public uniRouter = address(0xF491e7B69E4244ad4002BC14e878a34207E38c29);

    mapping(address => bool) public taxExclusionEnabled;

    function setTaxTiersTwap(uint8 _index, uint256 _value) public onlyOperator returns (bool) {
        return ITaxable(voodoo).setTaxTiersTwap(_index, _value);
    }

    function setTaxTiersRate(uint8 _index, uint256 _value) public onlyOperator returns (bool) {
        return ITaxable(voodoo).setTaxTiersRate(_index, _value);
    }

    function enableAutoCalculateTax() public onlyOperator {
        ITaxable(voodoo).enableAutoCalculateTax();
    }

    function disableAutoCalculateTax() public onlyOperator {
        ITaxable(voodoo).disableAutoCalculateTax();
    }

    function setTaxRate(uint256 _taxRate) public onlyOperator {
        ITaxable(voodoo).setTaxRate(_taxRate);
    }

    function setBurnThreshold(uint256 _burnThreshold) public onlyOperator {
        ITaxable(voodoo).setBurnThreshold(_burnThreshold);
    }

    function setTaxCollectorAddress(address _taxCollectorAddress) public onlyOperator {
        ITaxable(voodoo).setTaxCollectorAddress(_taxCollectorAddress);
    }

    function excludeAddressFromTax(address _address) external onlyOperator returns (bool) {
        return _excludeAddressFromTax(_address);
    }

    function _excludeAddressFromTax(address _address) private returns (bool) {
        if (!ITaxable(voodoo).isAddressExcluded(_address)) {
            return ITaxable(voodoo).excludeAddress(_address);
        }
    }

    function includeAddressInTax(address _address) external onlyOperator returns (bool) {
        return _includeAddressInTax(_address);
    }

    function _includeAddressInTax(address _address) private returns (bool) {
        if (ITaxable(voodoo).isAddressExcluded(_address)) {
            return ITaxable(voodoo).includeAddress(_address);
        }
    }

    function taxRate() external view returns (uint256) {
        return ITaxable(voodoo).taxRate();
    }

    function addLiquidityTaxFree(
        address token,
        uint256 amtVoodoo,
        uint256 amtToken,
        uint256 amtVoodooMin,
        uint256 amtTokenMin
    )
        external
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        require(amtVoodoo != 0 && amtToken != 0, "amounts can't be 0");
        _excludeAddressFromTax(msg.sender);

        IERC20(voodoo).transferFrom(msg.sender, address(this), amtVoodoo);
        IERC20(token).transferFrom(msg.sender, address(this), amtToken);
        _approveTokenIfNeeded(voodoo, uniRouter);
        _approveTokenIfNeeded(token, uniRouter);

        _includeAddressInTax(msg.sender);

        uint256 resultAmtVoodoo;
        uint256 resultAmtToken;
        uint256 liquidity;
        (resultAmtVoodoo, resultAmtToken, liquidity) = IUniswapV2Router(uniRouter).addLiquidity(
            voodoo,
            token,
            amtVoodoo,
            amtToken,
            amtVoodooMin,
            amtTokenMin,
            msg.sender,
            block.timestamp
        );

        if(amtVoodoo.sub(resultAmtVoodoo) > 0) {
            IERC20(voodoo).transfer(msg.sender, amtVoodoo.sub(resultAmtVoodoo));
        }
        if(amtToken.sub(resultAmtToken) > 0) {
            IERC20(token).transfer(msg.sender, amtToken.sub(resultAmtToken));
        }
        return (resultAmtVoodoo, resultAmtToken, liquidity);
    }

    function addLiquidityETHTaxFree(
        uint256 amtVoodoo,
        uint256 amtVoodooMin,
        uint256 amtBttMin
    )
        external
        payable
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        require(amtVoodoo != 0 && msg.value != 0, "amounts can't be 0");
        _excludeAddressFromTax(msg.sender);

        IERC20(voodoo).transferFrom(msg.sender, address(this), amtVoodoo);
        _approveTokenIfNeeded(voodoo, uniRouter);

        _includeAddressInTax(msg.sender);

        uint256 resultAmtVoodoo;
        uint256 resultAmtBtt;
        uint256 liquidity;
        (resultAmtVoodoo, resultAmtBtt, liquidity) = IUniswapV2Router(uniRouter).addLiquidityETH{value: msg.value}(
            voodoo,
            amtVoodoo,
            amtVoodooMin,
            amtBttMin,
            msg.sender,
            block.timestamp
        );

        if(amtVoodoo.sub(resultAmtVoodoo) > 0) {
            IERC20(voodoo).transfer(msg.sender, amtVoodoo.sub(resultAmtVoodoo));
        }
        return (resultAmtVoodoo, resultAmtBtt, liquidity);
    }

    function setTaxableVoodooOracle(address _voodooOracle) external onlyOperator {
        ITaxable(voodoo).setVoodooOracle(_voodooOracle);
    }

    function transferTaxOffice(address _newTaxOffice) external onlyOperator {
        ITaxable(voodoo).setTaxOffice(_newTaxOffice);
    }

    function taxFreeTransferFrom(
        address _sender,
        address _recipient,
        uint256 _amt
    ) external {
        require(taxExclusionEnabled[msg.sender], "Address not approved for tax free transfers");
        _excludeAddressFromTax(_sender);
        IERC20(voodoo).transferFrom(_sender, _recipient, _amt);
        _includeAddressInTax(_sender);
    }

    function setTaxExclusionForAddress(address _address, bool _excluded) external onlyOperator {
        taxExclusionEnabled[_address] = _excluded;
    }

    function _approveTokenIfNeeded(address _token, address _router) private {
        if (IERC20(_token).allowance(address(this), _router) == 0) {
            IERC20(_token).approve(_router, type(uint256).max);
        }
    }
}