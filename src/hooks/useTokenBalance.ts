import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../voodoo-finance/ERC20';
import useVoodooFinance from './useVoodooFinance';
import config from '../config';

const useTokenBalance = (token: ERC20) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    setBalance(await token.balanceOf(voodooFinance.myAccount));
  }, [token, voodooFinance.myAccount]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(`Failed to fetch token balance: ${err.stack}`));
      let refreshInterval = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [isUnlocked, token, fetchBalance, voodooFinance]);

  return balance;
};

export default useTokenBalance;
