import { useCallback, useEffect, useState } from 'react';

import useVoodooFinance from './useVoodooFinance';
import config from '../config';
import ERC20 from '../voodoo-finance/ERC20';

const useStakedTokenPriceInDollars = (stakedTokenName: string, stakedToken: ERC20) => {
  const [stakedTokenPriceInDollars, setStakedTokenPriceInDollars] = useState('0');
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await voodooFinance.getDepositTokenPriceInDollars(stakedTokenName, stakedToken);
    setStakedTokenPriceInDollars(balance);
  }, [stakedToken, stakedTokenName, voodooFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshStakedTokenPriceInDollars = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshStakedTokenPriceInDollars);
    }
  }, [isUnlocked, setStakedTokenPriceInDollars, voodooFinance, fetchBalance]);

  return stakedTokenPriceInDollars;
};

export default useStakedTokenPriceInDollars;
