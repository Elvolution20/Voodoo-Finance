import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useHarvestFromStaking = () => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(voodooFinance.harvestCashFromStaking(), 'Claim VOODOO from Staking');
  }, [voodooFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useHarvestFromStaking;
