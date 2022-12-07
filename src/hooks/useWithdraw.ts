import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { Bank } from '../voodoo-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';

const useWithdraw = (bank: Bank) => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleWithdraw = useCallback(
    (amount: string) => {
      const amountBn = parseUnits(amount, bank.depositToken.decimal);
      handleTransactionReceipt(
        voodooFinance.unstake(bank.contract, bank.poolId, amountBn),
        `Withdraw ${amount} ${bank.depositTokenName} from ${bank.contract}`,
      );
    },
    [bank, voodooFinance, handleTransactionReceipt],
  );
  return { onWithdraw: handleWithdraw };
};

export default useWithdraw;
