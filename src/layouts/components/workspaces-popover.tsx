'use client';

import type { ButtonBaseProps } from '@mui/material/ButtonBase';
import React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { UserPointItem } from '../../types/point';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: UserPointItem;
};

export function WorkspacesPopover({ data, sx, ...other }: WorkspacesPopoverProps) {
  const popover = usePopover();

  const labelColors = {
    level: 'error', // 🔹 블루톤
    point: 'success', // 🟢 그린톤
    expvalue: 'warning', // 🟠 오렌지톤
  };

  const renderLabel = (
    icon: string,
    // eslint-disable-next-line @typescript-eslint/default-param-last
    value?: number | string,
    // @ts-ignore
    color: keyof typeof labelColors,
    fullWidth = false
  ) => (
    <Label
      // @ts-ignore
      color={labelColors[color]}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: 2,
        fontWeight: 'bold',
        width: fullWidth ? '100%' : 'fit-content',
        maxWidth: '100%',
      }}
    >
      <Iconify icon={icon} width="24" height="24" />
      {value}
    </Label>
  );

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={popover.onOpen}
        sx={{
          py: 0.5,
          gap: { xs: 1, sm: 1.5 },
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: 'fit-content',
          maxWidth: '100%',
          ...sx,
        }}
        {...other}
      >
        {renderLabel('mdi:trophy', data?.level, 'level')}
        {renderLabel('mdi:cash-multiple', data?.point, 'point', false) && (
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {renderLabel('mdi:cash-multiple', data?.point, 'point')}
          </Box>
        )}
        {renderLabel('mdi:star', data?.expvalue, 'expvalue', false) && (
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {renderLabel('mdi:star', data?.expvalue, 'expvalue')}
          </Box>
        )}

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
      </ButtonBase>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            gap: 1,
            p: 0.6,
            width: '100%',
          }}
        >
          {renderLabel('mdi:trophy', `레벨 : ${data?.level}`, 'level', true)}
          {renderLabel('mdi:cash-multiple', `포인트 : ${data?.point}`, 'point', true)}
          {renderLabel('mdi:star', `경험치 : ${data?.expvalue}`, 'expvalue', true)}
        </Box>
      </CustomPopover>
    </>
  );
}
