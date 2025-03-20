import type { IAttendanceRequest } from 'src/types/attendance';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import Chip from '@mui/material/Chip';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Stack,
  Dialog,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { postAssistance } from 'src/actions/attendance-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

export const UpdateWorkAttendanceSchema = zod.object({
  dailyReportList: zod.array(zod.string().email({ message: 'Invalid email format!' })).optional(),
});

type Props = {
  userId: string;
  open: boolean;
  onClose: (payload: IAttendanceRequest, success: boolean) => void;
  timeType: 'startTime' | 'endTime' | 'update';
  onUpdate: () => void;
  dailyReportList: string[];
};

const OFFICE_LOCATION = { lat: 37.477207, lng: 126.963869 };

function getDistanceFromLatLon(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function DashboardCheckInOutDialog({
  userId,
  open,
  onClose,
  timeType,
  onUpdate,
  dailyReportList,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isCheckAllowed, setIsCheckAllowed] = useState(false);
  const [distanceMessage, setDistanceMessage] = useState('');

  const methods = useForm<IAttendanceRequest>({
    mode: 'all',
    resolver: zodResolver(UpdateWorkAttendanceSchema),
    defaultValues: {
      dailyReportList: dailyReportList || [],
    },
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const {
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      reset({
        dailyReportList: dailyReportList || [],
      });
    }
  }, [open, reset, dailyReportList]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setDistanceMessage('GPS 기능이 지원되지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });

        const distance = getDistanceFromLatLon(
          latitude,
          longitude,
          OFFICE_LOCATION.lat,
          OFFICE_LOCATION.lng
        );

        if (distance <= 100) {
          setIsCheckAllowed(true);
          setDistanceMessage(`${timeType === 'startTime' ? '출근' : '퇴근'}체크 가능합니다.`);
        } else {
          setIsCheckAllowed(false);
          setDistanceMessage(`체크 불가: 여기는 ${Math.round(distance)}m 떨어져 있습니다.`);
        }
      },
      (error) => {
        setDistanceMessage('GPS 정보를 가져올 수 없습니다.');
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [timeType]);

  const onHandleSubmit = methods.handleSubmit(async (data) => {
    if (!isCheckAllowed) return;

    setLoading(true);

    const payload: IAttendanceRequest = {
      userId,
      workType: 'OFFICE' as const,
      location: 'Office',
      timeType,
      dailyReportList: data.dailyReportList,
    };

    try {
      const response = await postAssistance(payload);

      if (response.status === 200) {
        toast.info(`${timeType === 'startTime' ? '출근' : '퇴근'} 체크 완료`);
        onUpdate();
        onClose(payload, true);
      } else {
        toast.error(response.data);
        onClose(payload, false);
      }
    } catch (error) {
      toast.error(`${timeType === 'startTime' ? '출근' : '퇴근'} 체크 중 오류가 발생했습니다.`);
      console.error(error);
      onClose(payload, false);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={() => onClose({} as IAttendanceRequest, false)}
    >
      <DialogTitle>
        {timeType === 'startTime' ? '출근' : '퇴근'} 체크
        <IconButton
          onClick={() => onClose({} as IAttendanceRequest, false)}
          sx={{ position: 'absolute', right: 16, top: 16 }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <Form methods={methods} onSubmit={onHandleSubmit}>
        <DialogContent sx={{ bgcolor: 'grey.200', borderRadius: 2 }}>
          <Stack spacing={2} sx={{ pt: 1, pb: 1 }}>
            <Stack spacing={1}>
              <Typography variant="body2">📍본사 100m 이내에서 체크 가능합니다.</Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'error.main',
                  fontWeight: 'bold',
                  fontSize: '0.6rem',
                  lineHeight: 1,
                }}
              >
                * 무선 네트워크 환경(LTE, Wifi)에서 체크 가능합니다.
              </Typography>
              <Typography
                variant="h6"
                color={isCheckAllowed ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 'bold' }}
              >
                {distanceMessage}
              </Typography>
            </Stack>

            {/* 구글 지도 표시 */}
            {isLoaded && (
              <Box
                sx={{
                  width: '100%',
                  height: 350,
                  borderRadius: 2,
                  boxShadow: 2,
                  overflow: 'hidden',
                }}
              >
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={currentPosition || OFFICE_LOCATION}
                  zoom={17}
                >
                  {currentPosition && <Marker position={currentPosition} />}
                  <Marker position={OFFICE_LOCATION} label="회사" />
                </GoogleMap>
              </Box>
            )}

            <Field.Autocomplete
              name="dailyReportList"
              label="업무 보고 Email"
              multiple
              freeSolo
              disableCloseOnSelect
              options={[]}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getDailyReportProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getDailyReportProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="primary"
                    variant="soft"
                  />
                ))
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <LoadingButton
            type="submit"
            variant="soft"
            color={isCheckAllowed ? 'primary' : 'warning'}
            sx={{
              fontSize: '1.2rem',
              px: 4,
              py: 1,
              fontWeight: 'bold',
              width: '50%',
            }}
            disabled={!isCheckAllowed}
            loading={isSubmitting}
          >
            {loading ? '처리 중...' : timeType === 'startTime' ? '출근' : '퇴근'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
