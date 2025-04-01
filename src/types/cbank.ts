import type { IDatePickerControl } from 'src/types/common';

export type ICbankItem = {
  id: string;
  type: string;
  date: string;
  recvName: string;
  recvAccount: string;
  sendName: string;
  sendAccount: string;
  history: string;
  amount: number;
  balance: number;
  status: string;
  memo: string;
  income: boolean;
};

export type ICbankTableFilters = {
  keyword: string;
  type: string;
  transferStartDate: IDatePickerControl;
  transferEndDate: IDatePickerControl;
};

export const cbankTypeLabels: Record<string, string> = {
  Internal: '내부이체',
  External: '외부이체',
  Salary: '급여이체',
};
