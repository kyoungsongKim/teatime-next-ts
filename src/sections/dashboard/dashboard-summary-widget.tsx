import Card, { CardProps } from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Chart, ChartOptions, useChart } from '../../components/chart';
import { fNumber, fPercent } from '../../utils/format-number';
import { Iconify } from '../../components/iconify';
import { stylesMode, varAlpha } from '../../theme/styles';

type Props = CardProps & {
  title: string;
  total: number;
  percent?: number;
  chart?: {
    colors?: string[];
    categories: string[];
    series: number[];
    options?: ChartOptions;
  };
};

export function DashboardSummaryWidget({ title, percent, total, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart?.colors ?? [theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: [chartColors[1]],
    xaxis: { categories: chart?.categories },
    grid: {
      padding: {
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: chartColors[0], opacity: 1 },
          { offset: 100, color: chartColors[1], opacity: 1 },
        ],
      },
    },
    tooltip: {
      y: { formatter: (value: number) => fNumber(value), title: { formatter: () => '' } },
    },
    ...chart?.options,
  });

  const renderTrending = (
    <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
      <Box
        component="span"
        sx={{
          width: 24,
          height: 24,
          display: 'flex',
          borderRadius: '50%',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.16),
          color: 'success.dark',
          [stylesMode.dark]: { color: 'success.light' },
          ...((percent ?? 0) < 0 && {
            bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.16),
            color: 'error.dark',
            [stylesMode.dark]: { color: 'error.light' },
          }),
        }}
      >
        <Iconify
          width={16}
          icon={(percent ?? 0) < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
        />
      </Box>

      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {(percent ?? 0) > 0 && '+'}
        {fPercent(percent)}
      </Box>
      <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
        last month
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
        <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(total)}</Box>
        {!!percent && renderTrending}
      </Box>

      {!!chart && (
        <Chart
          type="line"
          series={[{ data: chart.series }]}
          options={chartOptions}
          width={100}
          height={40}
        />
      )}
    </Card>
  );
}
