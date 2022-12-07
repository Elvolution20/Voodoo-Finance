import { useCallback } from 'react';
import useVoodooFinance from '../useVoodooFinance';
import useHandleTransactionReceipt from '../useHandleTransactionReceipt';
// import { BigNumber } from "ethers";
import { parseUnits } from 'ethers/lib/utils';


const useSwapVBondToVShare = () => {
  const voodooFinance = useVoodooFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapVShare = useCallback(
  	(vbondAmount: string) => {
	  	const vbondAmountBn = parseUnits(vbondAmount, 18);
	  	handleTransactionReceipt(
	  		voodooFinance.swapVBondToVShare(vbondAmountBn),
	  		`Swap ${vbondAmount} VBond to VShare`
	  	);
  	},
  	[voodooFinance, handleTransactionReceipt]
  );
  return { onSwapVShare: handleSwapVShare };
};

export default useSwapVBondToVShare;