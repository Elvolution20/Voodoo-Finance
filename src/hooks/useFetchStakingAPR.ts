import { useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import useRefresh from './useRefresh';

const useFetchStakingAPR = () => {
  const [apr, setApr] = useState<number>(0);
  const voodooFinance = useVoodooFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchStakingAPR() {
      try {
        setApr(await voodooFinance.getStakingAPR());
      } catch(err){
        console.error(err);
      }
    }
   fetchStakingAPR();
  }, [setApr, voodooFinance, slowRefresh]);

  return apr;
};

export default useFetchStakingAPR;
