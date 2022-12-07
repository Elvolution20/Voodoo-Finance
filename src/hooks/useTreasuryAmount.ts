import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useVoodooFinance from './useVoodooFinance';

const useTreasuryAmount = () => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    if (voodooFinance) {
      const { Treasury } = voodooFinance.contracts;
      voodooFinance.VOODOO.balanceOf(Treasury.address).then(setAmount);
    }
  }, [voodooFinance]);
  return amount;
};

export default useTreasuryAmount;
