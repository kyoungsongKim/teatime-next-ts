'use client';

import type { IAgreementItem, IAgreementTableFilters } from 'src/types/agreement';

import { mutate } from 'swr';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { endpoints } from 'src/utils/axios';
import { fIsAfter } from 'src/utils/format-time';

import { deleteUserInfo } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetUserAgreementData } from 'src/actions/agreement';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useUser } from 'src/auth/context/user-context';

import { AgreementTableRow } from '../agreement-table-row';
import { AgreementTableToolbar } from '../agreement-table-toolbar';
import { AgreementTableFiltersResult } from '../agreement-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'realName', label: '이름', align: 'center', width: 100 },
  {
    id: 'agreementCount',
    label: '유효/전체 계약 건',
    width: 200,
    align: 'center',
    hideOnMobile: true,
  },
  { id: 'amountPercent', label: '달성율', width: 120, align: 'center', hideOnMobile: true },
  { id: 'amount', label: '현재/목표 CAS', width: 200, align: 'center' },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function AgreementListView() {
  const { userInfo, isAdmin } = useUser();

  const table = useTable({
    defaultRowsPerPage: 10,
    defaultOrderBy: 'realName',
    rowsPerPageOptions: [10, 50, 100],
  });

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState<IAgreementItem[]>([]);

  const { agreementInfos, agreementInfosLoading } = useGetUserAgreementData(userInfo?.id, isAdmin);

  const filters = useSetState<IAgreementTableFilters>({
    realName: '',
  });

  const dateError = fIsAfter(filters.state.realName, filters.state.realName);

  function getCustomComparator(
    order: 'asc' | 'desc',
    orderBy: string
  ): (a: IAgreementItem, b: IAgreementItem) => number {
    const accessors: Record<string, (row: IAgreementItem) => any> = {
      amountPercent: (row) =>
        row.totalAmount && row.guaranteeAmount ? (row.totalAmount * 100) / row.guaranteeAmount : 0,
      agreementCount: (row) => row.totalAgreementCount,
      amount: (row) => row.guaranteeAmount,
    };

    return (a, b) => {
      const getValue = accessors[orderBy] || ((row: any) => row[orderBy]);
      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return order === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    };
  }

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getCustomComparator(table.order, table.orderBy),
    filters: filters.state,
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!filters.state.realName;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  useEffect(() => {
    if (!agreementInfosLoading && agreementInfos.length > 0) {
      setTableData(agreementInfos);
    }
  }, [agreementInfos, agreementInfosLoading]);

  const handleDeleteRow = useCallback(
    (userId: string) => {
      deleteUserInfo(userId)
        .then((r) => {
          const deleteRow = tableData.filter((row) => row.userId !== userId);

          toast.success('삭제에 성공 했습니다.');

          setTableData(deleteRow);

          table.onUpdatePageDeleteRow(dataInPage.length);
        })
        .catch((e) => {
          toast.error('삭제에 실패 했습니다.');
        });
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success('삭제에 성공 했습니다.');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleUpdateRow = () => {
    const apiUrl = isAdmin
      ? endpoints.agreement.info
      : `${endpoints.agreement.info}/${userInfo?.id}`;
    mutate(apiUrl, undefined, { revalidate: true });
  };

  const handleViewRow = useCallback(
    (userId: string) => {
      router.push(paths.root.agreement.details(userId));
    },
    [router]
  );

  return (
    <>
      <DashboardContent>
        <Grid xs={12} md={12}>
          <Card>
            <AgreementTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
              dateError={dateError}
            />

            {canReset && (
              <AgreementTableFiltersResult
                filters={filters}
                totalResults={dataFiltered.length}
                onResetPage={table.onResetPage}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            <Box sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
                action={
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Scrollbar sx={{ minHeight: 444, overflowX: 'auto' }}>
                <Table
                  size={table.dense ? 'small' : 'medium'}
                  sx={{ minWidth: { xs: '100%', sm: 600, md: 960 } }}
                >
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        dataFiltered.map((row) => row.id)
                      )
                    }
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <AgreementTableRow
                          isAdmin={isAdmin}
                          key={row.id + row.userId}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.userId)}
                          onUpdateRow={() => handleUpdateRow()}
                          onViewRow={() => handleViewRow(row.userId)}
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
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  dateError: boolean;
  inputData: IAgreementItem[];
  filters: IAgreementTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
  const { realName } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (realName) {
    inputData = inputData.filter(
      (agreement) => agreement.realName.toLowerCase().indexOf(realName.toLowerCase()) !== -1
    );
  }

  return inputData;
}
