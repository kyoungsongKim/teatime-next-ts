import axios, { endpoints } from '../utils/axios';

export async function getTeamList() {
  const URL = `${endpoints.team.root}`;
  const res = await axios.get(URL);

  return res;
}
