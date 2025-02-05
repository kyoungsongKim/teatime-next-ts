import axios, { endpoints } from 'src/utils/axios';

export async function getFaqs() {
  const res = await axios.get(endpoints.faqs.root);

  return res;
}

export async function postFaq(id: number | null, name: string, description: string) {
  const params: any = {
    id: id ?? null,
    name,
    description,
  };
  const res = await axios.post(endpoints.faqs.root, params);

  return res;
}

export async function deleteFaq(faqsId: number) {
  const URL = `${endpoints.faqs.root}/${faqsId}`;
  const res = await axios.delete(URL);

  return res;
}
