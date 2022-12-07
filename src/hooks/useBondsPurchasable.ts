import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

import useVoodooFinance from './useVoodooFinance';


const useBondsPurchasable = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    async function fetchBondsPurchasable() {
        try {
            setBalance(await voodooFinance.getBondsPurchasable());
        }
        catch(err) {
            console.error(err);
        }
      }
    fetchBondsPurchasable();
  }, [setBalance, voodooFinance]);

  return balance;
};

export default useBondsPurchasable;
