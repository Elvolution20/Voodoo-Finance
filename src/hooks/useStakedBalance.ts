import { useCallback, useEffect, useState } from 'react';

import { BigNumber } from 'ethers';
import useVoodooFinance from './useVoodooFinance';
import { ContractName } from '../voodoo-finance';
import config from '../config';

const useStakedBalance = (poolName: ContractName, poolId: Number) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await voodooFinance.stakedBalanceOnBank(poolName, poolId, voodooFinance.myAccount);
    setBalance(balance);
  }, [poolName, poolId, voodooFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [isUnlocked, poolName, setBalance, voodooFinance, fetchBalance]);

  return balance;
};

export default useStakedBalance;
