'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { postNavigationHistory } from '../actions/user-navigation-history';
import { useUser } from 'src/auth/context/user-context';

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
  }, [pathname]);

  return null;
};

export default TrackNavigation;
