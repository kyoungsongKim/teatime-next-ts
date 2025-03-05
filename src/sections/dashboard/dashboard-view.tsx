'use client';

import type { CUserItem } from 'src/types/user';
import type { ReportItem } from 'src/types/report';
import type { StatisticsSalesItem } from 'src/types/sales';
import type { IAttendanceItem, IAttendanceRequest } from 'src/types/attendance';

import { toast } from 'sonner';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';
import { sendReport } from 'src/actions/report';
import { getUserList } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { getAttendance } from 'src/actions/attendance-ssr';
import { getStatisticsSales } from 'src/actions/statistics-ssr';
import { getMonthlySales } from 'src/actions/monthly-sales-ssr';

import { DashboardWorkDialog } from 'src/sections/dashboard/dialog/dashboard-work-dialog';

import { useUser } from 'src/auth/context/user-context';

import { DashboardSummaryWidget } from './dashboard-summary-widget';
import { DashboardCheckInOutDialog } from './dialog/dashboard-checkinout-dialog';
import { DashboardSalesLineChartWidget } from './dashboard-sales-line-chart-widget';
import { DashboardAttendanceWidgetButton } from './dashboard-attendance-widget-button';
import { DashboardSalesRadialChartWidget } from './dashboard-sales-radialbar-chart-widget';

export function DashboardView() {
  const { userInfo, isAdmin } = useUser();

  const checkInOutDialog = useBoolean();
  const workDialog = useBoolean();
  const [timeType, setCheckType] = useState<'startTime' | 'endTime' | 'update'>('startTime');
  const [workedType, setWorkType] = useState<'REMOTE' | 'FIELD'>('REMOTE');
  const [latestAttendance, setLatestAttendance] = useState<IAttendanceItem[]>([]);

  const [currentYear, setCurrentYear] = useState<string>(String(new Date().getFullYear())); // 현재 연도 상태
  const currentMonth = new Date().getMonth() + 1; // 현재 월 (1월은 1, 12월은 12)
  const [currentSales, setCurrentSales] = useState<number>(0); // 현재 월 매출 상태

  const [userName, setUserName] = useState<string>(userInfo?.id || ''); // 사용자 이름 상태
  const [userList, setUserList] = useState<CUserItem[]>([]); // 사용자 리스트 상태

  const [salesData, setSalesData] = useState<StatisticsSalesItem>({
    salesList: [],
    targetSales: '0',
    yearList: [],
  }); // 매출 데이터 상태

  const [salesSeries, setSalesSeries] = useState<any[]>([]); // 그래프 데이터 상태

  // 목표 실적 계산
  const targetSales = useMemo(() => {
    if (salesData.targetSales === '0' || !salesData.targetSales) {
      return 0;
    }
    return parseInt(salesData.targetSales.replace(/[^0-9]/g, ''), 10); // 숫자만 추출 후 변환
  }, [salesData]);

  // 연간 누적 매출 계산
  const yearTotalSales = useMemo(() => {
    // 중복된 summaryDate를 제거
    const uniqueSales = salesData.salesList.filter(
      (item, index, self) => self.findIndex((i) => i.summaryDate === item.summaryDate) === index
    );

    // 총 매출 계산
    const calcData = uniqueSales.reduce((acc, cur) => acc + cur.salesAmount, 0);

    // 현재 연도에 대해 추가 매출 고려
    if (currentYear === String(new Date().getFullYear())) {
      if (
        salesData.salesList.length === 0 ||
        salesData.salesList[currentMonth - 1]?.salesAmount !== currentSales
      ) {
        return calcData + currentSales;
      }
    }

    return calcData;
  }, [salesData.salesList, currentYear, currentMonth, currentSales]);

  // 연간 목표 매출 계산
  const yearTargetSales = useMemo(() => {
    if (salesData.targetSales === '0' || !salesData.targetSales) {
      return 0;
    }
    const target = parseInt(salesData.targetSales.replace(/[^0-9]/g, ''), 10);
    return target * 12; // 월 목표를 12개월로 확장
  }, [salesData]);

  // 사업부별 매출 달성 비율 계산
  const salesPercentage = useMemo(() => {
    if (targetSales !== 0) return Math.round((currentSales / targetSales) * 100);
    return 0;
  }, [currentSales, targetSales]);

  // 매출 데이터를 변환하여 그래프에 사용할 데이터 생성
  const computeSalesSeries = useCallback(() => {
    const targetSalesArray = Array(12).fill(targetSales); // 12개월 목표 실적 배열 생성

    const { yearList } = salesData;

    // 현재 연도가 yearList에 포함되지 않았으면 추가
    if (!yearList.includes(new Date().getFullYear())) {
      yearList.push(new Date().getFullYear());
    }

    return yearList.map((year) => {
      if (year.toString() === currentYear) {
        const achievedSalesArray = Array(12).fill(0); // 12개월 달성 실적 초기화

        // 매출 데이터를 월별로 매핑
        salesData.salesList.forEach((item) => {
          const { salesAmount, summaryDate } = item;
          const month = new Date(summaryDate).getMonth(); // 0 = 1월
          achievedSalesArray[month] = salesAmount;
        });

        // 현재 연도인 경우, 현재 월 매출 업데이트
        if (currentYear === String(new Date().getFullYear())) {
          achievedSalesArray[currentMonth - 1] = currentSales;
        }

        return {
          name: String(year),
          data: [
            { name: '목표 실적', data: targetSalesArray },
            { name: '달성 실적', data: achievedSalesArray },
          ],
        };
      }
      // 비어 있는 데이터 처리
      return {
        name: String(year),
        data: [
          { name: '목표 실적', data: targetSalesArray },
          { name: '달성 실적', data: Array(12).fill(0) },
        ],
      };
    });
  }, [currentMonth, currentSales, currentYear, salesData, targetSales]);

  // currentSales나 salesData가 변경될 때 그래프 데이터 업데이트
  useEffect(() => {
    setSalesSeries(computeSalesSeries());
  }, [computeSalesSeries, currentSales]);

  // 초기 데이터 로드 및 상태 설정
  useEffect(() => {
    const fetchData = async () => {
      const statisticsData = await getStatisticsSales(userName, currentYear); // 매출 데이터 가져오기
      setSalesData(statisticsData);

      const monthlySalesData = await getMonthlySales(userName); // 현재 월 매출 가져오기
      setCurrentSales(parseInt(monthlySalesData, 10));
    };

    fetchData().then();

    // 관리자일 경우 사용자 리스트 가져오기
    if (isAdmin) {
      getUserList().then((data) => setUserList(data.data));
    }
  }, [userName, isAdmin, currentYear]);

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
      <DashboardContent maxWidth="xl">
        <Grid container spacing={3}>
          {/* 관리자의 경우 사용자 리스트 노출 */}
          {isAdmin && (
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
          {/* 요약 위젯 */}
          <Grid xs={12} md={4}>
            <DashboardSummaryWidget
              title={`${currentMonth}월 목표`}
              total={targetSales}
              percent={0}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <DashboardSummaryWidget
              title={`${currentYear}년 누적`}
              total={yearTotalSales}
              percent={0}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <DashboardSummaryWidget
              title={`${currentYear}년 목표`}
              total={yearTargetSales}
              percent={0}
            />
          </Grid>
          {/* 사업부 별 매출 */}
          <Grid xs={12} md={4}>
            <DashboardSalesRadialChartWidget
              title="사업부 별 매출"
              total={currentSales}
              chart={{
                series: [{ label: '공통', value: salesPercentage }], // currentSales를 반영
              }}
            />
          </Grid>
          {/* 매출 추이 그래프 */}
          <Grid xs={12} md={6} lg={8}>
            {salesSeries.length > 0 && (
              <DashboardSalesLineChartWidget
                title="매출 추이"
                chart={{
                  series: salesSeries,
                  categories: [
                    '1월',
                    '2월',
                    '3월',
                    '4월',
                    '5월',
                    '6월',
                    '7월',
                    '8월',
                    '9월',
                    '10월',
                    '11월',
                    '12월',
                  ],
                }}
                selectedSeries={currentYear}
                onSeriesChange={(newValue) => setCurrentYear(newValue)}
              />
            )}
          </Grid>
        </Grid>
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
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
