import axios, { endpoints } from '../utils/axios';

export async function getUserList(except?: string) {
  const URL = `${endpoints.user.list}${except ? `?except=${except}` : ''}`;
  const res = await axios.get(URL);
  return res;
}

export async function deleteUserInfo(userId: string) {
  const URL = `${endpoints.user.root}/${userId}`;
  const res = await axios.delete(URL);

  return res;
}
