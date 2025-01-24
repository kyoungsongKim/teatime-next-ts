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

// summary point 타입을 month summary 도 동일하게 사용
export type SummaryPointItem = {
  userId: string;
  realName: string;
  totalPoint: number;
  level: number;
  totalExp: number;
};

export type ChangePointExpAllItem = {
  sender: string;
  memo: string;
  exp: number;
};

export type ChangePointExpItem = {
  receiver: CUserItem | null;
  sender: string;
  memo: string;
  exp: number;
};
