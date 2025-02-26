'use client';

import { useState } from 'react';
// @ts-ignore
// import { format } from 'date-fns';

import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

export default function AttendanceListView() {
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, date: '2025-02-25', checkIn: '09:00', checkOut: '18:00', status: '출근' },
    { id: 2, date: '2025-02-26', checkIn: '09:30', checkOut: '18:30', status: '출근' },
  ]);

  const [currentCheckIn, setCurrentCheckIn] = useState<string | null>(null);
  const [currentCheckOut, setCurrentCheckOut] = useState<string | null>(null);

  // ✅ 출근 버튼 클릭
  const handleCheckIn = () => {
    const now = format(new Date(), 'HH:mm');
    setCurrentCheckIn(now);
  };

  // ✅ 퇴근 버튼 클릭
  const handleCheckOut = () => {
    if (!currentCheckIn) return;
    const now = format(new Date(), 'HH:mm');

    setAttendanceData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: currentCheckIn,
        checkOut: now,
        status: '출근',
      },
    ]);

    setCurrentCheckIn(null);
    setCurrentCheckOut(null);
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto', mt: 5 }}>
      <Typography variant="h4" align="center">
        근태 관리
      </Typography>

      {/* ✅ 출퇴근 버튼 */}
      <Stack direction="row" justifyContent="center" spacing={2}>
        <Button
          variant="contained"
          color="success"
          onClick={handleCheckIn}
          disabled={!!currentCheckIn}
        >
          출근
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleCheckOut}
          disabled={!currentCheckIn}
        >
          퇴근
        </Button>
      </Stack>

      {/* ✅ 근태 테이블 */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">날짜</TableCell>
                <TableCell align="center">출근 시간</TableCell>
                <TableCell align="center">퇴근 시간</TableCell>
                <TableCell align="center">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell align="center">{row.date}</TableCell>
                  <TableCell align="center">{row.checkIn}</TableCell>
                  <TableCell align="center">{row.checkOut}</TableCell>
                  <TableCell align="center">{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
