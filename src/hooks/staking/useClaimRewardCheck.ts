import { useEffect, useState } from 'react';
import useRefresh from '../useRefresh';
import useVoodooFinance from './../useVoodooFinance';

const useClaimRewardCheck = () => {
  const  { slowRefresh } = useRefresh();
  const [canClaimReward, setCanClaimReward] = useState(false);
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;

  useEffect(() => {
    async function canUserClaimReward() {
      try {
        setCanClaimReward(await voodooFinance.canUserClaimRewardFromStaking());
      } catch(err){
        console.error(err);
      };
    }
    if (isUnlocked) {
      canUserClaimReward();
    }
  }, [isUnlocked, slowRefresh, voodooFinance]);

  return canClaimReward;
};

export default useClaimRewardCheck;
