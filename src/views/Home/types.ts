import { TokenStat } from '../../voodoo-finance/types';

export interface OverviewData {
  cash?: TokenStat;
  bond?: TokenStat;
  share?: TokenStat;
}
