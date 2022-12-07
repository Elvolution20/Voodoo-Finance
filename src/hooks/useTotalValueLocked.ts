import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useRefresh from './useRefresh';

const useTotalValueLocked = () => {
  const [totalValueLocked, setTotalValueLocked] = useState<Number>(0);
  const { slowRefresh } = useRefresh();
  const voodooFinance = useVoodooFinance();

  useEffect(() => {
    async function fetchTVL() {
      try {
        setTotalValueLocked(await voodooFinance.getTotalValueLocked());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchTVL();
  }, [setTotalValueLocked, voodooFinance, slowRefresh]);

  return totalValueLocked;
};

export default useTotalValueLocked;
