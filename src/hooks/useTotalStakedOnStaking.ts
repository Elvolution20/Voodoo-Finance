import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useVoodooFinance from './useVoodooFinance';
import useRefresh from './useRefresh';

const useTotalStakedOnStaking = () => {
  const [totalStaked, setTotalStaked] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = voodooFinance?.isUnlocked;

  useEffect(() => {
    async function fetchTotalStaked() {
      try {
        setTotalStaked(await voodooFinance.getTotalStakedInStaking());
      } catch(err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
     fetchTotalStaked();
    }
  }, [isUnlocked, slowRefresh, voodooFinance]);

  return totalStaked;
};

export default useTotalStakedOnStaking;
