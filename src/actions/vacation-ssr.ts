import type { VacationHistoryItem } from 'src/types/vacation';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

export async function getVacationList(id: string, workedYear?: number) {
  const URL = `${endpoints.vacation.root}?userId=${id}${workedYear ? `&workedYear=${workedYear}` : ''}`;
  const res = await axios.get(URL);

  return res;
}

export async function getVacationAll() {
  const res = await axios.get(endpoints.vacation.all);

  return res;
}

const enableServer = true;
const VACATION_ROOT_ENDPOINT = endpoints.vacation.root;
const VACATION_LIST_ENDPOINT = endpoints.vacation.list;

const swrOptions = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

export function useGetVacation(id: string, userName: string, date: Date) {
  const listKey =
    !userName || !date || !id
      ? null
      : [
          VACATION_LIST_ENDPOINT,
          {
            params: {
              userId: userName,
              year: date.getFullYear(),
            },
          },
        ];
  const key = !userName || !date || !id ? null : [`${VACATION_ROOT_ENDPOINT}/${id}`];

  const {
    data: listData,
    isLoading: listIsLoading,
    error: listError,
    isValidating: listIsValidating,
  } = useSWR<VacationHistoryItem[]>(listKey, fetcher, swrOptions);

  const { data, isLoading, error, isValidating } = useSWR<VacationHistoryItem>(
    key,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      histories: listData,
      item: data,
      isLoading: listIsLoading || isLoading,
      error: listError || error,
      isValidating: listIsValidating || isValidating,
    }),
    [data, error, isLoading, isValidating, listData, listError, listIsLoading, listIsValidating]
  );
}
