import axios, { endpoints } from 'src/utils/axios';

export async function getPointList(id: string, year: string) {
  const URL = `${endpoints.point.list}?receiver=${id}&periodYear=${year}`;
  const res = await axios.get(URL);

  return res.data;
}

export async function makePoint(sender: string, receiver: string, point: number, memo: string) {
  const URL = `${endpoints.point.code}?sender=${sender}&receiver=${receiver}&point=${point}&memo=${memo}`;
  const res = await axios.get(URL);

  return res;
}

export async function getSummaryPointList(receiver: string) {
  const URL = `${endpoints.point.summary}?receiver=${receiver}`;
  const res = await axios.get(URL);

  return res;
}

export async function getMonthPointList(userName: string, year: string, month: string) {
  const URL = `${endpoints.point.month}?receiver=${userName}&year=${year}&month=${month}`;
  const res = await axios.get(URL);

  return res;
}

export async function getUserPoint(id: string) {
  const URL = `${endpoints.point.user}?receiver=${id}`;
  const res = await axios.get(URL);

  return res;
}
