import { useEffect, useState } from 'react';
import useVoodooFinance from './../useVoodooFinance';
import useRefresh from '../useRefresh';

const useWithdrawCheck = () => {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const voodooFinance = useVoodooFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = voodooFinance?.isUnlocked;

  useEffect(() => {
    async function canUserWithdraw() {
      try {
        setCanWithdraw(await voodooFinance.canUserUnstakeFromStaking());
      } catch (err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
      canUserWithdraw();
    }
  }, [isUnlocked, voodooFinance, slowRefresh]);

  return canWithdraw;
};

export default useWithdrawCheck;
