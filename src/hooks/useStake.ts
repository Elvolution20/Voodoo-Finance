import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { Bank } from '../voodoo-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';

const useStake = (bank: Bank) => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      const amountBn = parseUnits(amount, bank.depositToken.decimal);
      handleTransactionReceipt(
        voodooFinance.stake(bank.contract, bank.poolId, amountBn),
        `Stake ${amount} ${bank.depositTokenName} to ${bank.contract}`,
      );
    },
    [bank, voodooFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStake;
