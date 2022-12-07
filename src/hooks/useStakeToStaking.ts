import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useStakeToStaking = () => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      handleTransactionReceipt(voodooFinance.stakeShareToStaking(amount), `Stake ${amount} VSHARE to the staking`);
    },
    [voodooFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStakeToStaking;
