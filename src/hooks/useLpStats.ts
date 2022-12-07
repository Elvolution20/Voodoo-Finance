import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { LPStat } from '../voodoo-finance/types';
import useRefresh from './useRefresh';

const useLpStats = (lpTicker: string) => {
  const [stat, setStat] = useState<LPStat>();
  const { slowRefresh } = useRefresh();
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    async function fetchLpPrice() {
      try{
        setStat(await voodooFinance.getLPStat(lpTicker));
      }
      catch(err){
        console.error(err);
      }
    }
    fetchLpPrice();
  }, [setStat, voodooFinance, slowRefresh, lpTicker]);

  return stat;
};

export default useLpStats;
