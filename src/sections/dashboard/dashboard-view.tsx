'use client';

import type { IUserItem } from 'src/types/user';
import type { StatisticsSalesItem } from 'src/types/sales';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { getUserList } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { getStatisticsSales } from 'src/actions/statistics-ssr';
import { getMonthlySales } from 'src/actions/monthly-sales-ssr';

import { useUser } from 'src/auth/context/user-context';

import { DashboardSummaryWidget } from './dashboard-summary-widget';
import { DashboardSalesLineChartWidget } from './dashboard-sales-line-chart-widget';
import { DashboardSalesRadialChartWidget } from './dashboard-sales-radialbar-chart-widget';

export function DashboardView() {
  const { userInfo, isAdmin } = useUser();

  const [currentYear, setCurrentYear] = useState<string>(String(new Date().getFullYear())); // 현재 연도 상태
  const currentMonth = new Date().getMonth() + 1; // 현재 월 (1월은 1, 12월은 12)
  const [currentSales, setCurrentSales] = useState<number>(0); // 현재 월 매출 상태

  const [userName, setUserName] = useState<string>(userInfo?.id || ''); // 사용자 이름 상태
  const [userList, setUserList] = useState<IUserItem[]>([]); // 사용자 리스트 상태

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

  return (
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
  );
}
