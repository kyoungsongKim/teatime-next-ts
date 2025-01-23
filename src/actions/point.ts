import axios, { endpoints } from 'src/utils/axios';

export async function donatePoint(code: string, receiver: string) {
  const params: any = {
    code,
    recver: receiver,
  };
  const res = await axios.post(endpoints.point.code, params);

  return {
    status: res.status,
    data: res.data,
  };
}
