import type { INotificationUserItem } from 'src/types/notification';

import React from 'react';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fTimeForString } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type Props = {
  row: INotificationUserItem;
};

export function AccountNotificationsUserTableRow({ row }: Props) {
  return (
    <TableRow hover>
      <TableCell>{row.id}</TableCell>
      <TableCell>{row.user.realName}</TableCell>
      <TableCell>
        <Label variant="soft" color={(row.isRead && 'success') || 'default'}>
          {row.isRead ? 'Read' : 'Unread'}
        </Label>
      </TableCell>
      <TableCell>{row.reply}</TableCell>
      <TableCell>{fTimeForString(row.createdAt || '', 'YYYY-MM-DD HH:mm:ss')}</TableCell>
    </TableRow>
  );
}
