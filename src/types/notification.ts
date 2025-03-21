import type { IUserItem } from 'src/types/user';

export type INotificationItem = {
  id: string;
  title: string;
  notificationType: string;
  content: string;
  isGlobal: boolean;
  createdAt: string;
};

export type INotificationUserItem = {
  id: string;
  notification: INotificationItem;
  user: IUserItem;
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
  trueOrFalse: '확인또는거절',
};
