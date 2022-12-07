import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { TokenStat } from '../voodoo-finance/types';
import useRefresh from './useRefresh';

const useVoodooStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { fastRefresh } = useRefresh();
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    async function fetchVoodooPrice(){
      try {
        setStat(await voodooFinance.getVoodooStat());
      }
      catch(err){
        console.error(err)
      }
    }
    fetchVoodooPrice();
  }, [setStat, voodooFinance, fastRefresh]);

  return stat;
};

export default useVoodooStats;
