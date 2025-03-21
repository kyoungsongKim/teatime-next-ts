'use client';

import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';

import { NotificationsTable } from 'src/sections/notification/notifications-table';

import { useUser } from 'src/auth/context/user-context';

// ----------------------------------------------------------------------

export function NotificationsView() {
  const { userInfo, isAdmin } = useUser();

  return (
    <DashboardContent>
      <Grid container spacing={2}>
        <Grid xs={12} md={12}>
          {isAdmin && <NotificationsTable userInfo={userInfo || null} isAdmin={isAdmin} />}
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
