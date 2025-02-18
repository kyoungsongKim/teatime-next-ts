import axios, { endpoints } from '../utils/axios';

// ----------------------------------------------------------------------

export async function createAgreement(formData: FormData) {
  const res = await axios.post(endpoints.agreement.root, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res;
}

// ----------------------------------------------------------------------

export async function deleteAgreement(agreementId: string) {
  const URL = `${endpoints.agreement.root}/${agreementId}`;
  const res = await axios.delete(URL);

  return res;
}

// ----------------------------------------------------------------------

export async function getUserAgreementHistory(userId: string) {
  const url = `${endpoints.agreement.history}/${userId}`;
  const res = await axios.get(url);

  return res;
}
