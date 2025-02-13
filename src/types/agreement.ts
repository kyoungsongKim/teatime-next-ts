export type AgreementFileItem = {
  id: number;
  name: string;
  originalName: string;
  size: number;
};

export type IAgreementItem = {
  id: string;
  userId: string;
  realName: string;
  guaranteeAmount: number;
  totalAmount: number;
  currentAgreementCount: number;
  totalAgreementCount: number;
};

export type IAgreementDetailItem = {
  id: string;
  user: {
    id: string;
    userName: string;
    realName: string;
    teamName: string;
    position: string;
    cellphone: string;
    email: string;
    dailyReportList: string;
    renewalDate: string;
    vacationReportList: string;
  };
  file: {
    id: number;
    name: string;
    originalName: string;
    size: number;
  };
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
