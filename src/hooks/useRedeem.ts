import useVoodooFinance from './useVoodooFinance';
import { useCallback } from 'react';

import { Bank } from '../voodoo-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeem = (bank: Bank) => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    handleTransactionReceipt(voodooFinance.exit(bank.contract, bank.poolId), `Redeem ${bank.contract}`);
  }, [bank, voodooFinance, handleTransactionReceipt]);

  return { onRedeem: handleRedeem };
};

export default useRedeem;
