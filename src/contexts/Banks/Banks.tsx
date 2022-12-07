import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useVoodooFinance from '../../hooks/useVoodooFinance';
import { Bank } from '../../voodoo-finance';
import config, { bankDefinitions } from '../../config';

const Banks: React.FC = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const voodooFinance = useVoodooFinance();
  const isUnlocked = voodooFinance?.isUnlocked;

  const fetchPools = useCallback(async () => {
    const banks: Bank[] = [];

    for (const bankInfo of Object.values(bankDefinitions)) {
      if (bankInfo.finished) {
        if (!voodooFinance.isUnlocked) continue;

        // only show pools staked by user
        const balance = await voodooFinance.stakedBalanceOnBank(
          bankInfo.contract,
          bankInfo.poolId,
          voodooFinance.myAccount,
        );
        if (balance.lte(0)) {
          continue;
        }
      }
      banks.push({
        ...bankInfo,
        address: config.deployments[bankInfo.contract].address,
        depositToken: voodooFinance.externalTokens[bankInfo.depositTokenName],
        earnToken: bankInfo.earnTokenName === 'VOODOO' ? voodooFinance.VOODOO : voodooFinance.VSHARE,
      });
    }
    banks.sort((a, b) => (a.sort > b.sort ? 1 : -1));
    setBanks(banks);
  }, [voodooFinance, setBanks]);

  useEffect(() => {
    if (voodooFinance) {
      fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
    }
  }, [isUnlocked, voodooFinance, fetchPools]);

  return <Context.Provider value={{ banks }}>{children}</Context.Provider>;
};

export default Banks;
