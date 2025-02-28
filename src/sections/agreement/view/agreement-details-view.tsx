'use client';

import type { IUser, IAgreementDetailItem } from 'src/types/agreement';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { _userAbout } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetUserAgreementData } from 'src/actions/agreement';
import { getUserAgreementDetail } from 'src/actions/agreement-ssr';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProfileCover } from '../profile-cover';
import { AgreementProfile } from '../agreement-profile';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'Profile', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
];

// ----------------------------------------------------------------------

class Props {
  id?: string;
}

export function AgreementDetailsView({ id }: Props) {
  const { agreementInfos } = useGetUserAgreementData(id || '', false);
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
        heading="Agreement Detail"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Agreement', href: paths.root.agreement.root },
          { name: userData?.realName },
        ]}
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
          isProfile
        />
      )}
    </DashboardContent>
  );
}
