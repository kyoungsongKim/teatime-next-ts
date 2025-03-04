import type { ApplyItem } from 'src/types/assistance';
import type { SelectChangeEvent } from '@mui/material/Select';

import { toast } from 'sonner';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Grid from '@mui/material/Unstable_Grid2';

import { makeDateString } from 'src/utils/format-date';

import { patchAssistanceStatus, patchAssistanceReceive } from 'src/actions/assistance';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

type Props = {
  item: ApplyItem[];
  onUpdate: () => void;
  detailOpen: (row: ApplyItem) => void;
  onReviewOpen: (row: ApplyItem) => void;
};

export const TABLE_HEAD = [
  { id: 'assistance.name', label: '서비스 이름' },
  { id: 'createdDate', label: '신청시간' },
  { id: 'assistance.price', label: '금액' },
  { id: 'applied.id', label: '신청한 사람' },
  { id: 'receiver.id', label: '수락한 사람' },
  { id: 'status', label: '현재 상태' },
];

const applyFilter = (inputData: ApplyItem[], comparator: (a: any, b: any) => number) => {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);

    if (order !== 0) return order;

    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  return inputData;
};

export function AppliedServiceAdminTable({ item, onUpdate, detailOpen, onReviewOpen }: Props) {
  const statusItems = [
    { value: 'WAITING', label: '접수전' },
    { value: 'IN_PROGRESS', label: '처리중' },
    { value: 'COMPLETED', label: '처리완료' },
  ];
  const [statusFilter, setStatusFilter] = useState<string[]>([
    'WAITING',
    'IN_PROGRESS',
    'COMPLETED',
  ]);

  const table = useTable({
    defaultOrder: 'desc',
    defaultOrderBy: 'createdDate',
    defaultRowsPerPage: 10,
  });

  const dataFiltered = useMemo(() => {
    const filteredByStatus = statusFilter.length
      ? item.filter((row) => statusFilter.includes(row.status))
      : item;

    return applyFilter(filteredByStatus, getComparator(table.order, table.orderBy));
  }, [item, statusFilter, table.order, table.orderBy]);

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setStatusFilter(value);
  };

  const receiveService = (applyItem: ApplyItem) => {
    if (!applyItem) {
      toast.error('수락할 서비스가 없습니다.');
      return;
    }
    patchAssistanceReceive(applyItem.id).then((r) => {
      if (r.status === 200) {
        toast.success(
          `${applyItem.applier.realName}이 신청한 서비스 ${applyItem.assistance.name}을 수락하였습니다.`
        );
        onUpdate();
      } else {
        toast.error(`[${r.status}] 서비스 수락에 실패했습니다.`);
      }
    });
  };

  const changeServiceStatus = async (applyItem: ApplyItem, status: string) => {
    if (!applyItem) {
      toast.error('변경할 서비스가 없습니다.');
      return;
    }
    await patchAssistanceStatus(applyItem.id, status)
      .then((r) => {
        if (r.status === 200) {
          toast.success(`서비스 상태를 변경하였습니다.`);
          onUpdate();
        } else {
          toast.error(`[${r.status}] 서비스 상태 변경에 실패했습니다.`);
        }
      })
      .catch(() => {
        toast.error('서비스 상태 변경에 실패했습니다.');
      });
  };

  return (
    <Card>
      <Grid container spacing={1}>
        <Grid xs={12} sm={12} md={12} textAlign="end" sx={{ p: 2 }}>
          <Select
            multiple
            size="small"
            value={statusFilter}
            onChange={handleStatusChange}
            renderValue={(selected) =>
              selected.length > 0
                ? selected
                    .map(
                      (value) =>
                        statusItems.find((selectedItem) => selectedItem.value === value)?.label
                    )
                    .join(',')
                : '필터 선택'
            }
            sx={{ minWidth: { xs: '100%', sm: '50%', md: '30%' }, textAlign: 'start' }}
            variant="outlined"
          >
            {statusItems.map((statusItem) => (
              <MenuItem key={statusItem.value} value={statusItem.value}>
                {statusItem.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
      <Scrollbar sx={{ minHeight: '200' }}>
        <Table size="medium" sx={{ minWidth: 900 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {dataFiltered.length === 0 ? (
              <TableNoData notFound />
            ) : (
              dataFiltered
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Link sx={{ cursor: 'pointer' }} onClick={() => detailOpen(row)}>
                        {row.assistance.name}
                      </Link>
                    </TableCell>
                    <TableCell>{makeDateString(new Date(row.createdDate), 4)}</TableCell>
                    <TableCell>{row.assistance.price.toLocaleString()} CAS</TableCell>
                    <TableCell>{row.applier.realName}</TableCell>
                    <TableCell>{!row.receiver ? '없음' : row.receiver.realName}</TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        {!row.receiver ? (
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            접수 전
                            <Button
                              color="primary"
                              variant="soft"
                              size="small"
                              sx={{ marginLeft: { xs: 3, sm: 3, md: 4 } }}
                              onClick={() => receiveService(row)}
                            >
                              수락
                            </Button>
                          </Stack>
                        ) : !row.review ? (
                          <Select
                            size="small"
                            variant="outlined"
                            value={row.status}
                            onChange={(e) => changeServiceStatus(row, e.target.value as string)}
                          >
                            {statusItems.map((status) => (
                              <MenuItem
                                key={status.value}
                                value={status.value}
                                disabled={status.value === 'WAITING'}
                              >
                                {status.label}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Box onClick={() => onReviewOpen(row)}>
                            <Rating value={row.review.rating} readOnly />
                          </Box>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePaginationCustom
        page={table.page}
        count={dataFiltered.length}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
}
