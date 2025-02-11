import axios, { endpoints } from 'src/utils/axios';

export async function getFileItem(id: number) {
  const URL = `${endpoints.file.root}/${id}`;
  const res = await axios.get(URL, { responseType: 'blob', withCredentials: true });
  return res;
}
