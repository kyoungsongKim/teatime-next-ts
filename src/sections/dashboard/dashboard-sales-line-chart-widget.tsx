import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { useMemo } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
  selectedSeries: string;
  onSeriesChange: (newValue: string) => void;
};

export function DashboardSalesLineChartWidget({
  title,
  subheader,
  chart,
  selectedSeries,
  onSeriesChange,
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    tooltip: { y: { formatter: (value: number) => fNumber(value) } },
    ...chart.options,
  });

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  // 비교 및 목표 실적 계산을 위한 날짜 데이터
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = new Date().getMonth() + 1;

  // 목표 실적 합계, 달성 실적 합계
  const { totalTargetSales, totalRealSales } = useMemo(() => {
    let totalTarget = 0;
    let totalReal = 0;

    // chart series에 name에 selectedSeries에 해당하는 데이터만 totalTarget, totalReal에 더해준다.
    const targetSeriesData = chart.series.find((item) => item.name === selectedSeries);
    if (!targetSeriesData) return { totalTargetSales: 0, totalRealSales: 0 };
    if (currentYear === selectedSeries) {
      // 선택된 년도가 가장 최근(현재 년도)인 경우,
      // totalTarget은 현재까지의 목표 실적 합계로, 현재 달까지만 계산
      totalTarget = targetSeriesData.data[0].data
        .slice(0, currentMonth)
        .reduce((acc, cur) => acc + cur, 0);
    } else {
      totalTarget = targetSeriesData.data[0].data.reduce((acc, cur) => acc + cur, 0);
    }
    // totalReal은 0으로 초기화 되어 있기 때문에,
    totalReal = targetSeriesData.data[1].data.reduce((acc, cur) => acc + cur, 0);

    return { totalTargetSales: totalTarget, totalRealSales: totalReal };
  }, [chart.series, currentMonth, currentYear, selectedSeries]);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ChartSelect
            options={chart.series.map((item) => item.name) ?? []}
            value={selectedSeries}
            onChange={onSeriesChange}
          />
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        values={[fNumber(totalTargetSales), fNumber(totalRealSales)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
