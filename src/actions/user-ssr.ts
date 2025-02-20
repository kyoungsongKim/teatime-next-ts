import axios, { endpoints } from '../utils/axios';

export async function getUserList(except?: string) {
  const URL = `${endpoints.user.list}${except ? `?except=${except}` : ''}`;
  const res = await axios.get(URL);
  return res;
}

export async function getUserInfos(userId: string) {
  const URL = `${endpoints.user.root}/${userId}`;
  const res = await axios.get(URL);

  return res;
}

export async function deleteUserInfo(userId: string) {
  const URL = `${endpoints.user.root}/${userId}`;
  const res = await axios.delete(URL);

  return res;
}

export async function updateUserDetail(data: Record<string, any>) {
  const res = await axios.post(endpoints.user.details, data, {
    headers: { 'Content-Type': 'application/json' },
  });

  return res;
}
