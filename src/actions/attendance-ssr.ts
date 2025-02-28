import axios, { endpoints } from 'src/utils/axios';

import type { IAttendanceItem, IAttendanceRequest } from '../types/attendance';

export const getAttendance = async (
  userId: string,
  workDate: string,
  endDate: string | null
): Promise<IAttendanceItem[]> => {
  const URL = `${endpoints.attendance.root}`;
  try {
    const response = await axios.get<IAttendanceItem[]>(URL, {
      params: { userId, workDate, endDate },
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
