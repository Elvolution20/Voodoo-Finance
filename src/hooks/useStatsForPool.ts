import { useCallback, useState, useEffect } from 'react';
import useVoodooFinance from './useVoodooFinance';
import { Bank } from '../voodoo-finance';
import { PoolStats } from '../voodoo-finance/types';
import config from '../config';

const useStatsForPool = (bank: Bank) => {
  const voodooFinance = useVoodooFinance();

  const [poolAPRs, setPoolAPRs] = useState<PoolStats>();

  const fetchAPRsForPool = useCallback(async () => {
    setPoolAPRs(await voodooFinance.getPoolAPRs(bank));
  }, [voodooFinance, bank]);

  useEffect(() => {
    fetchAPRsForPool().catch((err) => console.error(`Failed to fetch VBOND price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAPRsForPool, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPoolAPRs, voodooFinance, fetchAPRsForPool]);

  return poolAPRs;
};

export default useStatsForPool;
