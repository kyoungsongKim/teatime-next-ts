'use client';

import type { CUserItem } from 'src/types/user';
import type { PointItem } from 'src/types/point';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { getUserList } from 'src/actions/user-ssr';
import { getPointList } from 'src/actions/point-ssr';
import { DashboardContent } from 'src/layouts/dashboard';

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

import { PointListTableRow } from './point-list-table-row';
import { PointDonateDialog } from './dialog/point-donate-dialog';
import { PointCreateDialog } from './dialog/point-create-dialog';

const TABLE_HEAD = [
  { id: 'createdDate', label: 'CREATED DATE' },
  { id: 'useDate', label: 'USE DATE' },
  { id: 'memo', label: 'MEMO' },
  { id: 'point', label: 'POINT' },
  { id: 'sender', label: 'SENDER' },
  { id: 'code', label: 'CODE', align: 'right' },
];

export function PointView() {
  const notFound = false;

  // 사용자 정보 불러오기
  const { userInfo, isAdmin } = useUser();

  const router = useRouter();

  const popover = usePopover();
  // donate point dialog open/close
  const donateDialog = useBoolean();
  // create point dialog open/close
  const createDialog = useBoolean();

  const table = useTable({
    defaultOrderBy: 'createdDate',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
  });
  const [pointData, setPointData] = useState<PointItem[]>([]);
  const dataFiltered = useMemo(() => {
    const comparator = getComparator(table.order, table.orderBy);

    return pointData.sort(comparator);
  }, [pointData, table]);

  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const yearList = useMemo(() => {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();

    return Array.from({ length: currentYear - startYear + 1 }, (_, index) =>
      String(startYear + index)
    );
  }, []);

  const [userList, setUserList] = useState<CUserItem[]>([]);

  const fetchPointList = useCallback(() => {
    getPointList(userInfo?.id || '', selectedYear).then((r) => {
      setPointData(r);
    });
  }, [userInfo?.id, selectedYear]);

  useEffect(() => {
    fetchPointList();
  }, [fetchPointList]);

  useEffect(() => {
    try {
      getUserList(userInfo?.id || '').then((r) => {
        if (r.status === 200) {
          setUserList(r.data);
        }
      });
    } catch (error) {
      setUserList([] as CUserItem[]);
      console.error(error);
    }
  }, [userInfo?.id]);

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Stack spacing={2.5} sx={{ mb: { xs: 2, md: 3 } }}>
          <Stack
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-end', sm: 'center' }}
            direction={{ xs: 'row', sm: 'row' }}
          >
            <FormControl size="small">
              <Select
                variant="outlined"
                value={selectedYear}
                onChange={(newValue) => setSelectedYear(newValue.target.value)}
              >
                {yearList.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} flexShrink={0}>
              <Button variant="soft" color="primary" onClick={donateDialog.onTrue}>
                Donation Point
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="soft"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={createDialog.onTrue}
                  >
                    Create Point
                  </Button>
                  <IconButton onClick={popover.onOpen}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
        {isAdmin && (
          <CustomPopover
            open={popover.open}
            anchorEl={popover.anchorEl}
            onClose={popover.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
          >
            <MenuList>
              <MenuItem onClick={() => router.push(paths.root.point.pointCheck)}>
                Point Check
              </MenuItem>
              <MenuItem onClick={() => router.push(paths.root.point.monthSummary)}>
                Month Summary
              </MenuItem>
            </MenuList>
          </CustomPopover>
        )}
        <Card>
          <Box sx={{ position: 'relative' }}>
            <Scrollbar sx={{ minHeight: 300 }}>
              <Table size="medium" sx={{ minWidth: 800 }}>
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
                      <PointListTableRow key={row.id} row={row} />
                    ))}
                  <TableEmptyRows
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />
                  <TableNoData notFound={notFound} />
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
      <PointDonateDialog
        id={userInfo?.id || ''}
        open={donateDialog.value}
        onClose={donateDialog.onFalse}
        onUpdate={fetchPointList}
      />
      <PointCreateDialog
        id={userInfo?.id || ''}
        open={createDialog.value}
        userList={userList}
        onClose={createDialog.onFalse}
      />
    </>
  );
}
