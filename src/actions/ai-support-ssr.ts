import axios, { endpoints } from 'src/utils/axios';

export async function postAiSupportHistory(
  senderId: string,
  requestText: string,
  responseText: string
) {
  const params: any = {
    senderId,
    requestText,
    responseText,
  };
  const res = await axios.post(endpoints.aiSupport, params);

  return res;
}
