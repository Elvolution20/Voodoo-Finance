import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { TokenStat } from '../voodoo-finance/types';
import useRefresh from './useRefresh';

const useBondStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    async function fetchBondPrice() {
      try {
        setStat(await voodooFinance.getBondStat());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchBondPrice();
  }, [setStat, voodooFinance, slowRefresh]);

  return stat;
};

export default useBondStats;
