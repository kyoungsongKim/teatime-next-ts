import axios, { endpoints } from 'src/utils/axios';

export async function getSiteList() {
  try {
    const URL = `${endpoints.site.root}`;
    const res = await axios.get(URL);

    return res.data;
  } catch (e) {
    console.error('Failed to fetch:', e);
    throw e;
  }
}

export async function getProjectList(site: string) {
  try {
    const URL = `${endpoints.project.root}?siteName=${site}`;
    const res = await axios.get(URL);

    return res.data;
  } catch (e) {
    console.error('Failed to fetch:', e);
    throw e;
  }
}

export async function getTicketInfo(id: string) {
  try {
    const URL = `${endpoints.ticket.root}/${id}`;
    const res = await axios.get(URL);

    return res.data;
  } catch (e) {
    console.error('Failed to fetch:', e);
    throw e;
  }
}
