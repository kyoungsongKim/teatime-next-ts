import axios, { endpoints } from 'src/utils/axios';

export async function getStatisticsSales(id: string, year: string) {
  const URL = id ? `${endpoints.statistics.sales}?userName=${id}&year=${year}` : '';
  const res = await axios.get(URL);

  return res.data;
}
