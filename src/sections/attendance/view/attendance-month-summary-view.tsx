'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { AttendanceStatusType } from 'src/types/attendance';

import React, { useMemo, useState, useEffect } from 'react';

import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, Stack, Select, MenuItem, Typography, FormControl } from '@mui/material';

import { getAttendanceSummary } from 'src/actions/attendance-ssr';

const STATUS_COLORS: Record<
  AttendanceStatusType,
  { label: string; color: 'success' | 'warning' | 'error' | 'secondary' | 'default' }
> = {
  PRESENT: { label: '출근', color: 'success' },
  REMOTE: { label: '재택', color: 'success' },
  FIELD: { label: '외근', color: 'success' },
  VACATION: { label: '휴가', color: 'warning' },
  LATE: { label: '지각', color: 'error' },
  EARLY_LEAVE: { label: '조퇴', color: 'secondary' },
  ABSENT: { label: '결근', color: 'default' },
  HOLIDAY: { label: '휴일', color: 'default' },
};

const getDaysInMonth = (year: number, month: number) => {
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
};

export function AttendanceMonthSummaryView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [holidaysMap, setHolidays] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function fetchData() {
      const data = await getAttendanceSummary(year, month);
      const formattedHolidays = new Map(
        data.holidays.map((holiday) => {
          const dateStr = holiday.date;
          const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
          return [formattedDate, holiday.name];
        })
      );
      setAttendanceData(data.attendanceData);
      setHolidays(formattedHolidays);
    }
    fetchData();
  }, [year, month]);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const dayColumns: GridColDef[] = days.map((day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일
    const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
    return {
      field: `day${day}`,
      headerName: `${day} (${weekday})`,
      width: 60,
      headerClassName: holidaysMap.has(dateStr)
        ? 'holiday-header' // 법정 공휴일
        : dayOfWeek === 0
          ? 'sunday-header' // 일요일
          : dayOfWeek === 6
            ? 'saturday-header' // 토요일
            : '',
      cellClassName: () =>
        holidaysMap.has(dateStr)
          ? 'holiday-row' // 법정 공휴일
          : dayOfWeek === 0
            ? 'sunday-row'
            : dayOfWeek === 6
              ? 'saturday-row'
              : '',
      renderCell: (params) => {
        const status = params.value as AttendanceStatusType;
        const holidayName = holidaysMap.get(dateStr);

        if (holidayName && (!status || status === 'HOLIDAY')) {
          return <Chip label={holidayName} color="default" size="small" variant="soft" />;
        }
        if (!status || (status === 'ABSENT' && (dayOfWeek === 0 || dayOfWeek === 6))) {
          return ''; // 주말이면서 ABSENT(결근)일 경우, 빈칸 유지
        }
        return status ? (
          <Chip
            label={STATUS_COLORS[status]?.label || '알 수 없음'}
            color={STATUS_COLORS[status]?.color || 'default'}
            size="small"
            variant="soft"
          />
        ) : (
          ''
        );
      },
    };
  });

  const tableRows = attendanceData.map((user, index) => {
    const attendanceMapped = Object.keys(user.attendanceStatus).reduce(
      (acc, date) => {
        const day = Number(date.split('-')[2]);
        const status = user.attendanceStatus[date];

        if (status !== 'HOLIDAY') {
          acc[`day${day}`] = status;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    return {
      id: index + 1,
      key: index + 1,
      realName: user.realName,
      totalWork: Object.values(user.attendanceStatus).filter(
        (status) => status === 'PRESENT' || status === 'REMOTE' || status === 'FIELD'
      ).length,
      off: Object.values(user.attendanceStatus).filter((status) => status === 'VACATION').length,
      late: Object.values(user.attendanceStatus).filter((status) => status === 'LATE').length,
      earlyLeave: Object.values(user.attendanceStatus).filter((status) => status === 'EARLY_LEAVE')
        .length,
      absence: Object.entries(user.attendanceStatus)
        .filter(([_, status]) => status === 'ABSENT')
        .filter(([date]) => user.attendanceStatus[date] !== 'HOLIDAY').length,
      ...attendanceMapped,
    };
  });

  return (
    <Box sx={{ height: '700', width: '100%', p: 2 }}>
      {/* 년도 & 월 선택 드롭다운 */}
      <Stack spacing={2} sx={{ mb: { xs: 2, md: 3 } }}>
        <Stack
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-end', sm: 'center' }}
          direction={{ xs: 'row', sm: 'row' }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}년
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}월
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" textAlign="right">
                {year}년 {month}월 근태 현황
              </Typography>
            </Grid>
          </Grid>
        </Stack>
      </Stack>
      {/* 데이터 그리드 */}
      <DataGrid
        rows={tableRows}
        columns={[
          { field: 'id', headerName: '번호', width: 50 },
          { field: 'realName', headerName: '이름', width: 100 },
          { field: 'totalWork', headerName: '출근', width: 50 },
          { field: 'off', headerName: '휴가', width: 50 },
          { field: 'late', headerName: '지각', width: 50 },
          { field: 'earlyLeave', headerName: '조퇴', width: 50 },
          { field: 'absence', headerName: '결근', width: 50 },
          ...dayColumns,
        ]}
        pageSizeOptions={[10, 50, 100]}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-root': { border: '1px solid rgba(224, 224, 224, 1)' },
          '& .MuiDataGrid-cell': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '2px solid rgba(224, 224, 224, 1)',
            borderTop: '2px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
          '& .holiday-header, & .holiday-row': {
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            color: 'red',
          },
          '& .sunday-header': { backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'red' },
          '& .saturday-header': { backgroundColor: 'rgba(0, 0, 255, 0.1)', color: 'blue' },
          '& .sunday-row': { backgroundColor: 'rgba(255, 0, 0, 0.05)' },
          '& .saturday-row': { backgroundColor: 'rgba(0, 0, 255, 0.05)' },
        }}
      />
    </Box>
  );
}
