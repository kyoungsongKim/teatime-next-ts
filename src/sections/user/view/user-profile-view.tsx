'use client';

import { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';

import { useTabs } from 'src/hooks/use-tabs';
import { DashboardContent } from 'src/layouts/dashboard';
import { _userAbout } from 'src/_mock';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { ProfileCover } from '../profile-cover';
import { useGetUserAgreementData } from '../../../actions/agreement';
import { IAgreementDetailItem, IUser } from '../../../types/agreement';
import { getUserAgreementDetail } from '../../../actions/agreement-ssr';
import { AgreementProfile } from '../../agreement/agreement-profile';
import { getUserInfo } from '../../../utils/user-info';
import { CustomBreadcrumbs } from '../../../components/custom-breadcrumbs';
import { paths } from '../../../routes/paths';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'Profile', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
];

// ----------------------------------------------------------------------

export function UserProfileView() {
  const { user } = useAuthContext();
  const { id } = useMemo(() => getUserInfo(user), [user]);
  const { agreementInfos } = useGetUserAgreementData(id || '', '');
  const [userData, setUserData] = useState<IUser>({
    cellphone: '',
    dailyReportList: '',
    description: '',
    email: '',
    id: '',
    position: '',
    realName: '',
    renewalDate: '',
    teamName: '',
    userName: '',
    vacationReportList: '',
    userDetails: {
      address: '',
      birthDate: '',
      avatarImg: '',
      cbankAccount: '',
      cbankId: '',
      cellphone: '',
      dailyReportList: '',
      educationLevel: '',
      email: '',
      facebookUrl: '',
      instagramUrl: '',
      homepageUrl: '',
      joinDate: '',
      linkedinUrl: '',
      renewalDate: '',
      skillLevel: '',
      twitterUrl: '',
      userId: '',
      vacationReportList: '',
    },
  });
  const [detailData, setDetailData] = useState<IAgreementDetailItem[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const userAgreement = await getUserAgreementDetail(id);

        if (userAgreement?.data) {
          setDetailData(userAgreement.data);

          if (Array.isArray(userAgreement.data) && userAgreement.data.length > 0) {
            setUserData(userAgreement.data[0]?.user || null);
            console.log('userAgreement.data[0]?.user:', userAgreement.data[0]?.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch agreement data:', error);
      }
    };

    fetchData();
  }, [id]);

  const tabs = useTabs('profile');

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[{ name: 'Dashboard', href: paths.root.dashboard }, { name: 'Profile' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={userData?.position || ''}
          name={userData?.realName || ''}
          avatarUrl={userData?.userDetails.avatarImg || ''}
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
          userData={userData || {}}
        />
      )}
    </DashboardContent>
  );
}
