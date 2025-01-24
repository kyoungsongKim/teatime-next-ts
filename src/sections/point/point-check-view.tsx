'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';

import { useAuthContext } from 'src/auth/hooks';
import { getUserInfo } from 'src/utils/user-info';
import { useBoolean } from 'src/hooks/use-boolean';
import { getUserList } from 'src/actions/user-ssr';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { PointExpDialog } from './dialog/point-exp-dialog';
import { getSummaryPointList } from 'src/actions/point-ssr';
import { PointExpAllDialog } from './dialog/point-exp-all-dialog';
import {
  useTable,
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import type { CUserItem } from 'src/types/user';
import type { SummaryPointItem } from 'src/types/point';

const TABLE_HEAD = [
  { id: 'userId', label: 'USER ID' },
  { id: 'realName', label: '고객명' },
  { id: 'totalPoint', label: '포인트' },
  { id: 'level', label: 'LEVEL' },
  { id: 'totalExp', label: '경험치' },
];

export function PointCheckView() {
  // 사용자 정보 불러오기
  const { user } = useAuthContext();
  const { id, auth } = useMemo(() => getUserInfo(user), [user]);

  const [userList, setUserList] = useState<CUserItem[]>([]);

  // change point to exp dialog open/close
  const changeDialog = useBoolean();
  // change all point to exp dialog open/close
  const changeAllDialog = useBoolean();

  const table = useTable({
    defaultOrderBy: 'userId',
    defaultOrder: 'asc',
    defaultRowsPerPage: 10,
  });

  const [summaryData, setSummaryData] = useState<SummaryPointItem[]>([]);
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
      getSummaryPointList(id).then((r) => {
        setSummaryData(r.data);
      });
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    try {
      getUserList(id).then((r) => {
        if (r.status === 200) {
          setUserList(r.data);
        } else {
          setUserList([] as CUserItem[]);
        }
      });
    } catch (e) {
      setUserList([] as CUserItem[]);
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    fetchSummaryList();
  }, [fetchSummaryList]);

  return (
    <>
      <DashboardContent>
        <Stack spacing={1} sx={{ mb: { xs: 2, md: 3 } }}>
          <Stack spacing={1} direction="row" flexShrink={0} justifyContent="flex-end">
            <Button variant="soft" color="primary" onClick={changeAllDialog.onTrue}>
              Exp All Point → Exp
            </Button>
            <Button variant="soft" onClick={changeDialog.onTrue}>
              Change Point → Exp
            </Button>
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
          />
        </Card>
      </DashboardContent>
      <PointExpAllDialog
        id={id}
        open={changeAllDialog.value}
        onClose={changeAllDialog.onFalse}
        onUpdate={fetchSummaryList}
      />
      <PointExpDialog
        id={id}
        open={changeDialog.value}
        userList={userList}
        onClose={changeDialog.onFalse}
        onUpdate={fetchSummaryList}
      />
    </>
  );
}
