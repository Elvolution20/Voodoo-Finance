import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useVoodooFinance from './useVoodooFinance';
import useRefresh from './useRefresh';

const useStakedBalanceOnStaking = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;
  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await voodooFinance.getStakedSharesOnStaking());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [slowRefresh, isUnlocked, voodooFinance]);
  return balance;
};

export default useStakedBalanceOnStaking;
