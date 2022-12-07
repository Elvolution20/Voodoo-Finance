import React, { useCallback, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';
import { useWallet } from 'use-wallet';

import BondImage from '../../assets/img/home.png';
import Page from '../../components/Page';
import PageHeader from '../../components/PageHeader';
import Spacer from '../../components/Spacer';
import UnlockWallet from '../../components/UnlockWallet';
import useBondsPurchasable from '../../hooks/useBondsPurchasable';
import useBondStats from '../../hooks/useBondStats';
import useCashPriceInLastTWAP from '../../hooks/useCashPriceInLastTWAP';
import useTokenBalance from '../../hooks/useTokenBalance';
import useVoodooFinance from '../../hooks/useVoodooFinance';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { getDisplayBalance } from '../../utils/formatBalance';
import { BOND_REDEEM_PRICE, BOND_REDEEM_PRICE_BN } from '../../voodoo-finance/constants';
import ExchangeCard from './components/ExchangeCard';
import ExchangeStat from './components/ExchangeStat';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${BondImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

const Bond: React.FC = () => {
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const voodooFinance = useVoodooFinance();
  const addTransaction = useTransactionAdder();
  const bondStat = useBondStats();
  const cashPrice = useCashPriceInLastTWAP();
  const bondsPurchasable = useBondsPurchasable();

  const bondBalance = useTokenBalance(voodooFinance?.VBOND);

  const handleBuyBonds = useCallback(
    async (amount: string) => {
      const tx = await voodooFinance.buyBonds(amount);
      addTransaction(tx, {
        summary: `Buy ${Number(amount).toFixed(2)} VBOND with ${amount} VOODOO`,
      });
    },
    [voodooFinance, addTransaction],
  );

  const handleRedeemBonds = useCallback(
    async (amount: string) => {
      const tx = await voodooFinance.redeemBonds(amount);
      addTransaction(tx, { summary: `Redeem ${amount} VBOND` });
    },
    [voodooFinance, addTransaction],
  );
  const isBondRedeemable = useMemo(() => cashPrice.gt(BOND_REDEEM_PRICE_BN), [cashPrice]);
  const isBondPurchasable = useMemo(() => Number(bondStat?.tokenInBtt) < 1.01, [bondStat]);

  return (
    <Switch>
      <Page>
        <BackgroundImage />
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader icon={'🏦'} title="Buy & Redeem Bonds" subtitle="Earn premiums upon redemption" />
            </Route>
            <StyledBond>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Purchase"
                  fromToken={voodooFinance.VOODOO}
                  fromTokenName="VOODOO"
                  toToken={voodooFinance.VBOND}
                  toTokenName="VBOND"
                  priceDesc={
                    !isBondPurchasable
                      ? 'VOODOO is over peg'
                      : getDisplayBalance(bondsPurchasable, 18, 4) + ' VBOND available for purchase'
                  }
                  onExchange={handleBuyBonds}
                  disabled={!bondStat || isBondRedeemable}
                />
              </StyledCardWrapper>
              <StyledStatsWrapper>
                <ExchangeStat
                  tokenName="VOODOO"
                  description="Last-Hour TWAP Price"
                  price={getDisplayBalance(cashPrice, 18, 4)}
                />
                <Spacer size="md" />
                <ExchangeStat
                  tokenName="VBOND"
                  description="Current Price: (VOODOO)^2"
                  price={Number(bondStat?.tokenInBtt).toFixed(2) || '-'}
                />
              </StyledStatsWrapper>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Redeem"
                  fromToken={voodooFinance.VBOND}
                  fromTokenName="VBOND"
                  toToken={voodooFinance.VOODOO}
                  toTokenName="VOODOO"
                  priceDesc={`${getDisplayBalance(bondBalance)} VBOND Available in wallet`}
                  onExchange={handleRedeemBonds}
                  disabled={!bondStat || bondBalance.eq(0) || !isBondRedeemable}
                  disabledDescription={!isBondRedeemable ? `Enabled when VOODOO > ${BOND_REDEEM_PRICE}BTT` : null}
                />
              </StyledCardWrapper>
            </StyledBond>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const StyledBond = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const StyledStatsWrapper = styled.div`
  display: flex;
  flex: 0.8;
  margin: 0 20px;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 80%;
    margin: 16px 0;
  }
`;

export default Bond;
