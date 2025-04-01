'use client';

import type { IUserItem } from 'src/types/user';
import type { ICbankItem, ICbankTableFilters } from 'src/types/cbank';

import dayjs from 'dayjs';
import React, { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { useSetState } from 'src/hooks/use-set-state';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { getUserList } from 'src/actions/user-ssr';
import { getCbankHistory } from 'src/actions/monthly-sales-ssr';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { usePopover } from 'src/components/custom-popover';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { AccountCbankTableRow } from 'src/sections/account/account-cbank-table-row';
import { AccountCbankTableToolbar } from 'src/sections/account/account-cbank-table-toolbar';
import { AccountCbankTableFiltersResult } from 'src/sections/account/account-cbank-table-filters-result';

import { useUser } from 'src/auth/context/user-context';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// ----------------------------------------------------------------------
export const CBANK_STATUS_OPTIONS = [
  { value: 'Internal', label: '내부이체' },
  { value: 'External', label: '외부이체' },
  { value: 'Salary', label: '급여이체' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...CBANK_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'date', label: '날짜', width: '10%' },
  { id: 'history', label: '상세내용', width: '60%' },
  { id: 'amount', label: 'CAS', width: '30%', align: 'right' },
];

// ----------------------------------------------------------------------

export function AccountCbankInfo() {
  const { userInfo, isAdmin } = useUser();
  const [userName, setUserName] = useState<string>(userInfo?.id || ''); // 사용자 이름 상태
  const [userList, setUserList] = useState<IUserItem[]>([]); // 사용자 리스트 상태
  const [monthRange, setMonthRange] = useState<number>(3);

  const popover = usePopover();

  const table = useTable({
    defaultOrderBy: 'date',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
  });

  const [tableData, setTableData] = useState<ICbankItem[]>();

  const filters = useSetState<ICbankTableFilters>({
    keyword: '',
    type: 'all',
    transferStartDate: null,
    transferEndDate: null,
  });

  const dateError = fIsAfter(filters.state.transferStartDate, filters.state.transferEndDate);

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    dateError,
  });

  const canReset =
    !!filters.state.keyword ||
    filters.state.type !== 'all' ||
    (!!filters.state.transferStartDate && !!filters.state.transferEndDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      filters.setState({ type: newValue });
    },
    [filters, table]
  );

  const fetchLatestCbankMonth = useCallback(async () => {
    try {
      const todayKST = dayjs().format('YYYY-MM-DD');
      const threeMonthsAgo = dayjs()
        .subtract(monthRange, 'month')
        .startOf('month')
        .format('YYYY-MM-DD');

      const data = await getCbankHistory(userName, threeMonthsAgo, todayKST);
      setTableData(data);

      if (isAdmin) {
        const userListRes = await getUserList();
        setUserList(userListRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch cbank history or user list:', error);
    }
  }, [isAdmin, userName, monthRange]);

  useEffect(() => {
    fetchLatestCbankMonth().then((r) => r);
  }, [fetchLatestCbankMonth]);

  useEffect(() => {
    if (userInfo?.id) {
      setUserName(userInfo.id);
    }
  }, [userInfo]);

  return (
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
        <FormControl fullWidth>
          <InputLabel>조회 개월 수</InputLabel>
          <Select
            value={monthRange}
            label="조회 개월 수"
            onChange={(e) => setMonthRange(Number(e.target.value))}
          >
            <MenuItem value={3}>최근 3개월</MenuItem>
            <MenuItem value={6}>최근 6개월</MenuItem>
            <MenuItem value={9}>최근 9개월</MenuItem>
            <MenuItem value={12}>최근 12개월</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid xs={12} md={12}>
        <Card>
          <Tabs
            value={filters.state.type}
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
                      ((tab.value === 'all' || tab.value === filters.state.type) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'Internal' && 'success') ||
                      (tab.value === 'External' && 'warning') ||
                      (tab.value === 'Salary' && 'error') ||
                      'default'
                    }
                  >
                    {['Internal', 'External', 'Salary'].includes(tab.value)
                      ? (tableData || []).filter((work) => work.type === tab.value).length
                      : (tableData || []).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <AccountCbankTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            dateError={dateError}
          />

          {canReset && (
            <AccountCbankTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative', width: '100%' }}>
            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'}>
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
                      <AccountCbankTableRow key={row.id} row={row} />
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
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  dateError: boolean;
  inputData: ICbankItem[];
  filters: ICbankTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
  const { type, keyword, transferStartDate, transferEndDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (keyword) {
    inputData = inputData.filter((cbank) => {
      const senderName = cbank.sendName?.toLowerCase().includes(keyword.trim().toLowerCase());
      const recvName = cbank.recvName?.toLowerCase().includes(keyword.trim().toLowerCase());
      const sendAccount = cbank.sendAccount?.toLowerCase().includes(keyword.trim().toLowerCase());
      const recvAccount = cbank.recvAccount?.toLowerCase().includes(keyword.trim().toLowerCase());
      const history = cbank.history?.toLowerCase().includes(keyword.trim().toLowerCase());
      const status = cbank.status?.toLowerCase().includes(keyword.trim().toLowerCase());
      const memo = cbank.memo?.toLowerCase().includes(keyword.trim().toLowerCase());

      return Boolean(
        senderName || recvName || sendAccount || recvAccount || history || status || memo
      );
    });
  }

  if (type !== 'all') {
    inputData = inputData.filter((order) => order.type === type);
  }

  if (!dateError) {
    if (transferStartDate && transferEndDate) {
      inputData = inputData.filter((cbank) =>
        fIsBetween(cbank.date, transferStartDate, transferEndDate)
      );
    }
  }

  return inputData;
}
