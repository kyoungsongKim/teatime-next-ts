'use client';

import type { CUserItem } from 'src/types/user';
import type { VacationItem, VacationHistoryItem } from 'src/types/vacation';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import { useBoolean } from 'src/hooks/use-boolean';

import { getUserInfo } from 'src/utils/user-info';
import { makeDateString } from 'src/utils/format-date';

import { getUserList } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { getVacationAll, getVacationList } from 'src/actions/vacation-ssr';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { VacationTableRow } from 'src/sections/vacation/VacationTableRow';
import { VacationSummaryWidget } from 'src/sections/vacation/vacation-summary-widget';
import { VacationFormDialog } from 'src/sections/vacation/dialog/vacation-form-dialog';

import { useAuthContext } from 'src/auth/hooks';
import { deleteVacation } from 'src/actions/vacation';
import { toast } from 'sonner';

const VACATION_TABLE_HEAD = [
  { id: 'eventStartDate', label: '기간' },
  { id: 'amount', label: '사용량' },
  { id: 'type', label: '타입' },
  { id: 'createdDate', label: '신청일' },
  { id: '', label: '' },
];

const USER_VACATION_TABLE_HEAD = [
  { id: 'userId', label: '사용자' },
  { id: 'left', label: '잔여 휴가' },
  { id: 'used', label: '사용 휴가' },
  { id: 'total', label: '전체 휴가' },
  { id: 'renewalDate', label: '갱신일' },
];

export function VacationView() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { id, auth } = useMemo(() => getUserInfo(user), [user]);

  const open = useBoolean();
  const [historyItem, setHistoryItem] = useState<VacationHistoryItem>();

  const confirm = useBoolean();

  const [userName, setUserName] = useState<string>(id); // 사용자 이름 상태
  const [userList, setUserList] = useState<CUserItem[]>([]); // 사용자 리스트 상태

  const [workedYear, setWorkedYear] = useState(1); // 근속년수 상태
  const [workedYearList, setWorkedYearList] = useState<number[]>([]); // 근속년수 리스트 상태

  const [vacationData, setVacationData] = useState<VacationItem>(); // 휴가 리스트 상태
  const vacationTable = useTable({
    defaultOrder: 'desc',
    defaultOrderBy: 'eventStartDate',
    defaultRowsPerPage: 10,
  });

  const [usersVacationList, setUsersVacationList] = useState<VacationItem[]>([]); // 사용자 휴가 리스트 상태
  const usersVacationTable = useTable({
    defaultRowsPerPage: 10,
  });

  const getVacationListByWorkedYear = useCallback(
    (year: number) => {
      getVacationList(userName, year).then((r) => {
        if (r.status === 200) {
          const { workedYearList: selectedUserWorkedYearList } = r.data as VacationItem;

          setWorkedYearList(selectedUserWorkedYearList);
          setVacationData(r.data);
        }
      });
    },
    [userName]
  );

  const getVacationListAll = useCallback(() => {
    if (auth === 'ADMIN') {
      getVacationAll().then((r) => {
        if (r.status === 200) {
          setUsersVacationList(r.data);
        } else {
          setUsersVacationList([]);
        }
      });
    }
  }, [auth]);

  const remainingVacationDays = useMemo(
    () => (vacationData ? vacationData.left : '-'),
    [vacationData]
  );
  const usedVacationDays = useMemo(() => (vacationData ? vacationData.used : '-'), [vacationData]);
  const totalVacationDays = useMemo(
    () => (vacationData ? vacationData.total : '-'),
    [vacationData]
  );
  const vacationRenewalDate = useMemo(() => {
    if (!vacationData) {
      return '-';
    }
    const renewalDate: Date = new Date(vacationData.renewalDate);
    return `${String(renewalDate.getMonth() + 1).padStart(2, '0')}월 ${String(renewalDate.getDate()).padStart(2, '0')}일`;
  }, [vacationData]);

  const getYearsOfServiceRange = (year: number) => {
    if (!vacationData) {
      return '-';
    }
    const renewalYear = new Date(vacationData.renewalDate).getFullYear();
    if (renewalYear > new Date().getFullYear()) {
      return '-';
    }

    return `${renewalYear + year - 1}~${renewalYear + year}년`;
  };

  const deleteVacationItem = () => {
    if (historyItem) {
      deleteVacation(historyItem.id).then((r) => {
        if (r.status === 200) {
          toast.success('삭제되었습니다.');
          getVacationListByWorkedYear(workedYear);
          getVacationListAll();
          confirm.onFalse();
        } else {
          toast.error('삭제에 실패했습니다.');
        }
      });
    } else {
      toast.error('삭제할 휴가 정보가 없습니다.');
    }
  };

  useEffect(() => {
    setWorkedYear(1);
    getVacationList(userName).then((r) => {
      if (r.status === 200) {
        const { workedYearList: selectedUserWorkedYearList } = r.data as VacationItem;
        const lastWorkedYear = selectedUserWorkedYearList[selectedUserWorkedYearList.length - 1];

        setWorkedYear(lastWorkedYear);
        getVacationListByWorkedYear(lastWorkedYear);
      } else {
        setVacationData(undefined);
      }
    });

    if (auth === 'ADMIN') {
      getUserList().then((r) => setUserList(r.data));
      getVacationListAll();
    }
  }, [userName, auth, getVacationListByWorkedYear]);

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Grid container spacing={3}>
          {auth === 'ADMIN' && (
            <Grid xs={12} sm={12} md={12} sx={{ textAlign: { xs: 'end', sm: 'end', md: 'start' } }}>
              {/* 사용자 리스트 및 연차 리스트 노출 */}
              <FormControl size="small" sx={{ paddingRight: { xs: 1, sm: 1, md: 1.5 } }}>
                <Select
                  value={userName}
                  onChange={(newValue) => {
                    const targetUser = userList.find((item) => newValue.target.value === item.id);
                    setUserName(targetUser?.id ?? id);
                  }}
                  variant="outlined"
                >
                  {userList.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {`${item.realName}(${item.id})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <Select
                  value={workedYear}
                  onChange={(newValue) => {
                    setWorkedYear(newValue.target.value as number);
                    getVacationListByWorkedYear(newValue.target.value as number);
                  }}
                  variant="outlined"
                >
                  {workedYearList.map((year, index) => (
                    <MenuItem key={year} value={year}>
                      {year}년차 ({getYearsOfServiceRange(year)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid xs={6} sm={6} md={6} alignSelf="center">
            <Typography variant="subtitle1">휴가 정보</Typography>
          </Grid>
          <Grid xs={6} sm={6} md={6} textAlign="end">
            {/* 휴가 사용 버튼 노출 */}
            <Button
              variant="soft"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                setHistoryItem(undefined);
                open.onTrue();
              }}
            >
              휴가 사용
            </Button>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <VacationSummaryWidget
              text={`${remainingVacationDays ?? '-'}일`}
              title="잔여 휴가 수"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <VacationSummaryWidget
              text={`${usedVacationDays ?? '-'}일`}
              title="사용 휴가 수"
              color="secondary"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <VacationSummaryWidget
              text={`${totalVacationDays ?? '-'}일`}
              title="전체 휴가 수"
              color="warning"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <VacationSummaryWidget
              text={`${vacationRenewalDate}`}
              title="휴가 갱신일자"
              color="error"
            />
          </Grid>

          <Grid xs={12} sm={12} md={12}>
            <Typography variant="subtitle1">휴가 사용 이력</Typography>
          </Grid>
          <Grid xs={12} sm={12} md={12}>
            <Card>
              <Scrollbar sx={{ minHeight: '200' }}>
                <Table size="medium" sx={{ minWidth: 800 }}>
                  <TableHeadCustom headLabel={VACATION_TABLE_HEAD} />
                  <TableBody>
                    {!vacationData || vacationData.histories.length === 0 ? (
                      <TableNoData notFound />
                    ) : (
                      vacationData?.histories
                        .sort((a, b) => -a.eventStartDate.localeCompare(b.eventStartDate))
                        .slice(
                          vacationTable.page * vacationTable.rowsPerPage,
                          vacationTable.page * vacationTable.rowsPerPage + vacationTable.rowsPerPage
                        )
                        .map((row, index) => (
                          <VacationTableRow
                            key={index}
                            row={row}
                            auth={auth}
                            onOpen={() => {
                              setHistoryItem(row);
                              open.onTrue();
                            }}
                            onDelete={() => {
                              setHistoryItem(row);
                              confirm.onTrue();
                            }}
                          />
                        ))
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
              <TablePaginationCustom
                page={vacationTable.page}
                count={vacationData?.histories.length ?? 0}
                rowsPerPage={vacationTable.rowsPerPage}
                onPageChange={vacationTable.onChangePage}
                onRowsPerPageChange={vacationTable.onChangeRowsPerPage}
              />
            </Card>
          </Grid>

          {/* 관리자인 경우에만 노출되는 형상 */}
          {auth === 'ADMIN' && (
            <>
              <Grid xs={12} sm={12} md={12} alignSelf="center">
                <Typography variant="subtitle1">
                  <Label color="primary" variant="soft" mr={1}>
                    관리자 메뉴
                  </Label>
                  사용자 휴가 정보
                </Typography>
              </Grid>
              <Grid xs={12} sm={12} md={12}>
                <Card>
                  <Scrollbar sx={{ minHeight: 300 }}>
                    <Table size="medium" sx={{ minWidth: 800 }}>
                      <TableHeadCustom headLabel={USER_VACATION_TABLE_HEAD} />
                      <TableBody>
                        {usersVacationList
                          .slice(
                            usersVacationTable.page * usersVacationTable.rowsPerPage,
                            usersVacationTable.page * usersVacationTable.rowsPerPage +
                              usersVacationTable.rowsPerPage
                          )
                          .map((row, index) => (
                            <TableRow hover key={index}>
                              <TableCell>
                                <Link
                                  sx={{ cursor: 'pointer' }}
                                  onClick={(e) => setUserName(row.userId)}
                                >
                                  {row.userId}
                                </Link>
                              </TableCell>
                              <TableCell>
                                {row.left !== 0 && row.left ? `${row.left}일` : '-'}
                              </TableCell>
                              <TableCell>
                                {row.used !== 0 && row.used ? `${row.used}일` : '-'}
                              </TableCell>
                              <TableCell>
                                {row.total !== 0 && row.total ? `${row.total}일` : '-'}
                              </TableCell>
                              <TableCell>
                                {makeDateString(new Date(row.renewalDate), 5) ?? '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                  <TablePaginationCustom
                    count={usersVacationList.length}
                    onPageChange={usersVacationTable.onChangePage}
                    page={usersVacationTable.page}
                    rowsPerPage={usersVacationTable.rowsPerPage}
                    onRowsPerPageChange={usersVacationTable.onChangeRowsPerPage}
                  />
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </DashboardContent>
      <VacationFormDialog
        open={open.value}
        onClose={open.onFalse}
        onUpdate={() => {
          getVacationListByWorkedYear(workedYear);
          getVacationListAll();
        }}
        item={historyItem}
        user={userName}
        auth={auth}
        left={vacationData?.left ?? 0}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="휴가 정보 삭제"
        content="휴가 정보를 삭제하시겠습니까?"
        action={
          <Button variant="soft" color="error" onClick={deleteVacationItem}>
            삭제
          </Button>
        }
      />
    </>
  );
}
