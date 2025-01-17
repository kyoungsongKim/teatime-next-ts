import type { CUserItem } from './user';

export type SalesItem = {
  id: number;
  salesAmount: number;
  summaryDate: string;
  user: CUserItem;
};

export type StatisticsSalesItem = {
  salesList: SalesItem[];
  targetSales: string;
  yearList: number[];
};
