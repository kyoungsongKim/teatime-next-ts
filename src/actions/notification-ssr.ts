import type { INotificationItem, INotificationUserItem } from 'src/types/notification';

import axios, { endpoints } from 'src/utils/axios';

export async function postNotification(
  id: string | undefined,
  createUserId: string | undefined,
  title: string,
  content: string,
  isGlobal: boolean,
  notificationType: string,
  userIds: string[]
) {
  const params: any = {
    id,
    createUserId,
    title,
    content,
    isGlobal,
    notificationType,
    userIds,
  };
  const res = await axios.post(endpoints.notification.root, params);
  return res;
}

export const getAllNotifications = async (): Promise<INotificationItem[]> => {
  const res = await axios.get(endpoints.notification.root);
  return res.data;
};

export const getUserNotificationList = async (
  notificationId: string
): Promise<INotificationUserItem[]> => {
  const res = await axios.get(`${endpoints.notification.root}/${notificationId}`);
  return res.data;
};

export const getAllNotificationsByUser = async (
  userId: string | undefined
): Promise<INotificationUserItem[]> => {
  const res = await axios.get(`${endpoints.notification.root}/user/${userId}`);
  return res.data;
};

export async function deleteNotification(notificationId: string) {
  const res = await axios.delete(`${endpoints.notification.root}/${notificationId}`);
  return res;
}

export async function sendNotificationToUser(receiverId: string, title: string, category: string) {
  const params: any = {
    receiverId,
    title,
    category,
  };
  const res = await axios.post(`${endpoints.notification.root}/send`, params);
  return res;
}
