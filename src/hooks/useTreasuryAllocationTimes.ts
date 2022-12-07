import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { AllocationTime } from '../voodoo-finance/types';
import useRefresh from './useRefresh';


const useTreasuryAllocationTimes = () => {
  const { slowRefresh } = useRefresh();
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const voodooFinance = useVoodooFinance();
  useEffect(() => {
    if (voodooFinance) {
      voodooFinance.getTreasuryNextAllocationTime().then(setTime);
    }
  }, [voodooFinance, slowRefresh]);
  return time;
};

export default useTreasuryAllocationTimes;
