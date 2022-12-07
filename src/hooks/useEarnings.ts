import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useVoodooFinance from './useVoodooFinance';
import { ContractName } from '../voodoo-finance';
import config from '../config';

const useEarnings = (poolName: ContractName, earnTokenName: String, poolId: Number) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await voodooFinance.earnedFromBank(poolName, earnTokenName, poolId, voodooFinance.myAccount);
    setBalance(balance);
  }, [poolName, earnTokenName, poolId, voodooFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [isUnlocked, poolName, voodooFinance, fetchBalance]);

  return balance;
};

export default useEarnings;
