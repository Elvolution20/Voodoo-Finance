import { useCallback, useEffect, useState } from 'react';
import useVoodooFinance from '../useVoodooFinance';
import { useWallet } from 'use-wallet';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

const useEstimateVShare = (vbondAmount: string) => {
  const [estimateAmount, setEstimateAmount] = useState<string>('');
  const { account } = useWallet();
  const voodooFinance = useVoodooFinance();

  const estimateAmountOfVShare = useCallback(async () => {
    const vbondAmountBn = parseUnits(vbondAmount);
    const amount = await voodooFinance.estimateAmountOfVShare(vbondAmountBn.toString());
    setEstimateAmount(amount);
  }, [account]);

  useEffect(() => {
    if (account) {
      estimateAmountOfVShare().catch((err) => console.error(`Failed to get estimateAmountOfVShare: ${err.stack}`));
    }
  }, [account, estimateAmountOfVShare]);

  return estimateAmount;
};

export default useEstimateVShare;