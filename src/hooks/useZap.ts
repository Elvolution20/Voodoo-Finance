import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { Bank } from '../voodoo-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useZap = (bank: Bank) => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleZap = useCallback(
    (zappingToken: string, tokenName: string, amount: string) => {
      handleTransactionReceipt(
        voodooFinance.zapIn(zappingToken, tokenName, amount),
        `Zap ${amount} in ${bank.depositTokenName}.`,
      );
    },
    [bank, voodooFinance, handleTransactionReceipt],
  );
  return { onZap: handleZap };
};

export default useZap;
