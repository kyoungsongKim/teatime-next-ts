import type { IUserItem } from './user';

export type SalesItem = {
  id: number;
  salesAmount: number;
  summaryDate: string;
  user: IUserItem;
};

export type StatisticsSalesItem = {
  salesList: SalesItem[];
  targetSales: string;
  yearList: number[];
};
