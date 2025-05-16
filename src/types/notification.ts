import type { IUserItem } from 'src/types/user';

export type INotificationItem = {
  id: string;
  title: string;
  notificationType: string;
  content: string;
  isGlobal: boolean;
  createdAt: string;
  user: IUserItem;
};

export type INotificationUserItem = {
  id: string;
  notification: INotificationItem;
  isRead: boolean;
  reply: string;
  avatarImg: string;
  createdAt: string;
};

export type INotificationTableFilters = {
  keyword: string;
};

export type INotificationUserTableFilters = {
  keyword: string;
  isRead: string;
};

export const NotificationLabels: Record<string, string> = {
  yesOrNo: '네또는아니오',
  textInput: '텍스트입력',
  threeOption: '3지선다',
  fourOption: '4지선다',
  fiveOption: '5지선다',
};
