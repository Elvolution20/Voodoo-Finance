import { useEffect, useState } from 'react';
import useVoodooFinance from '../useVoodooFinance';
import { VShareSwapperStat } from '../../voodoo-finance/types';
import useRefresh from '../useRefresh';

const useVShareSwapperStats = (account: string) => {
  const [stat, setStat] = useState<VShareSwapperStat>();
  const { fastRefresh/*, slowRefresh*/ } = useRefresh();
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    async function fetchVShareSwapperStat() {
      try{
        if(voodooFinance.myAccount) {
          setStat(await voodooFinance.getVShareSwapperStat(account));
        }
      }
      catch(err){
        console.error(err);
      }
    }
    fetchVShareSwapperStat();
  }, [setStat, voodooFinance, fastRefresh, account]);

  return stat;
};

export default useVShareSwapperStats;