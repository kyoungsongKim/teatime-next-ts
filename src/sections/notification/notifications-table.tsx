import type { IUserItem } from 'src/types/user';
import type { INotificationItem, INotificationTableFilters } from 'src/types/notification';

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { deleteNotification, getAllNotifications } from 'src/actions/notification-ssr';

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

import { NotificationsTableRow } from 'src/sections/notification/notifications-table-row';
import { NotificationDialog } from 'src/sections/notification/dialog/notification-dialog';
import { NotificationsUserTable } from 'src/sections/notification/notifications-user-table';
import { NotificationsTableToolbar } from 'src/sections/notification/notifications-table-toolbar';
import { NotificationsTableFiltersResult } from 'src/sections/notification/notifications-table-filters-result';

type Props = {
  userInfo: IUserItem | null;
  isAdmin: boolean;
};

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'notificationType', label: '알람 종류' },
  { id: 'title', label: '제목' },
  { id: 'content', label: '내용' },
  { id: 'isGlobal', label: '공지 타입' },
  { id: 'createAt', label: '생성 시간' },
  { id: '', label: '' },
];

export function NotificationsTable({ userInfo, isAdmin }: Props) {
  const onNotificationOpen = useBoolean();
  const [selectedNotification, setSelectedNotification] = useState<INotificationItem | null>(null);
  const [selectedDetailNotification, setSelectedDetailNotification] =
    useState<INotificationItem | null>(null);

  const table = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
  });

  const [tableData, setTableData] = useState<INotificationItem[]>();

  const filters = useSetState<INotificationTableFilters>({
    keyword: '',
  });

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const canReset = !!filters.state.keyword;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const fetchGetNotification = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const data = await getAllNotifications();
      setTableData(data);
    } catch (error) {
      console.error('Failed to fetch latest attendance:', error);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchGetNotification().then((r) => r);
  }, [fetchGetNotification]);

  const updateList = () => {
    fetchGetNotification().then((r) => r);
  };

  const handleOpenAdd = () => {
    setSelectedNotification(null);
    onNotificationOpen.onTrue();
  };

  const handleDetail = (notification: INotificationItem) => {
    setSelectedDetailNotification(notification);
  };

  const handleEdit = (notification: INotificationItem) => {
    setSelectedNotification(notification);
    onNotificationOpen.onTrue();
  };

  const handleDelete = async (notification: INotificationItem) => {
    try {
      await deleteNotification(notification.id).then((r) => {
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          toast.success('공지 삭제가 완료되었습니다.');
          updateList();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={6} sm={6} md={6} alignSelf="center" display="inner-flex">
          <Typography variant="subtitle1">공지 설정</Typography>
        </Grid>
        <Grid xs={6} sm={6} md={6} textAlign="end">
          <Button variant="soft" color="primary" onClick={handleOpenAdd}>
            공지 추가
          </Button>
        </Grid>
        <Grid xs={12} sm={12} md={12}>
          <Card>
            <NotificationsTableToolbar filters={filters} onResetPage={table.onResetPage} />

            {canReset && (
              <NotificationsTableFiltersResult
                filters={filters}
                totalResults={dataFiltered.length}
                onResetPage={table.onResetPage}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            <Box sx={{ position: 'relative' }}>
              <Scrollbar sx={{ minHeight: 300 }}>
                <Table
                  size={table.dense ? 'small' : 'medium'}
                  sx={{ minWidth: 960, width: '100%', tableLayout: 'auto' }}
                >
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
                        <NotificationsTableRow
                          key={row.id}
                          row={row}
                          onDetail={handleDetail}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
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
        <NotificationsUserTable notification={selectedDetailNotification} isAdmin={isAdmin} />
      </Grid>

      <NotificationDialog
        userInfo={userInfo || null}
        open={onNotificationOpen.value}
        onClose={onNotificationOpen.onFalse}
        notification={selectedNotification}
        onUpdate={updateList}
      />
    </>
  );
}

type ApplyFilterProps = {
  inputData: INotificationItem[];
  filters: INotificationTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { keyword } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (keyword) {
    inputData = inputData.filter((notification) => {
      const searchTitle = notification.title?.toLowerCase().includes(keyword.trim().toLowerCase());
      const searchContent = notification.content
        ?.toLowerCase()
        .includes(keyword.trim().toLowerCase());

      return Boolean(searchTitle || searchContent);
    });
  }

  return inputData;
}
