import axios, { endpoints } from '../utils/axios';

export async function getUserList() {
  const URL = `${endpoints.users.root}`;
  return axios.get(URL);
}
