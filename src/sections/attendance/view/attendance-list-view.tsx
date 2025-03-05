'use client';

import type { CUserItem } from 'src/types/user';
import type { IAttendanceItem, IAttendanceTableFilters } from 'src/types/attendance';

import React, { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSetState } from 'src/hooks/use-set-state';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { getUserList } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { getAttendance } from 'src/actions/attendance-ssr';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { useUser } from 'src/auth/context/user-context';

import { AttendanceTableRow } from '../attendance-table-row';
import { AttendanceTableToolbar } from '../attendance-table-toolbar';
import { AttendanceTableFiltersResult } from '../attendance-table-filters-result';

// ----------------------------------------------------------------------

export const WORK_STATUS_OPTIONS = [
  { value: 'OFFICE', label: '정상근무' },
  { value: 'REMOTE', label: '재택' },
  { value: 'FIELD', label: '외근' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...WORK_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'workType', label: '업무 종류' },
  { id: 'workDate', label: '업무일' },
  { id: 'workStartTime', label: '시작시간' },
  { id: 'workEndTime', label: '종료시간' },
  { id: 'location', label: '위치' },
  { id: 'managerName', label: '승인자' },
  { id: 'taskDescription', label: '업무내용' },
];

// ----------------------------------------------------------------------

export function AttendanceListView() {
  const { userInfo, isAdmin } = useUser();

  const [userName, setUserName] = useState<string>(userInfo?.id || ''); // 사용자 이름 상태
  const [userList, setUserList] = useState<CUserItem[]>([]); // 사용자 리스트 상태

  const popover = usePopover();
  const router = useRouter();

  const table = useTable({
    defaultOrderBy: 'workDate',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
  });

  const [tableData, setTableData] = useState<IAttendanceItem[]>();

  const filters = useSetState<IAttendanceTableFilters>({
    name: '',
    workType: 'all',
    workStartDate: null,
    workEndDate: null,
  });

  const dateError = fIsAfter(filters.state.workStartDate, filters.state.workEndDate);

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    dateError,
  });

  const canReset =
    !!filters.state.name ||
    filters.state.workType !== 'all' ||
    (!!filters.state.workStartDate && !!filters.state.workEndDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      filters.setState({ workType: newValue });
    },
    [filters, table]
  );

  const fetchLatestAttendance = useCallback(async () => {
    try {
      if (userName) {
        const today = new Date().toISOString().split('T')[0];
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        threeMonthsAgo.setDate(1);
        const endDate = threeMonthsAgo.toISOString().split('T')[0];
        const data = await getAttendance(userName, endDate, today);
        setTableData(data);
      }
    } catch (error) {
      console.error('Failed to fetch latest attendance:', error);
    }

    // 관리자일 경우 사용자 리스트 가져오기
    if (isAdmin) {
      getUserList().then((data) => setUserList(data.data));
    }
  }, [isAdmin, userName]);

  useEffect(() => {
    fetchLatestAttendance().then((r) => r);
  }, [fetchLatestAttendance]);

  useEffect(() => {
    if (userInfo?.id) {
      setUserName(userInfo.id);
    }
  }, [userInfo]);

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        {/* 관리자의 경우 사용자 리스트 노출 */}
        {isAdmin && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
            <Grid xs={12} md={12} flexGrow={1}>
              <FormControl size="small" fullWidth>
                <Autocomplete
                  options={userList} // 사용자 목록
                  getOptionLabel={(option) => `${option.realName} (${option.id})`} // 항목 표시 형식
                  value={userList.find((item) => item.id === userName) || null} // 현재 선택된 값
                  onChange={(_, newValue) => {
                    setUserName(newValue?.id || userInfo?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="사용자 선택" variant="outlined" />
                  )}
                />
              </FormControl>
            </Grid>

            <IconButton onClick={popover.onOpen} sx={{ alignSelf: 'center' }}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        )}
        <Grid xs={12} md={12}>
          <Card>
            <Tabs
              value={filters.state.workType}
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
                        ((tab.value === 'all' || tab.value === filters.state.workType) &&
                          'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'OFFICE' && 'success') ||
                        (tab.value === 'REMOTE' && 'warning') ||
                        (tab.value === 'FIELD' && 'error') ||
                        'default'
                      }
                    >
                      {['OFFICE', 'REMOTE', 'FIELD'].includes(tab.value)
                        ? (tableData || []).filter((work) => work.workType === tab.value).length
                        : (tableData || []).length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <AttendanceTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
              dateError={dateError}
            />

            {canReset && (
              <AttendanceTableFiltersResult
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
                        <AttendanceTableRow key={row.workId} row={row} />
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
      </Grid>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={() => router.push(paths.root.attendance.monthSummary)}>
            Total Attendance
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  dateError: boolean;
  inputData: IAttendanceItem[];
  filters: IAttendanceTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
  const { workType, name, workStartDate, workEndDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((attendance) => {
      const searchName = attendance.managerName?.toLowerCase().includes(name.trim().toLowerCase());
      const searchDescription = attendance.taskDescription
        ?.toLowerCase()
        .includes(name.trim().toLowerCase());
      const searchLocation = attendance.location?.toLowerCase().includes(name.trim().toLowerCase());

      return Boolean(searchName || searchDescription || searchLocation);
    });
  }

  if (workType !== 'all') {
    inputData = inputData.filter((order) => order.workType === workType);
  }

  if (!dateError) {
    if (workStartDate && workEndDate) {
      inputData = inputData.filter((attendance) =>
        fIsBetween(attendance.workDate, workStartDate, workEndDate)
      );
    }
  }

  return inputData;
}
