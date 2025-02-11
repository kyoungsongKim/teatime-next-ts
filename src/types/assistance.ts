export type AssistanceItem = {
  description: string;
  form: string;
  id: number;
  name: string;
  price: number;
  groupId: number | null;
  files: ApplyFileItem[];
};

export type ApplyUserItem = {
  cellphone: string;
  dailyReportList: string;
  email: string;
  id: string;
  position: string;
  realName: string;
  renewalDate: string;
  teamName: string;
  userName: string;
  vacationReportList: string;
};

export type ApplyFileItem = {
  id: number;
  name: string;
  originalName: string;
  size: number;
};

export type ApplyReviewItem = {
  id: number;
  rating: number;
  content?: string;
  reviewer: ApplyUserItem;
};

export type ApplyItem = {
  applier: ApplyUserItem;
  assistance: AssistanceItem;
  content: string;
  createdDate: string;
  files: ApplyFileItem[];
  id: number;
  receiver: ApplyUserItem;
  review?: ApplyReviewItem;
  status: string;
  updatedDate: string;
};

export type AssistanceGroupItem = {
  id: number;
  name: string;
  order: number;
  services: AssistanceItem[];
};
