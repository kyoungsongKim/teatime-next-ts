import axios, { endpoints } from 'src/utils/axios';

import type { IAttendance, IAttendanceRequest } from '../types/attendance';

export const getAttendance = async (userId: string, workDate: string): Promise<IAttendance[]> => {
  const URL = `${endpoints.attendance.root}`;
  try {
    const response = await axios.get<IAttendance[]>(URL, {
      params: { userId, workDate },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
};

export const postAssistance = async (attendanceData: IAttendanceRequest) => {
  const URL = `${endpoints.attendance.root}`;
  return axios.post(URL, attendanceData);
};
