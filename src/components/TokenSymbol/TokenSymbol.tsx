import vBondLogo from '../../assets/img/vbond.png';
import vShareLogoPNG from '../../assets/img/vshare.png';
import vShareLogo from '../../assets/img/vshare.png';
import React from 'react';

import wbttLogo from '../../assets/img/btt_logo.png';
import sunLogo from '../../assets/img/sun_logo.png';
import tronLogo from '../../assets/img/tron.png';
import voodooLogoPNG from '../../assets/img/vcash.png';
//Graveyard ecosystem logos
import voodooLogo from '../../assets/img/vcash.png';
import voodooBttLpLogo from '../../assets/img/voodoo_btt_lp.png';
import vshareBttLpLogo from '../../assets/img/vshare_btt_lp.png';
import jstLogo from '../../assets/img/jst_logo.png';


const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  VOODOO: voodooLogo,
  VOODOOPNG: voodooLogoPNG,
  VSHAREPNG: vShareLogoPNG,
  VSHARE: vShareLogo,
  VBOND: vBondLogo,
  WBTT: wbttLogo,
  TRON: tronLogo,
  SUN: sunLogo,
  JST: jstLogo,

  'VOODOO-BTT-LP': voodooBttLpLogo,
  'VSHARE-BTT-LP': vshareBttLpLogo,
};

type LogoProps = {
  symbol: string;
  size?: number;
};

const TokenSymbol: React.FC<LogoProps> = ({ symbol, size = 64 }) => {
  if (!logosBySymbol[symbol]) {
    throw new Error(`Invalid Token Logo symbol: ${symbol}`);
  }
  return <img src={logosBySymbol[symbol]} alt={`${symbol} Logo`} width={size} height={size} />;
};

export default TokenSymbol;
