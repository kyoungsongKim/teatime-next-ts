'use client';

import type { IUserItem } from 'src/types/user';
import type { ReportItem } from 'src/types/report';
import type {
  IAttendanceItem,
  IAttendanceRequest,
  IAttendanceTableFilters,
} from 'src/types/attendance';

import { toast } from 'sonner';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { varAlpha } from 'src/theme/styles';
import { sendReport } from 'src/actions/report';
import { getUserList } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { getAttendance } from 'src/actions/attendance-ssr';

import { Label } from 'src/components/label';
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

import { DashboardWorkDialog } from 'src/sections/dashboard/dialog/dashboard-work-dialog';
import { DashboardCheckInOutDialog } from 'src/sections/dashboard/dialog/dashboard-checkinout-dialog';
import { DashboardAttendanceWidgetButton } from 'src/sections/dashboard/dashboard-attendance-widget-button';

import { useUser } from 'src/auth/context/user-context';

import { AttendanceTableRow } from '../attendance-table-row';
import { AttendanceTableToolbar } from '../attendance-table-toolbar';
import { AttendanceTableFiltersResult } from '../attendance-table-filters-result';

// ----------------------------------------------------------------------
export const WORK_STATUS_OPTIONS = [
  { value: 'OFFICE', label: '정상근무' },
  { value: 'REMOTE', label: '재택' },
  { value: 'FIELD', label: '외근' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...WORK_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'workType', label: '업무 종류' },
  { id: 'workDate', label: '업무일' },
  { id: 'workStartTime', label: '시작시간' },
  { id: 'workEndTime', label: '종료시간' },
  { id: 'location', label: '위치' },
  { id: 'managerName', label: '승인자' },
  { id: 'taskDescription', label: '업무내용' },
];

// ----------------------------------------------------------------------

export function AttendanceListView() {
  const { userInfo, isAdmin } = useUser();

  const checkInOutDialog = useBoolean();
  const workDialog = useBoolean();
  const [timeType, setCheckType] = useState<'startTime' | 'endTime' | 'update'>('startTime');
  const [workedType, setWorkType] = useState<'REMOTE' | 'FIELD'>('REMOTE');
  const [latestAttendance, setLatestAttendance] = useState<IAttendanceItem[]>([]);

  const [userName, setUserName] = useState<string>(userInfo?.id || ''); // 사용자 이름 상태
  const [userList, setUserList] = useState<IUserItem[]>([]); // 사용자 리스트 상태

  const popover = usePopover();
  const router = useRouter();

  const table = useTable({
    defaultOrderBy: 'workDate',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
  });

  const [tableData, setTableData] = useState<IAttendanceItem[]>();

  const filters = useSetState<IAttendanceTableFilters>({
    name: '',
    workType: 'all',
    workStartDate: null,
    workEndDate: null,
  });

  const dateError = fIsAfter(filters.state.workStartDate, filters.state.workEndDate);

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    dateError,
  });

  const canReset =
    !!filters.state.name ||
    filters.state.workType !== 'all' ||
    (!!filters.state.workStartDate && !!filters.state.workEndDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      filters.setState({ workType: newValue });
    },
    [filters, table]
  );

  const fetchLatestAttendanceMonth = useCallback(async () => {
    try {
      if (userName) {
        const today = new Date().toISOString().split('T')[0];
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 12);
        threeMonthsAgo.setDate(1);
        const endDate = threeMonthsAgo.toISOString().split('T')[0];
        const data = await getAttendance(userName, endDate, today);
        setTableData(data);
      }
    } catch (error) {
      console.error('Failed to fetch latest attendance:', error);
    }

    // 관리자일 경우 사용자 리스트 가져오기
    if (isAdmin) {
      getUserList().then((data) => setUserList(data.data));
    }
  }, [isAdmin, userName]);

  useEffect(() => {
    fetchLatestAttendanceMonth().then((r) => r);
  }, [fetchLatestAttendanceMonth]);

  useEffect(() => {
    if (userInfo?.id) {
      setUserName(userInfo.id);
    }
  }, [userInfo]);

  const fetchLatestAttendance = useCallback(async () => {
    try {
      if (userInfo?.id) {
        const data = await getAttendance(userInfo.id, new Date().toISOString().split('T')[0], null);
        setLatestAttendance(data);
      }
    } catch (error) {
      console.error('Failed to fetch latest attendance:', error);
    }
  }, [userInfo]);

  useEffect(() => {
    fetchLatestAttendance().then((r) => r);
  }, [fetchLatestAttendance]);

  const updateAttendance = useCallback(() => {
    fetchLatestAttendance().then((r) => r);
  }, [fetchLatestAttendance]);

  const getTimeForType = useMemo(
    () => (workType: 'OFFICE' | 'REMOTE' | 'FIELD') => {
      if (!latestAttendance) return undefined;
      return latestAttendance.find((item) => item.workType === workType);
    },
    [latestAttendance]
  );

  const sendAttendanceReport = async (attendanceRequest: IAttendanceRequest) => {
    try {
      if (!userInfo) {
        toast.error('로그인 정보가 없습니다.');
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const workTypeLabel =
        attendanceRequest.workType === 'OFFICE'
          ? '출퇴근'
          : attendanceRequest.workType === 'REMOTE'
            ? '재택'
            : '외근';

      const title = `[${workTypeLabel} 보고] ${today} ${workTypeLabel} 보고 입니다`;

      const messages = {
        OFFICE: {
          start: '사내에 출근하여 업무를 시작합니다.',
          end: '사내에서 업무를 종료합니다.',
          update: '사내에서 업무 내용을 수정합니다.',
        },
        REMOTE: {
          start: '재택 근무를 시작합니다.',
          end: '재택 근무를 종료합니다.',
          update: '재택 근무 내용을 수정합니다.',
        },
        FIELD: {
          start: '외근 업무를 시작합니다.',
          end: '외근 업무를 종료합니다.',
          update: '외근 업무 내용을 수정합니다.',
        },
      };

      const timeKey =
        attendanceRequest.timeType === 'startTime'
          ? 'start'
          : attendanceRequest.timeType === 'endTime'
            ? 'end'
            : 'update';

      const actionText = messages[attendanceRequest.workType][timeKey];

      let extraInfo = '';
      if (attendanceRequest.workType === 'REMOTE') {
        extraInfo = `승인자: ${attendanceRequest.managerName || '없음'}
업무 내용: ${attendanceRequest.taskDescription || '없음'}`;
      } else if (attendanceRequest.workType === 'FIELD') {
        extraInfo = `외근 요청자: ${attendanceRequest.managerName || '없음'}
외근 위치: ${attendanceRequest.location || '없음'}
업무 내용: ${attendanceRequest.taskDescription || '없음'}`;
      }

      const contents = `${actionText}\n${extraInfo}`;

      const receiveEmailList = attendanceRequest.dailyReportList
        ? attendanceRequest.dailyReportList
        : [];
      if (receiveEmailList.length === 0) {
        console.error('업무 보고 대상자가 없습니다.');
        toast.error('업무 보고 대상자가 없습니다.');
        return;
      }

      const params: ReportItem = {
        sendUserName: userInfo.id,
        receiveEmail: receiveEmailList,
        title,
        contents,
      };

      const response = await sendReport(params);

      if (response.status !== 200) {
        console.error('이메일 전송 실패:', response.data);
        toast.error(`이메일 전송 실패: ${response.data}`);
      } else {
        toast.success('담당자에게 메일이 전송되었습니다.');
      }
    } catch (error) {
      console.error('이메일 전송 중 오류 발생:', error);
      toast.error('담당자에게 메일 전송이 실패했습니다.');
    }
  };

  return (
    <>
      <DashboardContent>
        <Grid container spacing={3}>
          {/* 관리자의 경우 사용자 리스트 노출 */}
          {isAdmin && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
              <Grid xs={12} md={12} flexGrow={1}>
                <FormControl size="small" fullWidth>
                  <Autocomplete
                    options={userList} // 사용자 목록
                    getOptionLabel={(option) => `${option.realName} (${option.id})`} // 항목 표시 형식
                    value={userList.find((item) => item.id === userName) || null} // 현재 선택된 값
                    onChange={(_, newValue) => {
                      setUserName(newValue?.id || userInfo?.id || '');
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="사용자 선택" variant="outlined" />
                    )}
                  />
                </FormControl>
              </Grid>

              <IconButton onClick={popover.onOpen} sx={{ alignSelf: 'center' }}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Stack>
          )}

          {/* 출퇴근 위젯 */}
          <Grid xs={12} md={3}>
            <DashboardAttendanceWidgetButton
              title="출근"
              timeType="startTime"
              attendance={getTimeForType('OFFICE')}
              tooltip={
                getTimeForType('OFFICE')?.workStartTime
                  ? '출근 시간이 이미 등록되었습니다.'
                  : '출근 가능 지역에서만 가능합니다.'
              }
              icon={`${CONFIG.assetsDir}/assets/icons/dashboard/ic-clock-in.svg`}
              onClick={() => {
                if (getTimeForType('OFFICE')?.workStartTime) return;
                setCheckType('startTime');
                checkInOutDialog.onTrue();
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <DashboardAttendanceWidgetButton
              title="퇴근"
              timeType="endTime"
              attendance={getTimeForType('OFFICE')}
              color="success"
              tooltip="퇴근 가능 지역에서만 가능합니다."
              icon={`${CONFIG.assetsDir}/assets/icons/dashboard/ic-clock-out.svg`}
              onClick={() => {
                setCheckType('endTime');
                checkInOutDialog.onTrue();
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <DashboardAttendanceWidgetButton
              title="재택"
              timeType=""
              attendance={getTimeForType('REMOTE')}
              color="secondary"
              tooltip=""
              icon={`${CONFIG.assetsDir}/assets/icons/dashboard/ic-home-work.svg`}
              onClick={() => {
                setWorkType('REMOTE');
                workDialog.onTrue();
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <DashboardAttendanceWidgetButton
              title="외근"
              timeType=""
              attendance={getTimeForType('FIELD')}
              color="info"
              tooltip=""
              icon={`${CONFIG.assetsDir}/assets/icons/dashboard/ic-field-work.svg`}
              onClick={() => {
                setWorkType('FIELD');
                workDialog.onTrue();
              }}
            />
          </Grid>
          <Grid xs={12} md={12}>
            <Card>
              <Tabs
                value={filters.state.workType}
                onChange={handleFilterStatus}
                sx={{
                  px: 2.5,
                  boxShadow: (theme) =>
                    `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                }}
              >
                {STATUS_OPTIONS.map((tab) => (
                  <Tab
                    key={tab.value}
                    iconPosition="end"
                    value={tab.value}
                    label={tab.label}
                    icon={
                      <Label
                        variant={
                          ((tab.value === 'all' || tab.value === filters.state.workType) &&
                            'filled') ||
                          'soft'
                        }
                        color={
                          (tab.value === 'OFFICE' && 'success') ||
                          (tab.value === 'REMOTE' && 'warning') ||
                          (tab.value === 'FIELD' && 'error') ||
                          'default'
                        }
                      >
                        {['OFFICE', 'REMOTE', 'FIELD'].includes(tab.value)
                          ? (tableData || []).filter((work) => work.workType === tab.value).length
                          : (tableData || []).length}
                      </Label>
                    }
                  />
                ))}
              </Tabs>

              <AttendanceTableToolbar
                filters={filters}
                onResetPage={table.onResetPage}
                dateError={dateError}
              />

              {canReset && (
                <AttendanceTableFiltersResult
                  filters={filters}
                  totalResults={dataFiltered.length}
                  onResetPage={table.onResetPage}
                  sx={{ p: 2.5, pt: 0 }}
                />
              )}

              <Box sx={{ position: 'relative' }}>
                <Scrollbar sx={{ minHeight: 444 }}>
                  <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={dataFiltered.length}
                      numSelected={table.selected.length}
                      onSort={table.onSort}
                    />

                    <TableBody>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <AttendanceTableRow key={row.workId} row={row} />
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
        </Grid>

        <CustomPopover
          open={popover.open}
          anchorEl={popover.anchorEl}
          onClose={popover.onClose}
          slotProps={{ arrow: { placement: 'right-top' } }}
        >
          <MenuList>
            <MenuItem onClick={() => router.push(paths.root.attendance.monthSummary)}>
              Total Attendance
            </MenuItem>
          </MenuList>
        </CustomPopover>
      </DashboardContent>
      <DashboardCheckInOutDialog
        userId={userInfo?.id || ''}
        open={checkInOutDialog.value}
        onClose={(payload, isSuccess) => {
          checkInOutDialog.onFalse();
          if (isSuccess) {
            sendAttendanceReport(payload).then((r) => r);
          }
        }}
        timeType={timeType}
        onUpdate={updateAttendance}
        dailyReportList={
          userInfo?.userDetails.dailyReportList
            ? userInfo.userDetails.dailyReportList.trim().split(',')
            : []
        }
      />

      <DashboardWorkDialog
        userId={userInfo?.id || ''}
        open={workDialog.value}
        onClose={(payload, isSuccess) => {
          workDialog.onFalse();
          if (isSuccess) {
            sendAttendanceReport(payload).then((r) => r);
          }
        }}
        onUpdate={updateAttendance}
        attendance={getTimeForType(workedType)}
        workType={workedType}
        dailyReportList={
          userInfo?.userDetails.dailyReportList
            ? userInfo.userDetails.dailyReportList.trim().split(',')
            : []
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  dateError: boolean;
  inputData: IAttendanceItem[];
  filters: IAttendanceTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
  const { workType, name, workStartDate, workEndDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((attendance) => {
      const searchName = attendance.managerName?.toLowerCase().includes(name.trim().toLowerCase());
      const searchDescription = attendance.taskDescription
        ?.toLowerCase()
        .includes(name.trim().toLowerCase());
      const searchLocation = attendance.location?.toLowerCase().includes(name.trim().toLowerCase());

      return Boolean(searchName || searchDescription || searchLocation);
    });
  }

  if (workType !== 'all') {
    inputData = inputData.filter((order) => order.workType === workType);
  }

  if (!dateError) {
    if (workStartDate && workEndDate) {
      inputData = inputData.filter((attendance) =>
        fIsBetween(attendance.workDate, workStartDate, workEndDate)
      );
    }
  }

  return inputData;
}
