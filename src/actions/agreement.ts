import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';
import { IAgreementDetailItem, IAgreementItem } from '../types/agreement';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type AgreementInfosData = IAgreementItem[];

export function useGetUserAgreementData(userId: string, role: string) {
  const url = role === 'ADMIN' ? endpoints.agreement.info : `${endpoints.agreement.info}/${userId}`;

  const { data, isLoading, error, isValidating } = useSWR<AgreementInfosData>(
    url,
    fetcher,
    swrOptions
  );

  const normalizedData = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }, [data]);

  const memoizedValue = useMemo(
    () => ({
      agreementInfos: normalizedData,
      agreementInfosLoading: isLoading,
      agreementInfosError: error,
      agreementInfosValidating: isValidating,
      agreementInfosEmpty: !isLoading && data?.length === 0,
    }),
    [normalizedData, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type AgreementInfoData = IAgreementDetailItem[];

export function useGetUserAgreement(userId: string) {
  const url = `${endpoints.agreement.root}/${userId}`;

  const { data, isLoading, error, isValidating } = useSWR<AgreementInfoData>(
    url,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      agreementInfo: data ?? [],
      agreementInfoLoading: isLoading,
      agreementInfoError: error,
      agreementInfoValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
