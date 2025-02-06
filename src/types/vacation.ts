export type VacationHistoryItem = {
  id: number;
  userId: string;
  amount: number;
  eventStartDate: string;
  eventEndDate: string;
  reason: string;
  adminMemo: string;
  type: string;
  createdDate: string;
  updatedDate: string;
};

export type VacationItem = {
  histories: VacationHistoryItem[];
  left: number;
  renewalDate: string;
  total: number;
  used: number;
  userId: string;
  workedYearList: number[];
};
