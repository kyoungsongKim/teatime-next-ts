import axios, { endpoints } from 'src/utils/axios';

export async function saveVacation(param: any) {
  const URL = `${endpoints.vacation.root}`;
  const res = await axios.post(URL, param);

  return res;
}

export async function updateVacation(id: number, param: any) {
  const URL = `${endpoints.vacation.root}/${id}`;
  const res = await axios.put(URL, param);

  return res;
}

export async function deleteVacation(id: number) {
  const URL = `${endpoints.vacation.root}/${id}`;
  const res = await axios.delete(URL);

  return res;
}
