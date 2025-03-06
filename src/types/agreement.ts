import type { IUserItem } from 'src/types/user';

export type IAgreementItem = {
  id: string;
  userId: string;
  avatarImg: string;
  realName: string;
  guaranteeAmount: number;
  totalAmount: number;
  currentAgreementCount: number;
  totalAgreementCount: number;
};

export type IAgreementFileItem = {
  id: number;
  name: string;
  originalName: string;
  size: number;
};

export type IAgreementDetailItem = {
  id: string;
  user: IUserItem;
  file: IAgreementFileItem;
  amount: number;
  type: string;
  startDate: string;
  endDate: string;
  createDate: string;
  updatedDate: string;
};

export type IAgreementTableFilters = {
  realName: string;
};
