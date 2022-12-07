import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useWithdrawFromStaking = () => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleWithdraw = useCallback(
    (amount: string) => {
      handleTransactionReceipt(
        voodooFinance.withdrawShareFromStaking(amount),
        `Withdraw ${amount} VSHARE from the staking`,
      );
    },
    [voodooFinance, handleTransactionReceipt],
  );
  return { onWithdraw: handleWithdraw };
};

export default useWithdrawFromStaking;
