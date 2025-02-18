export type IAgreementItem = {
  id: string;
  userId: string;
  realName: string;
  guaranteeAmount: number;
  totalAmount: number;
  currentAgreementCount: number;
  totalAgreementCount: number;
};

interface IUserDetails {
  address: string;
  cbankAccount: string;
  cbankId: string;
  cellphone: string;
  dailyReportList: string;
  educationLevel: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  joinDate: string;
  linkedinUrl: string;
  renewalDate: string;
  skillLevel: string;
  twitterUrl: string;
  userId: string;
  vacationReportList: string;
}

export type IUser = {
  id: string;
  userName: string;
  realName: string;
  description: string;
  teamName: string;
  position: string;
  cellphone: string;
  email: string;
  dailyReportList: string;
  renewalDate: string;
  vacationReportList: string;
  userDetails: IUserDetails;
};

export type IAgreementFileItem = {
  id: number;
  name: string;
  originalName: string;
  size: number;
};

export type IAgreementDetailItem = {
  id: string;
  user: IUser;
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
