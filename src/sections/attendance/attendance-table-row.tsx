import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fTimeForString } from 'src/utils/format-time';

import { Label } from 'src/components/label';

import { workTypeLabels, type IAttendanceItem } from 'src/types/attendance';

// ----------------------------------------------------------------------

type Props = {
  row: IAttendanceItem;
};

export function AttendanceTableRow({ row }: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <Label
          variant="soft"
          color={
            (row.workType === 'OFFICE' && 'success') ||
            (row.workType === 'REMOTE' && 'warning') ||
            (row.workType === 'FIELD' && 'error') ||
            'default'
          }
        >
          {workTypeLabels[row.workType] || ''}
        </Label>
      </TableCell>
      <TableCell>{fTimeForString(row.workDate || '', 'YYYY-MM-DD')}</TableCell>
      <TableCell>{fTimeForString(row.workStartTime || '', 'HH:mm:ss')}</TableCell>
      <TableCell>{fTimeForString(row.workEndTime || '', 'HH:mm:ss')}</TableCell>
      <TableCell>
        {row.location === 'Home' ? '집' : row.location === 'Office' ? '회사' : row.location}
      </TableCell>
      <TableCell>{row.managerName}</TableCell>
      <TableCell>{row.taskDescription}</TableCell>
    </TableRow>
  );
}
