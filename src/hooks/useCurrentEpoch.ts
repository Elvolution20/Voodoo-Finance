import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { BigNumber } from 'ethers';
import useRefresh from './useRefresh';

const useCurrentEpoch = () => {
  const [currentEpoch, setCurrentEpoch] = useState<BigNumber>(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCurrentEpoch () {
      try {
        setCurrentEpoch(await voodooFinance.getCurrentEpoch());
      } catch(err) {
        console.error(err);
      }
    }
    fetchCurrentEpoch();
  }, [setCurrentEpoch, voodooFinance, slowRefresh]);

  return currentEpoch;
};

export default useCurrentEpoch;
