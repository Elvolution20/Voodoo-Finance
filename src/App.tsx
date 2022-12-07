import { ThemeProvider as TP } from '@material-ui/core/styles';
import React, { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider as TP1 } from 'styled-components';
import { UseWalletProvider } from 'use-wallet';

import Loader from './components/Loader';
import Popups from './components/Popups';
import config from './config';
import BanksProvider from './contexts/Banks';
import ModalsProvider from './contexts/Modals';
import { RefreshContextProvider } from './contexts/RefreshContext';
import VoodooFinanceProvider from './contexts/VoodooFinanceProvider';
import usePromptNetwork from './hooks/useNetworkPrompt';
import newTheme from './newTheme';
import store from './state';
import Updaters from './state/Updaters';
import theme from './theme';

const Home = lazy(() => import('./views/Home'));
const Farming = lazy(() => import('./views/Farming'));
const Staking = lazy(() => import('./views/Staking'));
const Bond = lazy(() => import('./views/Bond'));
const Liquidity = lazy(() => import('./views/Liquidity'));

const NoMatch = () => (
  <h3 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
    URL Not Found. <a href="/">Go back home.</a>
  </h3>
);

const App: React.FC = () => {
  // Clear localStorage for mobile users
  if (typeof localStorage.version_app === 'undefined' || localStorage.version_app !== '1.1') {
    localStorage.clear();
    localStorage.setItem('connectorId', '');
    localStorage.setItem('version_app', '1.1');
  }

  usePromptNetwork();

  return (
    <Providers>
      <Router>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/farming">
              <Farming />
            </Route>
            <Route path="/staking">
              <Staking />
            </Route>
            <Route path="/bond">
              <Bond />
            </Route>
            <Route path="/liquidity">
              <Liquidity />
            </Route>
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
        </Suspense>
      </Router>
    </Providers>
  );
};

const Providers: React.FC = ({ children }) => {
  return (
    <TP1 theme={theme}>
      <TP theme={newTheme}>
        <UseWalletProvider
          chainId={config.chainId}
          connectors={{
            walletconnect: { rpcUrl: config.defaultProvider },
            walletlink: {
              url: config.defaultProvider,
              appName: 'Voodoo Finance',
              appLogoUrl: 'https://github.com/voodoofinance/voodoofinance-assets/blob/master/logo_voodoo_NoBG.png',
            },
          }}
        >
          <Provider store={store}>
            <Updaters />
            <RefreshContextProvider>
              <VoodooFinanceProvider>
                <ModalsProvider>
                  <BanksProvider>
                    <>
                      <Popups />
                      {children}
                    </>
                  </BanksProvider>
                </ModalsProvider>
              </VoodooFinanceProvider>
            </RefreshContextProvider>
          </Provider>
        </UseWalletProvider>
      </TP>
    </TP1>
  );
};

export default App;
