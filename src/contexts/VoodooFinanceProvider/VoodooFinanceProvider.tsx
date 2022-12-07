import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import VoodooFinance from '../../voodoo-finance';
import config from '../../config';

export interface VoodooFinanceContext {
  voodooFinance?: VoodooFinance;
}

export const Context = createContext<VoodooFinanceContext>({ voodooFinance: null });

export const VoodooFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [voodooFinance, setVoodooFinance] = useState<VoodooFinance>();

  useEffect(() => {
    if (!voodooFinance) {
      const voodoo = new VoodooFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        voodoo.unlockWallet(ethereum, account);
      }
      setVoodooFinance(voodoo);
    } else if (account) {
      voodooFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, voodooFinance]);

  return <Context.Provider value={{ voodooFinance }}>{children}</Context.Provider>;
};
