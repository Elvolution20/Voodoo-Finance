import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { TokenStat } from '../voodoo-finance/types';
import useRefresh from './useRefresh';

const useShareStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    async function fetchSharePrice() {
      try {
        setStat(await voodooFinance.getShareStat());
      } catch(err){
        console.error(err)
      }
    }
    fetchSharePrice();
  }, [setStat, voodooFinance, slowRefresh]);

  return stat;
};

export default useShareStats;
