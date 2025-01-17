import axios, { endpoints } from '../utils/axios';

export async function getMonthlySales(id: string) {
  const URL = `${endpoints.monthlySales.current}?userId=${id}`;
  const res = await axios.get(URL);

  return res.data;
}
