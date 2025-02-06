import axios, { endpoints } from 'src/utils/axios';

export async function getVacationList(id: string, workedYear?: number) {
  const URL = `${endpoints.vacation.root}?userId=${id}${workedYear ? `&workedYear=${workedYear}` : ''}`;
  const res = await axios.get(URL);

  return res;
}

export async function getVacationAll() {
  const res = await axios.get(endpoints.vacation.all);

  return res;
}
