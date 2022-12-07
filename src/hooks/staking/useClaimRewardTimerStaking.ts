import { useEffect, useState } from 'react';
import useVoodooFinance from '../useVoodooFinance';
import { AllocationTime } from '../../voodoo-finance/types';

const useClaimRewardTimerStaking = () => {
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    if (voodooFinance) {
      voodooFinance.getUserClaimRewardTime().then(setTime);
    }
  }, [voodooFinance]);
  return time;
};

export default useClaimRewardTimerStaking;
