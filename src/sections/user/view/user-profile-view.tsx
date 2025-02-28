'use client';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Unstable_Grid2';

import { useTabs } from 'src/hooks/use-tabs';

import { _userAbout } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { ProfileCover } from '../profile-cover';
import { getUserInfo } from '../../../utils/user-info';
import { useUser } from '../../../auth/context/user-context';
import { useGetUserAgreementData } from '../../../actions/agreement';
import { AgreementProfile } from '../../agreement/agreement-profile';
import { getUserAgreementDetail } from '../../../actions/agreement-ssr';

import type { IAgreementDetailItem } from '../../../types/agreement';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'Profile', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
];

// ----------------------------------------------------------------------

export function UserProfileView() {
  const { user } = useAuthContext();
  const { id } = useMemo(() => getUserInfo(user), [user]);
  const { agreementInfos } = useGetUserAgreementData(id || '', false);
  const { userInfo } = useUser();
  const [detailData, setDetailData] = useState<IAgreementDetailItem[]>([]);
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const userAgreement = await getUserAgreementDetail(id);
        if (userAgreement?.data) {
          setDetailData(userAgreement.data);
        }
      } catch (error) {
        console.error('Failed to fetch agreement data:', error);
      }
    };

    fetchData().then((r) => r);
  }, [id]);

  const tabs = useTabs('profile');

  return (
    <DashboardContent>
      <Grid xs={12} md={12}>
        <Card sx={{ mb: 3, height: 290 }}>
          <ProfileCover
            role={userInfo?.position || ''}
            name={userInfo?.realName || ''}
            avatarUrl={userInfo?.userDetails?.avatarImg || ''}
            coverUrl={_userAbout.coverUrl}
          />

          <Box
            display="flex"
            justifyContent={{ xs: 'center', md: 'flex-end' }}
            sx={{
              width: 1,
              bottom: 0,
              zIndex: 9,
              px: { md: 3 },
              position: 'absolute',
              bgcolor: 'background.paper',
            }}
          >
            <Tabs value={tabs.value} onChange={tabs.onChange}>
              {TABS.map((tab) => (
                <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
              ))}
            </Tabs>
          </Box>
        </Card>

        {tabs.value === 'profile' && (
          <AgreementProfile
            agreementInfos={agreementInfos || []}
            detailData={detailData || []}
            // @ts-ignore
            userData={userInfo || {}}
            isProfile={false}
          />
        )}
      </Grid>
    </DashboardContent>
  );
}
