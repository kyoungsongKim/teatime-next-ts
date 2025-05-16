'use client';

import type { INotificationUserItem } from 'src/types/notification';

import { m } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  patchReadAll,
  patchReadUser,
  getAllNotificationsByUser,
} from 'src/actions/notification-ssr';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

import { useUser } from 'src/auth/context/user-context';

import { NotificationItem } from './notification-item';

// ----------------------------------------------------------------------

export function NotificationsDrawer({ ...other }) {
  const INITIAL_VISIBLE_COUNT = 10;
  const LOAD_STEP = 10;

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const { userInfo } = useUser();

  const [notifications, setNotifications] = useState<INotificationUserItem[]>();
  const [filteredNotifications, setFilteredNotifications] = useState<INotificationUserItem[]>([]);

  const drawer = useBoolean();

  const [currentTab, setCurrentTab] = useState('false');

  const totalNotification = notifications?.length || 0;
  const readCount = notifications?.filter((item) => item.isRead).length || 0;
  const unreadCount = notifications?.filter((item) => !item.isRead).length || 0;

  const TABS = [
    { value: 'false', label: 'New', count: unreadCount },
    { value: 'true', label: 'Read', count: readCount },
    { value: 'all', label: 'All', count: totalNotification },
  ];

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [notifications, currentTab]);

  useEffect(() => {
    if (!notifications) return;

    let filteredData = [...notifications];

    if (currentTab === 'true') {
      filteredData = notifications.filter((notification) => notification.isRead);
    } else if (currentTab === 'false') {
      filteredData = notifications.filter((notification) => !notification.isRead);
    }

    setFilteredNotifications(filteredData);
  }, [notifications, currentTab]);

  const fetchGetNotification = useCallback(async () => {
    if (!userInfo) return;
    try {
      const data = await getAllNotificationsByUser(userInfo?.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch latest attendance:', error);
    }
  }, [userInfo]);

  useEffect(() => {
    fetchGetNotification().then((r) => r);
  }, [fetchGetNotification]);

  const handleMarkAllAsRead = async () => {
    await patchReadAll(userInfo?.id);
    setNotifications(notifications?.map((notification) => ({ ...notification, isRead: true })));
  };

  const handleReadUser = async (reply: string, notificationId: string) => {
    await patchReadUser(notificationId, reply);
    setNotifications(
      notifications?.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const handleNotificationClick = async () => {
    drawer.onTrue();
    await fetchGetNotification();
  };

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {!!unreadCount && (
        <Tooltip title="Mark all as read">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton onClick={drawer.onFalse} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderTabs = (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'true' && 'success') ||
                (tab.value === 'false' && 'info') ||
                'default'
              }
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </CustomTabs>
  );

  const renderList = (
    <Scrollbar>
      <Box component="ul">
        {filteredNotifications.slice(0, visibleCount).map((notification) => (
          <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
            <NotificationItem
              notification={notification}
              onUpdate={(reply, notificationId) => handleReadUser(reply, notificationId)}
            />
          </Box>
        ))}

        {visibleCount < filteredNotifications.length && (
          <Box textAlign="center" sx={{ py: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => setVisibleCount((prev) => prev + LOAD_STEP)}
            >
              더 보기 ({visibleCount} / {filteredNotifications.length})
            </Typography>
          </Box>
        )}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={handleNotificationClick}
        {...other}
      >
        <Badge badgeContent={unreadCount} color="error">
          <SvgIcon>
            {/* https://icon-sets.iconify.design/solar/bell-bing-bold-duotone/ */}
            <path
              fill="currentColor"
              d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.794 25.794 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.393 4.393 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7"
              opacity="0.5"
            />
            <path
              fill="currentColor"
              d="M12.75 6a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0"
            />
          </SvgIcon>
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        {renderHead}

        {renderTabs}

        {renderList}
      </Drawer>
    </>
  );
}
