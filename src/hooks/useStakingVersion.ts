import { useCallback, useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useStakedBalanceOnStaking from './useStakedBalanceOnStaking';

const useStakingVersion = () => {
  const [stakingVersion, setStakingVersion] = useState('latest');
  const voodooFinance = useVoodooFinance();
  const stakedBalance = useStakedBalanceOnStaking();

  const updateState = useCallback(async () => {
    setStakingVersion(await voodooFinance.fetchStakingVersionOfUser());
  }, [voodooFinance?.isUnlocked, stakedBalance]);

  useEffect(() => {
    if (voodooFinance?.isUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [voodooFinance?.isUnlocked, stakedBalance]);

  return stakingVersion;
};

export default useStakingVersion;
