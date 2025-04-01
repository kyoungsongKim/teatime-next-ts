import axios, { endpoints } from '../utils/axios';

export async function getMonthlySales(id: string) {
  const URL = `${endpoints.monthlySales.current}?userId=${id}`;
  const res = await axios.get(URL);

  return res.data;
}

export async function getCbankHistory(id: string, startDate: string, endDate: string) {
  const params = new URLSearchParams({
    userId: id,
    startDate,
    endDate,
  });

  const URL = `${endpoints.monthlySales.history}?${params.toString()}`;
  const res = await axios.get(URL);
  return res.data;
}
