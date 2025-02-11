import type { ApplyItem } from 'src/types/assistance';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Rating from '@mui/material/Rating';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';

import { makeDateString } from 'src/utils/format-date';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

type Props = {
  item: ApplyItem[];
  detailOpen: (row: ApplyItem) => void;
  reviewOpen: (row: ApplyItem) => void;
};

const TABLE_HEAD = [
  { id: 'assistance.name', label: '서비스 이름' },
  { id: 'createdDate', label: '신청시간' },
  { id: 'receiver.realName', label: '수락한 사람' },
  { id: 'status', label: '현재 상태' },
];

export function AppliedServiceTable({ item, detailOpen, reviewOpen }: Props) {
  const table = useTable({
    defaultOrder: 'desc',
    defaultOrderBy: 'createdDate',
    defaultRowsPerPage: 10,
  });

  return (
    <Card>
      <Scrollbar sx={{ minHeight: '200' }}>
        <Table size="medium" sx={{ minWidth: 600 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {item.length === 0 ? (
              <TableNoData notFound />
            ) : (
              item
                .sort((a, b) => -a.createdDate.localeCompare(b.createdDate))
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link onClick={() => detailOpen(row)} sx={{ cursor: 'pointer' }}>
                        {row.assistance.name}
                      </Link>
                    </TableCell>
                    <TableCell>{makeDateString(new Date(row.createdDate), 4)}</TableCell>
                    <TableCell>{row.receiver?.realName ?? '없음'}</TableCell>
                    <TableCell>
                      {/* WAITING: 접수 대기중, IN_PROGRESS: 처리중, COMPLETE: 리뷰 필요(review === null), rating(review !== null) */}
                      {row.status === 'IN_PROGRESS' ? (
                        '처리중'
                      ) : row.status === 'COMPLETED' ? (
                        row.review === null ? (
                          <Link onClick={() => reviewOpen(row)} sx={{ cursor: 'pointer' }}>
                            리뷰 필요
                          </Link>
                        ) : (
                          <Box onClick={() => reviewOpen(row)}>
                            <Rating
                              name={`${row.assistance.name} rating`}
                              value={row.review?.rating}
                              readOnly
                            />
                          </Box>
                        )
                      ) : (
                        '접수 전'
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePaginationCustom
        page={table.page}
        count={item.length}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
}
