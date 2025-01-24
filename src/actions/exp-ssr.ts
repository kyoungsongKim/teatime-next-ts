import axios, { endpoints } from '../utils/axios';

export async function changePointToExp(
  sender: string,
  receiver: string,
  point: number,
  memo: string
) {
  const URL = `${endpoints.exp.levelup}?sender=${sender}&receiver=${receiver}&point=${point}&memo=${memo}`;
  const res = await axios.get(URL);

  return res;
}

export async function changePointToExpAll(sender: string, memo: string, point: number) {
  const URL = `${endpoints.exp.levelupall}?sender=${sender}&memo=${memo}&point=${point}`;
  const res = await axios.get(URL);

  return res;
}
