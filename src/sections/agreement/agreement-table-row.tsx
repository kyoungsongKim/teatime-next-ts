import type { IAgreementItem, IAgreementDetailItem } from 'src/types/agreement';

// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import _ from 'lodash';
import { mutate } from 'swr';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Paper, CircularProgress } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { download } from '../../utils/file';
import { endpoints } from '../../utils/axios';
import { Label } from '../../components/label';
import { toast } from '../../components/snackbar';
import { makeDateString } from '../../utils/format-date';
import { useGetUserAgreement } from '../../actions/agreement';
import { deleteAgreement } from '../../actions/agreement-ssr';
import { AgreementFormDialog } from './dialog/agreement-form-dialog';

// ----------------------------------------------------------------------

type Props = {
  isAdmin: boolean | null;
  row: IAgreementItem;
  selected: boolean;
  onViewRow: () => void;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onUpdateRow: () => void;
};

type RenderCellAgreementCountProps = {
  row: IAgreementItem;
};

export function RenderCellAgreementCount({ row }: RenderCellAgreementCountProps) {
  const progress = row.currentAgreementCount
    ? (row.currentAgreementCount * 100) / row.totalAgreementCount
    : 0;

  let color: 'error' | 'warning' | 'success' = 'success';
  if (progress === 0) color = 'error';
  else if (progress < 100) color = 'warning';

  return (
    <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ width: '100%' }}>
      <LinearProgress
        value={Math.min(progress, 100)}
        variant="determinate"
        color={color}
        sx={{ width: '100%', height: 6 }}
      />
      <Box
        component="span"
        sx={{
          textAlign: 'center',
          typography: 'caption',
          color: 'text.secondary',
        }}
      >
        {formatNumber(row.currentAgreementCount)} / {formatNumber(row.totalAgreementCount)} 개
      </Box>
    </Stack>
  );
}

export function RenderCellAmountPercent({ row }: RenderCellAgreementCountProps) {
  const progress = row.totalAmount ? (row.totalAmount * 100) / row.guaranteeAmount : 0;

  return (
    <Stack justifyContent="center" sx={{ typography: 'caption', color: 'text.secondary' }}>
      <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ width: '100%' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          thickness={6}
          sx={{
            color: 'rgba(0, 0, 0, 0.1)',
            width: 64,
            height: 64,
            position: 'absolute',
          }}
        />
        <CircularProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          thickness={6}
          sx={{
            color: progress === 0 ? 'error.main' : progress < 100 ? 'warning.main' : 'success.main',
            width: 64,
            height: 64,
          }}
        />
      </Stack>
      <Box
        component="span"
        sx={{
          textAlign: 'center',
          typography: 'caption',
          color: 'text.secondary',
        }}
      >
        {`${progress.toFixed(0)} %`} {/* 소수점 두 자리 */}
      </Box>
    </Stack>
  );
}

export function RenderCellAmount({ row }: RenderCellAgreementCountProps) {
  const progress = row.totalAmount ? (row.totalAmount * 100) / row.guaranteeAmount : 0;

  let color: 'error' | 'warning' | 'success' = 'success';
  if (progress === 0) color = 'error';
  else if (progress < 100) color = 'warning';

  return (
    <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ width: '100%' }}>
      <LinearProgress
        value={Math.min(progress, 100)}
        variant="determinate"
        color={color}
        sx={{ width: '100%', height: 6 }}
      />
      <Box
        component="span"
        sx={{
          textAlign: 'center',
          typography: 'caption',
          color: 'text.secondary',
        }}
      >
        {formatNumber(row.totalAmount)} / {formatNumber(row.guaranteeAmount)} CAS
      </Box>
    </Stack>
  );
}

export function AgreementTableRow({
  isAdmin,
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  onUpdateRow,
}: Props) {
  const agreementFormDialog = useBoolean();
  const deleteConfirm = useBoolean();
  const detailDeleteConfirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();

  const [selectedDetailId, setSelectedDetailId] = useState<string>('');

  const { agreementInfo, agreementInfoLoading, isExistGuarantee } = useGetUserAgreement(row.userId);

  const [detailData, setDetailData] = useState<IAgreementDetailItem[]>(agreementInfo);

  useEffect(() => {
    if (!isAdmin) {
      collapse.onTrue();
    }
  }, [isAdmin, collapse]);

  useEffect(() => {
    setDetailData((prev) => (_.isEqual(prev, agreementInfo) ? prev : agreementInfo));
  }, [agreementInfo]);

  const handleUpdateAgreementInfo = () => {
    onUpdateRow();
    const apiUrl = `${endpoints.agreement.root}/${row.userId}`;
    mutate(apiUrl, undefined, { revalidate: true });
  };

  const handleDeleteDetailRow = useCallback(
    (id: string) => {
      deleteAgreement(id)
        .then((r) => {
          setDetailData((prev) => prev.filter((detailRow) => detailRow.id !== id));

          toast.success('삭제에 성공 했습니다.');

          onUpdateRow();
          const apiUrl = `${endpoints.agreement.root}/${row.userId}`;
          mutate(apiUrl, undefined, { revalidate: true });
        })
        .catch((e) => {
          toast.error('삭제에 실패 했습니다.');
        });
    },
    [onUpdateRow, row.userId]
  );

  const handleToggleCollapse = () => {
    collapse.onToggle();
  };

  const renderPrimary = (
    <TableRow hover selected={selected}>
      {/* 체크박스 */}
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
        />
      </TableCell>

      {/* 사용자 정보 */}
      <TableCell sx={{ flex: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1, md: 2 }}
          alignItems="center"
        >
          <Avatar src={row.avatarImg} alt={row.realName} sx={{ width: 40, height: 40 }} />
          <Stack
            sx={{
              typography: 'body2',
              alignItems: { xs: 'center', sm: 'flex-start' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Box component="span">
              <Link
                color="inherit"
                onClick={onViewRow}
                underline="always"
                sx={{
                  cursor: 'pointer',
                }}
              >
                {row.realName}
              </Link>
            </Box>
            <Box
              component="span"
              sx={{ color: 'text.disabled', fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              {row.userId}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      {/* 계약 건수 */}
      <TableCell
        align="center"
        sx={{
          whiteSpace: 'nowrap',
          display: { xs: 'none', md: 'table-cell' },
        }}
      >
        <RenderCellAgreementCount row={row} />
      </TableCell>

      {/* 달성율 */}
      <TableCell
        align="center"
        sx={{
          whiteSpace: 'nowrap',
          display: { xs: 'none', md: 'table-cell' },
        }}
      >
        <RenderCellAmountPercent row={row} />
      </TableCell>

      {/* 현재/목표 CAS */}
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        <RenderCellAmount row={row} />
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {isAdmin && (
          <>
            <IconButton
              color={collapse.value ? 'inherit' : 'default'}
              onClick={handleToggleCollapse}
              sx={{ ...(collapse.value && { bgcolor: 'action.hover' }) }}
            >
              <Iconify icon="eva:arrow-ios-downward-fill" />
            </IconButton>

            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </>
        )}
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper>
            {agreementInfoLoading ? (
              <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />
            ) : (
              [...detailData]
                .sort((a, b) => {
                  const order = { GUARANTEE: 0, MANAGER: 1, JOINED: 2, OTHER: 3 };
                  // @ts-ignore
                  return (order[a.type] ?? 3) - (order[b.type] ?? 3);
                })
                .map((item: IAgreementDetailItem) => {
                  const now = new Date();
                  const endDate = new Date(item.endDate);

                  const validityPeriod = Math.ceil(
                    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  const isExpired = now > endDate;

                  // 타입별 문구 및 색상 설정
                  const typeConfig = {
                    GUARANTEE: { label: '보장', color: 'success.main' },
                    MANAGER: { label: '주관', color: 'info.main' },
                    JOINED: { label: '참여', color: 'warning.main' },
                    OTHER: { label: '기타', color: 'error.main' },
                  };

                  // @ts-ignore
                  const typeText = typeConfig[item.type]?.label || item.type;
                  const typeColor = isExpired
                    ? 'grey.500'
                    : // @ts-ignore
                      typeConfig[item.type]?.color || 'text.primary';

                  return (
                    <Stack
                      key={item.id}
                      direction={{ xs: 'column', md: 'row' }} // 모바일에서는 세로 배치
                      alignItems="left"
                      spacing={{ xs: 1, md: 2 }}
                      sx={{
                        p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                        bgcolor: isExpired ? 'grey.300' : 'transparent', // 만료된 계약 배경색 회색
                        '&:not(:last-of-type)': {
                          borderBottom: (theme) => `solid 2px ${theme.palette.background.neutral}`,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                        <Box>
                          <Label
                            sx={{
                              minWidth: '30px',
                              bgcolor: isExpired ? 'grey.400' : typeColor,
                              color: 'white',
                            }}
                          >
                            {typeText}
                          </Label>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                            gap: { xs: 0.1, md: 0.5 },
                            color: isExpired ? 'grey.700' : 'text.primary',
                          }}
                        >
                          <Link
                            component="button"
                            onClick={() => download(item.file.id, item.file.originalName)}
                            underline="hover"
                            sx={{
                              color: isExpired ? 'grey.700' : '',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              background: 'none',
                              border: 'none',
                              alignItems: 'left',
                              padding: 0,
                              textAlign: 'left',
                            }}
                          >
                            {item.file.originalName}
                          </Link>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            color: isExpired ? 'grey.700' : 'text.primary',
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                          }}
                        >
                          {makeDateString(new Date(item.startDate), 8)} ~{' '}
                          {makeDateString(new Date(item.endDate), 8)}
                        </Box>

                        <Box>
                          <Label
                            variant="soft"
                            color={validityPeriod >= 0 ? 'warning' : 'error'}
                            sx={{
                              minWidth: '60px',
                              textAlign: 'right',
                              bgcolor: isExpired ? 'grey.400' : '',
                            }}
                          >
                            {validityPeriod}일
                          </Label>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 140,
                            textAlign: { xs: 'left', md: 'right' },
                            color: isExpired ? 'grey.700' : 'text.primary',
                          }}
                        >
                          {formatNumber(item.amount)} CAS
                        </Box>

                        {isAdmin && (
                          <IconButton
                            color="error"
                            onClick={() => {
                              setSelectedDetailId(item.id);
                              detailDeleteConfirm.onTrue();
                            }}
                          >
                            <Iconify icon="eva:trash-2-fill" />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>
                  );
                })
            )}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}
      {renderSecondary}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              agreementFormDialog.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="eva:plus-square-fill" />
            계약서 추가
          </MenuItem>

          <MenuItem
            onClick={() => {
              deleteConfirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            회원 삭제
          </MenuItem>

          <MenuItem
            onClick={() => {
              onViewRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            상세 보기
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={deleteConfirm.value}
        onClose={deleteConfirm.onFalse}
        title="멤버 삭제"
        content="해당 멤버를 삭제 하시겠습니까?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            삭제
          </Button>
        }
      />

      <ConfirmDialog
        open={detailDeleteConfirm.value}
        onClose={detailDeleteConfirm.onFalse}
        title="계약 삭제"
        content="해당 계약을 삭제 하시겠습니까?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedDetailId) {
                handleDeleteDetailRow(selectedDetailId);
              }
              detailDeleteConfirm.onFalse();
            }}
          >
            삭제
          </Button>
        }
      />

      <AgreementFormDialog
        isExistGuarantee={isExistGuarantee}
        realName={row.realName}
        userId={row.userId}
        onUpdate={handleUpdateAgreementInfo}
        open={agreementFormDialog.value}
        onClose={() => {
          agreementFormDialog.onFalse();
        }}
      />
    </>
  );
}
