import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useVoodooFinance from './useVoodooFinance';
import useRefresh from './useRefresh';

const useEarningsOnStaking = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;

  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await voodooFinance.getEarningsOnStaking());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [isUnlocked, voodooFinance, slowRefresh]);

  return balance;
};

export default useEarningsOnStaking;
