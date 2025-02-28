import type { IDatePickerControl } from 'src/types/common';

export type IAttendanceItem = {
  workId?: number; // 출퇴근 기록의 고유 ID
  userId: string; // 사용자 ID
  workType: 'all' | 'OFFICE' | 'REMOTE' | 'FIELD'; // 근무 유형 (사무실, 재택, 외근)
  workDate?: string; // 근무 날짜 (YYYY-MM-DD 형식)
  workStartTime?: string; // 출근 시간 (HH:MM:SS) 또는 null
  workEndTime?: string; // 퇴근 시간 (HH:MM:SS) 또는 null
  location?: string; // 근무 위치 (사무실, 집, 고객사 등)
  managerName?: string; // 승인한 관리자
  taskDescription?: string; // 업무 내용
  description?: string; // 기타 설명
};

export type IAttendanceRequest = {
  userId: string; // 사용자 ID
  workType: 'OFFICE' | 'REMOTE' | 'FIELD'; // 근무 유형 (사무실, 재택, 외근)
  timeType: 'startTime' | 'endTime' | 'update'; // 출근 시간 또는 퇴근 시간
  location?: string; // 근무 위치 (사무실, 집, 고객사 등)
  managerName?: string; // 승인한 관리자
  taskDescription?: string; // 업무 내용
};

export type IAttendanceTableFilters = {
  name: string;
  workType: string;
  workStartDate: IDatePickerControl;
  workEndDate: IDatePickerControl;
};

export const workTypeLabels: Record<string, string> = {
  OFFICE: '정상근무',
  REMOTE: '재택',
  FIELD: '외근',
};
