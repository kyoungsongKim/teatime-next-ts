import type { VacationHistoryItem } from 'src/types/vacation';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { makeDateString } from 'src/utils/format-date';

type Props = {
  row: VacationHistoryItem;
  auth: string;
  onOpen: () => void;
  onDelete: () => void;
};

export function VacationTableRow({ row, auth, onOpen, onDelete }: Props) {
  return (
    <TableRow hover>
      <TableCell>
        {makeDateString(new Date(row.eventStartDate), 4)} ~
        {makeDateString(new Date(row.eventEndDate), 4)}
      </TableCell>
      <TableCell>{row.amount}일</TableCell>
      <TableCell>{row.type}</TableCell>
      <TableCell>{makeDateString(new Date(row.createdDate), 1)}</TableCell>
      <TableCell align="right">
        <Button
          variant="soft"
          color="primary"
          size="small"
          sx={{ marginRight: 1 }}
          onClick={onOpen}
        >
          상세
        </Button>
        {auth === 'ADMIN' && (
          <Button variant="soft" color="error" size="small" onClick={onDelete}>
            삭제
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
