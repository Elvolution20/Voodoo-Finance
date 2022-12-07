import useVoodooFinance from './useVoodooFinance';
import { useCallback } from 'react';

import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeemOnStaking = (description?: string) => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    const alertDesc = description || 'Redeem VSHARE from Staking';
    handleTransactionReceipt(voodooFinance.exitFromStaking(), alertDesc);
  }, [voodooFinance, description, handleTransactionReceipt]);
  return { onRedeem: handleRedeem };
};

export default useRedeemOnStaking;
