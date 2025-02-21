import type { VacationHistoryItem } from 'src/types/vacation';
import type { CalendarItem, CalendarEvent, ICalendarEvent } from 'src/types/calendar';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { fDate } from 'src/utils/format-time';
import { makeDateString } from 'src/utils/format-date';
import axios, { fetcher, endpoints } from 'src/utils/axios';

import { getVacationListByYear } from 'src/actions/vacation-ssr';

// ----------------------------------------------------------------------

const enableServer = true;

const CALENDAR_SAVE_ENDPOINT = endpoints.ticket.root;
const CALENDAR_ENDPOINT = endpoints.ticket.list;
const VACATION_ENDPOINT = endpoints.vacation.list;

const swrOptions = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

export function useGetEvents(userName: string, date: Date) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const key = [
    CALENDAR_ENDPOINT,
    {
      params: {
        userName,
        periodYear: date.getFullYear(),
        periodMonth: fDate(date, 'MM'),
      },
    },
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const vacationKey = [
    VACATION_ENDPOINT,
    {
      params: {
        userId: userName,
        year: date.getFullYear(),
      },
    },
  ];

  const { data, isLoading, error, isValidating } = useSWR<CalendarEvent[]>(
    key,
    fetcher,
    swrOptions
  );
  const {
    data: vacationData,
    isLoading: vacationLoading,
    error: vacationError,
    isValidating: vacationValidating,
  } = useSWR<VacationHistoryItem[]>(vacationKey, getVacationListByYear, swrOptions);

  const memoizedValue = useMemo(() => {
    const events = data?.map((event) => {
      const endDate = dayjs(event.end);

      return {
        ...event,
        textColor: event.color,
        // end date가 00시가 지난상태로 들어오면 1일을 더해줌
        start: dayjs(event.start).format('YYYY-MM-DD'),
        end:
          endDate.hour() === 0 && endDate.minute() === 0 && endDate.second() === 0
            ? endDate.format('YYYY-MM-DD')
            : endDate.add(1, 'day').format('YYYY-MM-DD'), // 하루 추가,
        editable: event.no !== 0,
      };
    });

    const vacationEvents = vacationData?.map((event) => ({
      no: event.id,
      color: '#808080',
      className: '',
      description: '',
      allDay: true,
      start:
        event.amount === 0 || event.type === '공가' || event.type === '경조'
          ? makeDateString(new Date(event.eventStartDate), 2)
          : event.eventStartDate,
      end:
        event.amount === 0 || event.type === '공가' || event.type === '경조'
          ? makeDateString(new Date(event.eventEndDate), 2)
          : dayjs(event.eventEndDate).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'), // calendar에서 end date는 포함하지 않으므로 1일을 더해줌
      title: '휴가',
      textColor: '#808080',
      editable: false,
    }));

    return {
      events: [...(events || []), ...(vacationEvents || [])],
      eventsLoading: isLoading || vacationLoading,
      eventsError: error || vacationError,
      eventsValidating: isValidating || vacationValidating,
      eventsEmpty: !isLoading && !data?.length && !vacationLoading && !vacationData?.length,
      refreshEvents: () => {
        mutate(key);
        mutate(vacationKey);
      },
    };
  }, [
    data,
    error,
    isLoading,
    isValidating,
    key,
    vacationData,
    vacationError,
    vacationKey,
    vacationLoading,
    vacationValidating,
  ]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createEvent(eventData: CalendarItem) {
  const res = await axios.post(`${CALENDAR_SAVE_ENDPOINT}/`, eventData);

  return res;
}

// ----------------------------------------------------------------------

export async function updateEventDate(userName: string, eventData: Partial<ICalendarEvent>) {
  /**
   * Work on server
   */
  try {
    const data: any = {
      userName,
      eventStartDate: eventData.start,
      eventEndDate: eventData.end,
    };
    const res = await axios.put(`${CALENDAR_SAVE_ENDPOINT}/${eventData.id}`, data);

    if (res.status === 200) {
      toast.success('티켓이 수정되었습니다.');
    } else {
      toast.error('티켓 수정에 실패했습니다.');
    }
  } catch (e) {
    console.error('Failed to fetch:', e);
  }
}

export async function updateEvent(eventData: any) {
  const res = await axios.put(`${CALENDAR_SAVE_ENDPOINT}/${eventData.id}`, eventData);

  return res;
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId: string) {
  /**
   * Work on server
   */
  const res = await axios.delete(`${CALENDAR_SAVE_ENDPOINT}/${eventId}`);
  return res;
}
