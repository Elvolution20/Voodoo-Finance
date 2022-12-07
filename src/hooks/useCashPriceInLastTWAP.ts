import { useCallback, useEffect, useState } from 'react';
import useVoodooFinance from './useVoodooFinance';
import config from '../config';
import { BigNumber } from 'ethers';

const useCashPriceInLastTWAP = () => {
  const [price, setPrice] = useState<BigNumber>(BigNumber.from(0));
  const voodooFinance = useVoodooFinance();

  const fetchCashPrice = useCallback(async () => {
    setPrice(await voodooFinance.getVoodooPriceInLastTWAP());
  }, [voodooFinance]);

  useEffect(() => {
    fetchCashPrice().catch((err) => console.error(`Failed to fetch VOODOO price: ${err.stack}`));
    const refreshInterval = setInterval(fetchCashPrice, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPrice, voodooFinance, fetchCashPrice]);

  return price;
};

export default useCashPriceInLastTWAP;
