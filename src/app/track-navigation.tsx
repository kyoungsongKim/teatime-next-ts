'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useUser } from 'src/auth/context/user-context';

import { postNavigationHistory } from '../actions/user-navigation-history';

const TrackNavigation = () => {
  const pathname = usePathname();
  const { userInfo } = useUser();

  useEffect(() => {
    if (!userInfo || !userInfo.id) return;

    const logNavigation = async () => {
      await postNavigationHistory(pathname, navigator.userAgent);
    };

    if (pathname) {
      logNavigation();
    }
  }, [pathname, userInfo]);

  return null;
};

export default TrackNavigation;
