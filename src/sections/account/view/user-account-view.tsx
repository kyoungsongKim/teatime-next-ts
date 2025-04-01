'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';
import { _userPlans, _userPayment, _userInvoices, _userAddressBook } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

import { AccountCbankInfo } from 'src/sections/account/account-cbank-info';

import { useUser } from 'src/auth/context/user-context';

import { AccountGeneral } from '../account-general';
import { AccountBilling } from '../account-billing';
import { AccountSocialLinks } from '../account-social-links';
import { AccountChangePassword } from '../account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'general', label: 'General', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'cbank', label: 'CBank', icon: <Iconify icon="solar:bill-list-bold" width={24} /> },
  { value: 'social', label: 'Social links', icon: <Iconify icon="solar:share-bold" width={24} /> },
  { value: 'security', label: 'Security', icon: <Iconify icon="ic:round-vpn-key" width={24} /> },
];
// ----------------------------------------------------------------------

export function AccountView() {
  const tabs = useTabs('general');
  const { userInfo } = useUser();

  return (
    <DashboardContent>
      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {tabs.value === 'general' && <AccountGeneral userInfo={userInfo} />}

      {tabs.value === 'billing' && (
        <AccountBilling
          plans={_userPlans}
          cards={_userPayment}
          invoices={_userInvoices}
          addressBook={_userAddressBook}
        />
      )}

      {tabs.value === 'cbank' && <AccountCbankInfo />}

      {tabs.value === 'social' && <AccountSocialLinks userInfo={userInfo} />}

      {tabs.value === 'security' && <AccountChangePassword userInfo={userInfo} />}
    </DashboardContent>
  );
}
