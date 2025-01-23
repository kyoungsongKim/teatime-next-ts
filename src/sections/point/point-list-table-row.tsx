import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { PointItem } from 'src/types/point';

type Props = {
  row: PointItem;
};

export function PointListTableRow({ row }: Props) {
  return (
    <TableRow hover>
      <TableCell>{row.createdDate}</TableCell>

      <TableCell>{row.useDate}</TableCell>

      <TableCell>{row.memo}</TableCell>

      <TableCell align="center">{row.point}</TableCell>

      <TableCell>{row.sender}</TableCell>

      <TableCell align="right">{row.code}</TableCell>
    </TableRow>
  );
}
