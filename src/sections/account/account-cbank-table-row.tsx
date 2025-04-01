import type { ICbankItem } from 'src/types/cbank';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Box, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';
import { fTimeForString } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  row: ICbankItem;
};

export function AccountCbankTableRow({ row }: Props) {
  const isIncome = row.income;
  return (
    <TableRow>
      <TableCell sx={{ width: '10%', whiteSpace: 'nowrap' }}>
        <Typography variant="body2" color="text.secondary">
          {fTimeForString(row.date || '', 'YY.MM.DD')}
        </Typography>
      </TableCell>

      <TableCell
        sx={{
          width: '60%',
          maxWidth: 0,
          overflow: 'hidden',
          paddingRight: 2,
        }}
      >
        <Box
          sx={{
            display: 'block',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          {row.history}
        </Box>
        {row.sendName && row.recvName && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5, // 아이콘과 텍스트 간격
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <Typography
              variant="caption"
              color="warning.main"
              noWrap
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {row.sendName}
            </Typography>

            <Iconify icon="ic:round-arrow-forward" width={14} height={14} />

            <Typography
              variant="caption"
              color="success.main"
              noWrap
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {row.recvName}
            </Typography>
          </Box>
        )}
      </TableCell>

      <TableCell sx={{ width: '30%', textAlign: 'right', whiteSpace: 'nowrap' }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold' }}
          color={isIncome ? 'success.main' : 'error'}
        >
          {isIncome ? '+' : '-'}
          {fNumber(row.amount)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {fNumber(row.balance)}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
