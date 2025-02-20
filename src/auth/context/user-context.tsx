'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getUserInfos } from 'src/actions/user-ssr';
import { useAuthContext } from '../hooks';
import { getUserInfo } from '../../utils/user-info';
import { IUser } from '../../types/agreement';

interface UserContextType {
  userInfo: IUser | null;
  setUserInfo: (user: IUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const { id } = useMemo(() => getUserInfo(user), [user]);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);

  const value = useMemo(() => ({ userInfo, setUserInfo }), [userInfo]);

  useEffect(() => {
    if (id) {
      getUserInfos(id)
        .then((ret) => setUserInfo(ret.data))
        .catch((error) => console.error('Failed to fetch user info:', error));
    }
  }, [id]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
