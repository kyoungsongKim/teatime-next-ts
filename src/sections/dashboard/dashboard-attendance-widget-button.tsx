import type { CardProps } from '@mui/material/Card';
import type { ColorType } from 'src/theme/core/palette';
import type { IAttendance } from 'src/types/attendance';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

type Props = CardProps & {
  icon: string;
  title: string;
  timeType: 'startTime' | 'endTime' | '';
  attendance?: IAttendance; // ✅ `undefined` 허용
  tooltip: string;
  color?: ColorType;
  onClick?: () => void;
};

export function DashboardAttendanceWidgetButton({
  sx,
  icon,
  title,
  timeType,
  attendance,
  tooltip,
  color = 'warning',
  onClick,
  ...other
}: Props) {
  const isDisabled = useMemo(() => {
    if (!attendance) return false;
    if (timeType === 'startTime') return !!attendance.workStartTime;
    return false;
  }, [attendance, timeType]);

  const getAttendanceTime = () => {
    if (!attendance) return '--:--:--';

    switch (attendance.workType) {
      case 'OFFICE':
        return timeType === 'startTime'
          ? attendance.workStartTime || '--:--:--'
          : attendance.workEndTime || '--:--:--';
      case 'REMOTE':
      case 'FIELD':
        return `${attendance.workStartTime || '--:--:--'} - ${attendance.workEndTime || '--:--:--'}`;
      default:
        return '--:--:--';
    }
  };

  return (
    <Tooltip title={tooltip} arrow>
      <Card
        onClick={onClick}
        sx={{
          py: 3,
          pl: 3,
          pr: 2.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isDisabled ? 1 : 3,
          '&:hover': isDisabled ? {} : { boxShadow: 6, transform: 'scale(1.02)' },
          ...sx,
        }}
        {...other}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
            {getAttendanceTime()}
          </Typography>
        </Box>

        {/* ✅ 아이콘에도 툴팁 추가 */}
        <Tooltip title={title} arrow>
          <Box>
            <SvgColor
              src={icon}
              sx={{
                top: 20,
                right: 20,
                width: 40,
                height: 40,
                position: 'absolute',
                padding: 1.2,
                borderRadius: '50%',
                backgroundColor: (theme) => theme.vars.palette[color].main,
                color: 'white',
                boxShadow: (theme) => `0 4px 10px ${theme.vars.palette[color].dark}`,
              }}
            />
          </Box>
        </Tooltip>

        <Box
          sx={{
            top: -44,
            width: 160,
            zIndex: -1,
            height: 160,
            right: -104,
            opacity: 0.12,
            borderRadius: 3,
            position: 'absolute',
            transform: 'rotate(40deg)',
            background: (theme) =>
              `linear-gradient(to right, ${theme.vars.palette[color].main} 0%, ${varAlpha(theme.vars.palette[color].mainChannel, 0)} 100%)`,
          }}
        />
      </Card>
    </Tooltip>
  );
}
