import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

import type { IAgreementItem, IAgreementDetailItem } from '../types/agreement';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type AgreementInfosData = IAgreementItem[];

export function useGetUserAgreementData(userId: string | undefined, isAdmin: boolean | null) {
  const url = isAdmin ? endpoints.agreement.info : `${endpoints.agreement.info}/${userId}`;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isExistGuarantee = useMemo(
    () => data?.some((item) => item.type === 'GUARANTEE') ?? false,
    [data]
  );

  const memoizedValue = useMemo(
    () => ({
      agreementInfo: data ?? [],
      agreementInfoLoading: isLoading,
      agreementInfoError: error,
      agreementInfoValidating: isValidating,
      isExistGuarantee,
    }),
    [data, error, isLoading, isValidating, isExistGuarantee]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
