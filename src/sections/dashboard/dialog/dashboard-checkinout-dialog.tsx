import React, { useState, useEffect } from 'react';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import {
  Box,
  Stack,
  Dialog,
  Button,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

type Props = {
  open: boolean;
  onClose: () => void;
  checkType: 'checkIn' | 'checkOut';
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

export function DashboardCheckInOutDialog({ open, onClose, checkType }: Props) {
  const confirm = useBoolean();
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isCheckAllowed, setIsCheckAllowed] = useState(false);
  const [distanceMessage, setDistanceMessage] = useState('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

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
          setDistanceMessage(`${checkType === 'checkIn' ? '출근' : '퇴근'}체크 가능합니다.`);
        } else {
          setIsCheckAllowed(false);
          setDistanceMessage(`출근 불가: 현재 위치는 ${Math.round(distance)}m 떨어져 있습니다.`);
        }
      },
      (error) => {
        setDistanceMessage('GPS 정보를 가져올 수 없습니다.');
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [checkType]);

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
        <DialogTitle>
          {checkType === 'checkIn' ? '출근' : '퇴근'} 체크
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              📍 GPS를 이용하여 위치 확인 후 {checkType === 'checkIn' ? '출근' : '퇴근'} 체크합니다.
            </Typography>

            {/* 출근/퇴근 가능 여부 메시지 */}
            <Typography
              variant="h6"
              color={isCheckAllowed ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 'bold' }}
            >
              {distanceMessage}
            </Typography>

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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="soft"
            color={isCheckAllowed ? 'info' : 'error'}
            disabled={!isCheckAllowed}
          >
            {checkType === 'checkIn' ? '출근' : '퇴근'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 출근/퇴근 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={`${checkType} 확인`}
        content={<Typography variant="body2">{`${checkType}을 등록 하시겠습니까?`}</Typography>}
        showCancel={false}
        action={
          <Button variant="soft" color="primary" onClick={confirm.onFalse}>
            확인
          </Button>
        }
      />
    </>
  );
}
