import axios, { endpoints } from 'src/utils/axios';

export const getApplyList = async () => {
  const URL = `${endpoints.assistance.apply.root}/`;
  const res = await axios.get(URL);

  return res;
};

export const getAssistanceGroupList = async () => {
  const URL = `${endpoints.assistance.group.root}/`;
  const res = await axios.get(URL);

  return res;
};

export const getAssistanceList = async () => {
  const URL = `${endpoints.assistance.root}/`;
  const res = await axios.get(URL);

  return res;
};
