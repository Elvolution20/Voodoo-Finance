import { useCallback } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from '../utils/constants'

const useProvideVoodooBttLP = () => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideVoodooBttLP = useCallback(
    (bttAmount: string, voodooAmount: string) => {
      const voodooAmountBn = parseUnits(voodooAmount);
      handleTransactionReceipt(
        voodooFinance.provideVoodooBttLP(bttAmount, voodooAmountBn),
        `Provide Voodoo-BTT LP ${voodooAmount} ${bttAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [voodooFinance, handleTransactionReceipt],
  );
  return { onProvideVoodooBttLP: handleProvideVoodooBttLP };
};

export default useProvideVoodooBttLP;
