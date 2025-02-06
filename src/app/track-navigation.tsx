'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { postNavigationHistory } from '../actions/user-navigation-history';

const TrackNavigation = () => {
  const pathname = usePathname();

  useEffect(() => {
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
