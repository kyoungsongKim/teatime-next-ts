import type {
  INotificationItem,
  INotificationUserItem,
  INotificationUserTableFilters,
} from 'src/types/notification';

import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { getUserNotificationList } from 'src/actions/notification-ssr';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { NotificationsUserTableRow } from 'src/sections/notification/notifications-user-table-row';
import { NotificationUserTableToolbar } from 'src/sections/notification/notifications-user-table-toolbar';
import { NotificationsUserTableFiltersResult } from 'src/sections/notification/notifications-user-table-filters-result';

type Props = {
  notification: INotificationItem | null;
  isAdmin: boolean;
};

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'realName', label: '이름' },
  { id: 'isRead', label: '읽음 여부' },
  { id: 'reply', label: '응답' },
  { id: 'createAt', label: '생성 시간' },
];

export const READ_STATUS_OPTIONS = [
  { value: 'true', label: 'Read' },
  { value: 'false', label: 'UnRead' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...READ_STATUS_OPTIONS];

export function NotificationsUserTable({ notification, isAdmin }: Props) {
  const table = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
  });

  const [tableData, setTableData] = useState<INotificationUserItem[]>();

  const filters = useSetState<INotificationUserTableFilters>({
    keyword: '',
    isRead: 'all',
  });

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const canReset = !!filters.state.keyword || filters.state.isRead !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const fetchGetNotification = useCallback(async () => {
    if (!isAdmin || !notification) return;

    try {
      const data = await getUserNotificationList(notification.id);
      setTableData(data);
    } catch (error) {
      console.error('Failed to fetch latest attendance:', error);
    }
  }, [isAdmin, notification]);

  useEffect(() => {
    fetchGetNotification().then((r) => r);
  }, [fetchGetNotification]);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      filters.setState({ isRead: newValue });
    },
    [filters, table]
  );

  return (
    <>
      <Grid xs={6} sm={6} md={6} alignSelf="center" display="inner-flex">
        <Typography variant="subtitle1">사용자 별 공지 현황</Typography>
      </Grid>
      <Grid xs={12} sm={12} md={12}>
        <Card>
          <Tabs
            value={filters.state.isRead}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.state.isRead) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'true' && 'success') ||
                      (tab.value === 'false' && 'warning') ||
                      'default'
                    }
                  >
                    {['true', 'false'].includes(tab.value)
                      ? (tableData || []).filter(
                          (userNotification) => String(userNotification.isRead) === tab.value
                        ).length
                      : (tableData || []).length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <NotificationUserTableToolbar filters={filters} onResetPage={table.onResetPage} />

          {canReset && (
            <NotificationsUserTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <NotificationsUserTableRow key={row.id} row={row} />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            rowsPerPageOptions={table.rowsPerPageOptions}
          />
        </Card>
      </Grid>
    </>
  );
}

type ApplyFilterProps = {
  inputData: INotificationUserItem[];
  filters: INotificationUserTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { keyword, isRead } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (keyword) {
    inputData = inputData.filter((notification) => {
      const searchUser = notification.user.realName
        ?.toLowerCase()
        .includes(keyword.trim().toLowerCase());
      const searchReply = notification.reply?.toLowerCase().includes(keyword.trim().toLowerCase());

      return Boolean(searchUser || searchReply);
    });
  }

  if (isRead !== 'all') {
    inputData = inputData.filter((order) => String(order.isRead) === isRead);
  }

  return inputData;
}
