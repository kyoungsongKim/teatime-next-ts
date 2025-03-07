import axios, { endpoints } from '../utils/axios';

export async function getUserExceptList(userId: string) {
  const URL = `${endpoints.user.root}/except?userId=${userId}`;
  const res = await axios.get(URL);
  return res;
}

export async function getUserList() {
  const URL = `${endpoints.user.list}`;
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

export async function updateUserDetailSocial(data: Record<string, any>) {
  const URL = `${endpoints.user.details}/social`;
  const res = await axios.post(URL, data, {
    headers: { 'Content-Type': 'application/json' },
  });

  return res;
}

export async function updateUserPassword(data: Record<string, any>) {
  const URL = `${endpoints.user.root}/pass`;
  const res = await axios.post(URL, data, {
    headers: { 'Content-Type': 'application/json' },
  });

  return res;
}
