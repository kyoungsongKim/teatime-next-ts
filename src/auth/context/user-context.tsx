'use client';

import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { getUserInfos } from 'src/actions/user-ssr';

import { useAuthContext } from '../hooks';
import { getUserInfo } from '../../utils/user-info';

import type { IUser } from '../../types/agreement';

interface UserContextType {
  userInfo: IUser | null;
  isAdmin: boolean | null;
  setUserInfo: (user: IUser | null) => void;
  refreshUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const { id, auth } = useMemo(() => getUserInfo(user), [user]);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);

  const isAdmin = useMemo(() => userInfo && ADMIN_ROLES.includes(auth), [auth, userInfo]);

  const refreshUserInfo = useCallback(async () => {
    try {
      if (userInfo?.id) {
        const updatedUserInfo = await getUserInfos(userInfo.id);
        setUserInfo(updatedUserInfo.data);
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (id) {
      getUserInfos(id)
        .then((ret) => setUserInfo(ret.data))
        .catch((error) => console.error('Failed to fetch user info:', error));
    }
  }, [id]);

  const value = useMemo(
    () => ({ userInfo, isAdmin, setUserInfo, refreshUserInfo }),
    [isAdmin, refreshUserInfo, userInfo]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
