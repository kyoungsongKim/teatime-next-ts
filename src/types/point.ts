import { CUserItem } from './user';

export type PointItem = {
  code: string;
  createdDate: string; // '2025-01-16'
  expValue: number;
  id: number;
  memo: string;
  point: number;
  recver: string;
  sender: string;
  useDate: string; // '2025-01-16'
};

export type PointFilter = {
  createdDate: string;
  useDate: string;
  memo: string;
  point: number;
  sender: string;
  code: string;
};

export type DonatePointItem = {
  code: string;
  recver: string;
};

export type CreatePointItem = {
  sender: string;
  receiver: CUserItem | null;
  point: number;
  memo: string;
};
