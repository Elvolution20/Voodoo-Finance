import { BankInfo } from './voodoo-finance';
import { Configuration } from './voodoo-finance/config';

const configurations: { [env: string]: Configuration } = {
  development: {
    chainId: 1029,
    networkName: 'BitTorrent Chain Donau',
    bttscanUrl: 'https://testscan.bittorrentchain.io/',
    defaultProvider: 'https://pre-rpc.bittorrentchain.io/',
    deployments: require('./voodoo-finance/deployments/deployments.testing.json'),
    externalTokens: {
      WBTT: ['0xf1277d1ed8ad466beddf92ef448a132661956621', 18],
      USDD: ['0xb7f24e6e708eabfaa9e64b40ee21a5adbffb51d6', 6],
      TRON: ['0x14f0C98e6763a5E13be5CE014d36c2b69cD94a1e', 18],
      JST: ['0x2317610e609674e53D9039aaB85D8cAd8485A7c5', 0],
      SUN: ['0x39523112753956d19A3d6a30E758bd9FF7a8F3C0', 9],
      'USDD-BTT-LP': ['0xE7e3461C2C03c18301F66Abc9dA1F385f45047bA', 18],
      'VOODOO-BTT-LP': ['0x13Fe199F19c8F719652985488F150762A5E9c3A8', 18],
      'VSHARE-BTT-LP': ['0x20bc90bB41228cb9ab412036F80CE4Ef0cAf1BD5', 18],
    },
    baseLaunchDate: new Date('2022-06-02 13:00:00Z'),
    bondLaunchesAt: new Date('2022-11-03T15:00:00Z'),
    stakingLaunchesAt: new Date('2022-11-11T00:00:00Z'),
    refreshInterval: 10000,
  },
  production: {
    chainId: 1029,
    networkName: 'BitTorrent Chain Donau',
    bttscanUrl: 'https://testscan.bittorrentchain.io/',
    defaultProvider: 'https://pre-rpc.bittorrentchain.io/',
    deployments: require('./voodoo-finance/deployments/deployments.testing.json'),
    externalTokens: {
      WBTT: ['0xf1277d1ed8ad466beddf92ef448a132661956621', 18],
      USDD: ['0xb7f24e6e708eabfaa9e64b40ee21a5adbffb51d6', 6],
      TRON: ['0x14f0C98e6763a5E13be5CE014d36c2b69cD94a1e', 18],
      JST: ['0x2317610e609674e53D9039aaB85D8cAd8485A7c5', 0],
      SUN: ['0x39523112753956d19A3d6a30E758bd9FF7a8F3C0', 9],
      'USDD-BTT-LP': ['0xE7e3461C2C03c18301F66Abc9dA1F385f45047bA', 18],
      'VOODOO-BTT-LP': ['0x13Fe199F19c8F719652985488F150762A5E9c3A8', 18],
      'VSHARE-BTT-LP': ['0x20bc90bB41228cb9ab412036F80CE4Ef0cAf1BD5', 18],
    },
    baseLaunchDate: new Date('2022-06-02 13:00:00Z'),
    bondLaunchesAt: new Date('2022-11-03T15:00:00Z'),
    stakingLaunchesAt: new Date('2022-11-11T00:00:00Z'),
    refreshInterval: 10000,
  },
};

export const bankDefinitions: { [contractName: string]: BankInfo } = {
  /*
  Explanation:
  name: description of the card
  poolId: the poolId assigned in the contract
  sectionInUI: way to distinguish in which of the 3 pool groups it should be listed
        - 0 = Single asset stake pools
        - 1 = LP asset staking rewarding VOODOO
        - 2 = LP asset staking rewarding VSHARE
  contract: the contract name which will be loaded from the deployment.environmnet.json
  depositTokenName : the name of the token to be deposited
  earnTokenName: the rewarded token
  finished: will disable the pool on the UI if set to false
  sort: the order of the pool
  */
  VoodooBttRewardPool: {
    name: 'Earn VOODOO by BTT',
    poolId: 0,
    sectionInUI: 0,
    contract: 'VoodooBttRewardPool',
    depositTokenName: 'WBTT',
    earnTokenName: 'VOODOO',
    finished: false,
    sort: 1,
    closedForStaking: false,
  },
  VoodooTronRewardPool: {
    name: 'Earn VOODOO by TRON',
    poolId: 1,
    sectionInUI: 0,
    contract: 'VoodooTronGenesisRewardPool',
    depositTokenName: 'TRON',
    earnTokenName: 'VOODOO',
    finished: false,
    sort: 2,
    closedForStaking: false,
  },
  VoodooSunRewardPool: {
    name: 'Earn VOODOO by SUN',
    poolId: 2,
    sectionInUI: 0,
    contract: 'VoodooSunGenesisRewardPool',
    depositTokenName: 'SUN',
    earnTokenName: 'VOODOO',
    finished: false,
    sort: 3,
    closedForStaking: false,
  },
  VoodooJstRewardPool: {
    name: 'Earn VOODOO by JST',
    poolId: 3,
    sectionInUI: 0,
    contract: 'VoodooJstGenesisRewardPool',
    depositTokenName: 'JST',
    earnTokenName: 'VOODOO',
    finished: false,
    sort: 4,
    closedForStaking: false,
  },
  VoodooBttLPVoodooRewardPool: {
    name: 'Earn VOODOO by VOODOO-BTT LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'VoodooBttLpVoodooRewardPool',
    depositTokenName: 'VOODOO-BTT-LP',
    earnTokenName: 'VOODOO',
    finished: false,
    sort: 5,
    closedForStaking: false,
  },
  VoodooBttLPVoodooRewardPoolOld: {
    name: 'Earn VOODOO by VOODOO-BTT LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'VoodooBttLpVoodooRewardPoolOld',
    depositTokenName: 'VOODOO-BTT-LP',
    earnTokenName: 'VOODOO',
    finished: true,
    sort: 9,
    closedForStaking: true,
  },
  VoodooBttLPVShareRewardPool: {
    name: 'Earn VSHARE by VOODOO-BTT LP',
    poolId: 0,
    sectionInUI: 2,
    contract: 'VoodooBttLPVShareRewardPool',
    depositTokenName: 'VOODOO-BTT-LP',
    earnTokenName: 'VSHARE',
    finished: false,
    sort: 6,
    closedForStaking: false,
  },
  VshareBttLPVShareRewardPool: {
    name: 'Earn VSHARE by VSHARE-BTT LP',
    poolId: 1,
    sectionInUI: 2,
    contract: 'VshareBttLPVShareRewardPool',
    depositTokenName: 'VSHARE-BTT-LP',
    earnTokenName: 'VSHARE',
    finished: false,
    sort: 7,
    closedForStaking: false,
  },
};

export default configurations[process.env.NODE_ENV || 'development'];
