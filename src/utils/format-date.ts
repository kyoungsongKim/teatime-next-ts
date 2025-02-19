import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

// 날짜 포맷팅 함수
// 날짜를 받아서 원하는 형태로 포맷팅 해주는 함수
// type에 따라 다른 형태로 포맷팅 가능
// type 1: 2025년 01월 16일
// type 2: 2025-01-16
// type 3: 2025.01.16
// type 4: 2025년 01월 16일 12:30
// type 5: 01월 16일
// type 6: 2025-01-16T12:30:00
// type 7: 2025-01-16 12:30:00
export const makeDateString = (date: Date, type: number | undefined = 1) => {
  switch (type) {
    case 1:
      return `${date.getFullYear()}년 ${fillZero(date.getMonth() + 1)}월 ${fillZero(date.getDate())}일`;
    case 2:
      return `${date.getFullYear()}-${fillZero(date.getMonth() + 1)}-${fillZero(date.getDate())}`;
    case 3:
      return `${date.getFullYear()}.${fillZero(date.getMonth() + 1)}.${fillZero(date.getDate())}`;
    case 4:
      return `${date.getFullYear()}년 ${fillZero(date.getMonth() + 1)}월 ${fillZero(date.getDate())}일 ${fillZero(date.getHours())}:${fillZero(date.getMinutes())}`;
    case 5:
      return `${fillZero(date.getMonth() + 1)}월 ${fillZero(date.getDate())}일`;
    case 6:
      return `${date.getFullYear()}-${fillZero(date.getMonth() + 1)}-${fillZero(date.getDate())}T${fillZero(date.getHours())}:${fillZero(date.getMinutes())}:${fillZero(date.getSeconds())}`;
    case 7:
      return `${date.getFullYear()}-${fillZero(date.getMonth() + 1)}-${fillZero(date.getDate())} ${fillZero(date.getHours())}:${fillZero(date.getMinutes())}:${fillZero(date.getSeconds())}`;
    case 8:
      return `${date.getFullYear().toString().substring(2)}년 ${fillZero(date.getMonth() + 1)}월 ${fillZero(date.getDate())}일`;
    default:
      return `${date.getFullYear()}년 ${fillZero(date.getMonth() + 1)}월 ${fillZero(date.getDate())}일`;
  }
};

export const fillZero = (num: number) => String(num).padStart(2, '0');

// calc date diff
export const calcDateDiff = (date1: Date, date2: Date) => {
  const cloneDate1 = new Date(date1);
  const cloneDate2 = new Date(date2);

  const diff = cloneDate1.getTime() - cloneDate2.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.round(diff / msPerDay);
};

// 주말(토, 일) 제외하고 amount 만큼 날짜를 증가시키는 함수
export const getNextBusinessDate = (startDate: string | Dayjs, amount: number): string => {
  let date = dayjs(startDate); // 시작 날짜
  let addedDays = 0;

  while (addedDays < amount - 1) {
    date = date.add(1, 'day'); // 하루 증가
    if (date.day() !== 0 && date.day() !== 6) {
      // 0 = 일요일, 6 = 토요일
      addedDays += 1;
    }
  }

  return date.format('YYYY-MM-DD HH:mm');
};
