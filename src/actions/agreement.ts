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

export function useGetUserAgreementInfos() {
  const url = endpoints.agreement.info;

  const { data, isLoading, error, isValidating } = useSWR<AgreementInfosData>(
    url,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      agreementInfos: data ?? [],
      agreementInfosLoading: isLoading,
      agreementInfosError: error,
      agreementInfosValidating: isValidating,
      agreementInfosEmpty: !isLoading && data?.length === 0,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type AgreementInfoData = IAgreementDetailItem[];

export function useGetUserAgreementInfo(userId: string) {
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
