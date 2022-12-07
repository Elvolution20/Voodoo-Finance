import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { TokenStat } from '../voodoo-finance/types';
import useRefresh from './useRefresh';

const useCashPriceInEstimatedTWAP = () => {
  const [stat, setStat] = useState<TokenStat>();
  const voodooFinance = useVoodooFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCashPrice() {
      try {
        setStat(await voodooFinance.getVoodooStatInEstimatedTWAP());
      }catch(err) {
        console.error(err);
      }
    }
    fetchCashPrice();
  }, [setStat, voodooFinance, slowRefresh]);

  return stat;
};

export default useCashPriceInEstimatedTWAP;
