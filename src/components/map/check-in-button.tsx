'use client';

import { useState } from 'react';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import { Box, Card, Button, Typography } from '@mui/material';

import { toast } from 'src/components/snackbar';
import { SvgColor } from 'src/components/svg-color';

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

export function CheckInButton() {
  const [loading, setLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error('GPS 기능이 지원되지 않습니다.');
      return;
    }

    setLoading(true);

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
          toast.success('출근 체크 완료!');
        } else {
          toast.error(`출근 불가: 현재 위치는 ${Math.round(distance)}m 떨어져 있습니다.`);
        }

        setLoading(false);
      },
      (error) => {
        toast.error('GPS 정보를 가져올 수 없습니다.');
        console.error(error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h5" fontWeight="bold">
        출근 체크
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        GPS를 이용하여 위치 확인 후 출근 체크합니다.
      </Typography>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <SvgColor src="/icons/work.svg" sx={{ width: 50, height: 50 }} />
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3, py: 1.5 }}
        onClick={handleCheckIn}
        disabled={loading}
      >
        {loading ? '확인 중...' : '출근하기'}
      </Button>

      {isLoaded && currentPosition && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: 300 }}
          center={currentPosition}
          zoom={17}
        >
          <Marker position={currentPosition} />
          <Marker position={OFFICE_LOCATION} label="회사" />
        </GoogleMap>
      )}
    </Card>
  );
}
