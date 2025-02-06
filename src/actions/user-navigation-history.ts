import axios, { endpoints } from '../utils/axios';

export async function postNavigationHistory(menuName: string, userAgent: string) {
  const params: any = {
    menuName,
    userAgent,
  };
  const res = await axios.post(endpoints.userNavigationHistory.root, params);

  return res;
}
