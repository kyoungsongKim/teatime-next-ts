import axios, { endpoints } from 'src/utils/axios';

// 처리완료 후, 사용자의 리뷰
export const postAssistanceReview = async (id: number, param: any) => {
  const URL = `${endpoints.assistance.apply.root}/${id}/review`;
  const res = await axios.post(URL, param);

  return res;
};

// 서비스 수락(Admin)
export const patchAssistanceReceive = async (id: number) => {
  const URL = `${endpoints.assistance.apply.root}/${id}/receive`;
  const res = await axios.patch(URL);

  return res;
};

// 서비스 상태 변경
export const patchAssistanceStatus = async (id: number, status: string) => {
  const URL = `${endpoints.assistance.apply.root}/${id}/status`;
  const res = await axios.patch(URL, { status });

  return res;
};

// 서비스 신청
export const postAssistanceApply = async (id: number, param: FormData) => {
  const URL = `${endpoints.assistance.root}/${id}/apply`;
  const res = await axios.post(URL, param, { headers: { 'Content-Type': 'multipart/form-data' } });

  return res;
};

// 서비스 제안
export const postAssistanceSuggestion = async (param: any) => {
  const URL = `${endpoints.assistance.root}/suggestion`;
  const res = await axios.post(URL, param);

  return res;
};
