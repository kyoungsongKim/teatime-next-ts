import { jwtDecode } from '../auth/context/jwt';

import type { UserType } from '../auth/types';

export function getUserInfo(user: UserType) {
  // 사용자 정보 불러오기
  if (!user) {
    return { id: '', auth: '' };
  }
  return jwtDecode(user?.accessToken);
}
