import axios, { endpoints } from 'src/utils/axios';

export async function donatePoint(code: string, receiver: string) {
  const params: any = {
    code,
    recver: receiver,
  };
  try {
    const res = await axios.post(endpoints.point.code, params);

    console.log(res);

    return {
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    console.error('Error donating point:', error);
    return {
      status: 500,
      data: {
        msg: error.msg,
      },
    };
  }
}
