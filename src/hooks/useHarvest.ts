import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { Bank } from '../voodoo-finance';

const useHarvest = (bank: Bank) => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(
      voodooFinance.harvest(bank.contract, bank.poolId),
      `Claim ${bank.earnTokenName} from ${bank.contract}`,
    );
  }, [bank, voodooFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useHarvest;
