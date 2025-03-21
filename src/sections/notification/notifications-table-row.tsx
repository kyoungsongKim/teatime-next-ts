import type { INotificationItem } from 'src/types/notification';

import React from 'react';

import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { fTimeForString } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { NotificationLabels } from 'src/types/notification';

// ----------------------------------------------------------------------

type Props = {
  row: INotificationItem;
  onDetail: (notification: INotificationItem) => void;
  onEdit: (notification: INotificationItem) => void;
  onDelete: (notification: INotificationItem) => void;
};

export function NotificationsTableRow({ row, onDetail, onEdit, onDelete }: Props) {
  const popover = usePopover();
  return (
    <>
      <TableRow hover>
        <TableCell>{row.id}</TableCell>
        <TableCell>{NotificationLabels[row.notificationType]}</TableCell>
        <TableCell>{row.title}</TableCell>
        <TableCell>{row.content}</TableCell>
        <TableCell>
          <Label variant="soft" color={(row.isGlobal && 'success') || 'default'}>
            {row.isGlobal ? '전체' : '개별'}
          </Label>
        </TableCell>
        <TableCell>{fTimeForString(row.createdAt || '', 'YYYY-MM-DD HH:mm:ss')}</TableCell>
        <TableCell>
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onDetail(row);
            }}
          >
            <Iconify icon="solar:eye-bold" />
            상세 보기
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onEdit(row);
            }}
          >
            <Iconify icon="solar:pen-bold" />
            수정
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onDelete(row);
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            삭제
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
