'use client';

import type { SummaryPointItem } from 'src/types/point';

import React, { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';

import { getUserInfo } from 'src/utils/user-info';

import { DashboardContent } from 'src/layouts/dashboard';
import { getMonthPointList } from 'src/actions/point-ssr';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { useAuthContext } from 'src/auth/hooks';

const TABLE_HEAD = [
  { id: 'realName', label: '고객명' },
  { id: 'userId', label: 'USER ID' },
  { id: 'totalPoint', label: '이번달 획득 총 포인트' },
  { id: 'totalExp', label: '이용 후 기부 횟수' },
  { id: 'level', label: '기부 안한 횟수' },
];

export function PointMonthSummaryView() {
  // 사용자 정보 불러오기
  const { user } = useAuthContext();
  const { id } = useMemo(() => getUserInfo(user), [user]);

  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear().toString());
  const yearList = useMemo(() => {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();

    return Array.from({ length: currentYear - startYear + 1 }, (_, index) =>
      String(startYear + index)
    );
  }, []);

  const [selectedMonth, setSelectedMonth] = React.useState(String(new Date().getMonth() + 1));
  const monthList = useMemo(() => Array.from({ length: 12 }, (_, index) => String(index + 1)), []);

  const table = useTable({
    defaultOrderBy: 'realName',
    defaultOrder: 'asc',
    defaultRowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
  });
  const [summaryData, setSummaryData] = React.useState<SummaryPointItem[]>([]);
  // 정렬된 데이터
  const dataFiltered = useMemo(() => {
    const comparator = getComparator(table.order, table.orderBy);

    return summaryData.sort((a, b) => {
      const aOrderTarget: number | string = a[table.orderBy as keyof SummaryPointItem];
      const bOrderTarget: number | string = b[table.orderBy as keyof SummaryPointItem];

      if (typeof aOrderTarget === 'string' && typeof bOrderTarget === 'string') {
        // 문자열 정렬 (대소문자 구분 없음)
        const comparison = aOrderTarget.toLowerCase().localeCompare(bOrderTarget.toLowerCase());
        return table.order === 'asc' ? comparison : -comparison;
      }
      if (typeof aOrderTarget === 'number' && typeof bOrderTarget === 'number') {
        // 숫자 정렬
        const comparison = aOrderTarget - bOrderTarget;
        return table.order === 'asc' ? comparison : -comparison;
      }

      // 데이터 타입이 다를 경우, 문자열과 숫자의 우선순위 처리 (선택적으로 구현 가능)
      return comparator(a, b);
    });
  }, [summaryData, table.order, table.orderBy]);

  const fetchSummaryList = useCallback(() => {
    try {
      getMonthPointList(id, selectedYear, selectedMonth).then((r) => {
        setSummaryData(r.data);
      });
    } catch (e) {
      console.error(e);
    }
  }, [id, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSummaryList();
  }, [fetchSummaryList]);

  return (
    <DashboardContent>
      <Stack spacing={1} sx={{ mb: { xs: 2, md: 3 } }}>
        <Stack spacing={1} direction="row" flexShrink={0}>
          <Select
            variant="outlined"
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {yearList.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
          <Select
            variant="outlined"
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthList.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>
      <Card>
        <Box sx={{ position: 'relative' }}>
          <Scrollbar sx={{ minHeight: 300 }}>
            <Table size="medium" sx={{ minWidth: 500 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                onSort={table.onSort}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <TableRow key={row.userId}>
                      {TABLE_HEAD.map((head) => (
                        <TableCell key={head.id}>
                          {row[head.id as keyof SummaryPointItem].toLocaleString()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                <TableEmptyRows
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>
        <TablePaginationCustom
          page={table.page}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          rowsPerPageOptions={table.rowsPerPageOptions}
        />
      </Card>
    </DashboardContent>
  );
}
