import React, { useMemo, useState } from 'react';
import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import HomeImage from '../../assets/img/home.png';
import useLpStats from '../../hooks/useLpStats';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import useVoodooStats from '../../hooks/useVoodooStats';
import TokenInput from '../../components/TokenInput';
import useVoodooFinance from '../../hooks/useVoodooFinance';
import { useWallet } from 'use-wallet';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';
import useApproveTaxOffice from '../../hooks/useApproveTaxOffice';
import { ApprovalState } from '../../hooks/useApprove';
import useProvideVoodooBttLP from '../../hooks/useProvideVoodooBttLP';
import { Alert } from '@material-ui/lab';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
  }
`;
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const ProvideLiquidity = () => {
  const [voodooAmount, setVoodooAmount] = useState(0);
  const [bttAmount, setBttAmount] = useState(0);
  const [lpTokensAmount, setLpTokensAmount] = useState(0);
  const { balance } = useWallet();
  const voodooStats = useVoodooStats();
  const voodooFinance = useVoodooFinance();
  const [approveTaxOfficeStatus, approveTaxOffice] = useApproveTaxOffice();
  const voodooBalance = useTokenBalance(voodooFinance.VOODOO);
  const bttBalance = (balance / 1e18).toFixed(4);
  const { onProvideVoodooBttLP } = useProvideVoodooBttLP();
  const voodooBttLpStats = useLpStats('VOODOO-BTT-LP');

  const voodooLPStats = useMemo(() => (voodooBttLpStats ? voodooBttLpStats : null), [voodooBttLpStats]);
  const voodooPriceInBTT = useMemo(() => (voodooStats ? Number(voodooStats.tokenInBtt).toFixed(2) : null), [voodooStats]);
  const bttPriceInVOODOO = useMemo(() => (voodooStats ? Number(1 / voodooStats.tokenInBtt).toFixed(2) : null), [voodooStats]);
  // const classes = useStyles();

  const handleVoodooChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setVoodooAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setVoodooAmount(e.currentTarget.value);
    const quoteFromSpooky = await voodooFinance.quoteFromSpooky(e.currentTarget.value, 'VOODOO');
    setBttAmount(quoteFromSpooky);
    setLpTokensAmount(quoteFromSpooky / voodooLPStats.bttAmount);
  };

  const handleBttChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setBttAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setBttAmount(e.currentTarget.value);
    const quoteFromSpooky = await voodooFinance.quoteFromSpooky(e.currentTarget.value, 'BTT');
    setVoodooAmount(quoteFromSpooky);

    setLpTokensAmount(quoteFromSpooky / voodooLPStats.tokenAmount);
  };
  const handleVoodooSelectMax = async () => {
    const quoteFromSpooky = await voodooFinance.quoteFromSpooky(getDisplayBalance(voodooBalance), 'VOODOO');
    setVoodooAmount(getDisplayBalance(voodooBalance));
    setBttAmount(quoteFromSpooky);
    setLpTokensAmount(quoteFromSpooky / voodooLPStats.bttAmount);
  };
  const handleBttSelectMax = async () => {
    const quoteFromSpooky = await voodooFinance.quoteFromSpooky(bttBalance, 'BTT');
    setBttAmount(bttBalance);
    setVoodooAmount(quoteFromSpooky);
    setLpTokensAmount(bttBalance / voodooLPStats.bttAmount);
  };
  return (
    <Page>
      <BackgroundImage />
      <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
        Provide Liquidity
      </Typography>

      <Grid container justify="center">
        <Box style={{ width: '600px' }}>
          <Alert variant="filled" severity="warning" style={{ marginBottom: '10px' }}>
            <b>This and <a href="https://bttswap.finance/"  rel="noopener noreferrer" target="_blank">BitTorentswap</a> are the only ways to provide Liquidity on VOODOO-BTT pair without paying tax.</b>
          </Alert>
          <Grid item xs={12} sm={12}>
            <Paper>
              <Box mt={4}>
                <Grid item xs={12} sm={12} style={{ borderRadius: 15 }}>
                  <Box p={4}>
                    <Grid container>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleVoodooSelectMax}
                          onChange={handleVoodooChange}
                          value={voodooAmount}
                          max={getDisplayBalance(voodooBalance)}
                          symbol={'VOODOO'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleBttSelectMax}
                          onChange={handleBttChange}
                          value={bttAmount}
                          max={bttBalance}
                          symbol={'BTT'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <p>1 VOODOO = {voodooPriceInBTT} BTT</p>
                        <p>1 BTT = {bttPriceInVOODOO} VOODOO</p>
                        <p>LP tokens ≈ {lpTokensAmount.toFixed(2)}</p>
                      </Grid>
                      <Grid xs={12} justifyContent="center" style={{ textAlign: 'center' }}>
                        {approveTaxOfficeStatus === ApprovalState.APPROVED ? (
                          <Button
                            variant="contained"
                            onClick={() => onProvideVoodooBttLP(bttAmount.toString(), voodooAmount.toString())}
                            color="primary"
                            style={{ margin: '0 10px', color: '#fff' }}
                          >
                            Supply
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => approveTaxOffice()}
                            color="secondary"
                            style={{ margin: '0 10px' }}
                          >
                            Approve
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Box>
      </Grid>
    </Page>
  );
};

export default ProvideLiquidity;
