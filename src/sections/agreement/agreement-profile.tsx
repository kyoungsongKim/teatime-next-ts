import type { IUserProfile } from 'src/types/user';

import React from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { fNumber } from 'src/utils/format-number';
import { TwitterIcon, FacebookIcon, LinkedinIcon, InstagramIcon } from 'src/assets/icons';
import { Iconify } from 'src/components/iconify';
import { download } from '../../utils/file';
import { Scrollbar } from '../../components/scrollbar';
import { makeDateForString } from '../../utils/format-date';
import { Label, LabelColor } from '../../components/label';

import type { IUser, IAgreementItem, IAgreementDetailItem } from '../../types/agreement';
import { grey } from '../../theme/core';
// ----------------------------------------------------------------------

type Props = {
  agreementInfos: IAgreementItem[];
  detailData: IAgreementDetailItem[];
  userData: IUser;
  info: IUserProfile;
};

const socialLinks = [
  { key: 'facebookUrl', icon: <FacebookIcon />, label: 'Facebook' },
  { key: 'instagramUrl', icon: <InstagramIcon />, label: 'Instagram' },
  { key: 'linkedinUrl', icon: <LinkedinIcon />, label: 'LinkedIn' },
  { key: 'twitterUrl', icon: <TwitterIcon />, label: 'Twitter' },
];

export function AgreementProfile({ agreementInfos, detailData, userData, info }: Props) {
  const renderAmountCas = (
    <Card sx={{ py: 3, textAlign: 'center', typography: 'h4' }}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
        <Stack width={1}>
          {fNumber(agreementInfos[0]?.totalAmount)}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            현재 CAS
          </Box>
        </Stack>

        <Stack width={1}>
          {fNumber(agreementInfos[0]?.guaranteeAmount)}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            보장 CAS
          </Box>
        </Stack>
      </Stack>
    </Card>
  );

  const renderAbout = (
    <Card>
      <CardHeader title="About" />

      <Stack spacing={2} sx={{ p: 3, typography: 'body2' }}>
        <Box>{userData?.description}</Box>

        <Box display="flex">
          <Iconify width={24} icon="mdi:card-account-details-outline" sx={{ mr: 2 }} />
          ID :
          <Link variant="subtitle2" color="inherit">
            &nbsp;{userData?.id}
          </Link>
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="mingcute:location-fill" sx={{ mr: 2 }} />
          <Link variant="subtitle2" color="inherit">
            &nbsp;{userData?.userDetails.address}
          </Link>
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="fluent:mail-24-filled" sx={{ mr: 2 }} />
          {userData?.userDetails.email}
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="mdi:cellphone" sx={{ mr: 2 }} />
          <Link variant="subtitle2" color="inherit">
            &nbsp;{userData?.userDetails.cellphone}
          </Link>
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="mdi:university" sx={{ mr: 2 }} />
          <Link variant="subtitle2" color="inherit">
            &nbsp;{userData?.userDetails.educationLevel}
          </Link>
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="mdi:certificate" sx={{ mr: 2 }} />
          <Link variant="subtitle2" color="inherit">
            &nbsp;{userData?.userDetails.skillLevel}
          </Link>
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="mdi:update" sx={{ mr: 2 }} />
          {`Renewal at `}
          <Link variant="subtitle2" color="inherit">
            &nbsp;{userData?.userDetails.joinDate}
          </Link>
        </Box>
      </Stack>
    </Card>
  );

  const renderAgreementHistoryList = (
    <Scrollbar sx={{ mt: 5 }}>
      <Table sx={{ minWidth: 360 }}>
        <TableHead>
          <TableRow>
            <TableCell width={40}>#</TableCell>
            <TableCell sx={{ typography: 'subtitle2' }}>계약명</TableCell>
            <TableCell sx={{ typography: 'subtitle2' }}>계약 기간</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {detailData
            ?.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((row, index) => {
              const typeConfig = {
                GUARANTEE: { label: '보장', color: 'success' },
                MANAGER: { label: '주관', color: 'info' },
                JOINED: { label: '참여', color: 'warning' },
                OTHER: { label: '기타', color: 'error' },
                GUARANTEE_HISTORY: { label: '계약 종료', color: 'default' },
                MANAGER_HISTORY: { label: '계약 종료', color: 'default' },
                JOINED_HISTORY: { label: '계약 종료', color: 'default' },
              };

              // @ts-ignore
              const typeText: string = typeConfig[row.type]?.label || row.type;
              // @ts-ignore
              const typeColor: LabelColor = typeConfig[row.type]?.color || 'success';

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        maxWidth: 300,
                        color: 'text.primary',
                      }}
                    >
                      {/* 파일명 */}
                      <ListItemText
                        primary={
                          <Link
                            component="button"
                            onClick={() => download(row.file.id, row.file.originalName)}
                            underline="hover"
                            sx={{
                              color: '#007BFF',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              background: 'none',
                              border: 'none',
                              alignItems: 'left',
                              padding: 0,
                              textAlign: 'left',
                            }}
                          >
                            {row.file.originalName}
                          </Link>
                        }
                        secondary={
                          <Label
                            variant="soft"
                            color={typeColor}
                            sx={{
                              minWidth: '60px',
                              textAlign: 'right',
                            }}
                          >
                            {typeText}
                          </Label>
                        }
                        primaryTypographyProps={{ typography: 'body2' }}
                        secondaryTypographyProps={{
                          component: 'span',
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        maxWidth: 300,
                        color: 'text.primary',
                      }}
                    >
                      {makeDateForString(row.startDate)} ~ {makeDateForString(row.endDate)}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Scrollbar>
  );

  const renderSocials = (
    <Card>
      <CardHeader title="Social" />
      <Stack spacing={2} sx={{ p: 3 }}>
        {socialLinks.map(({ key, icon }) => {
          // @ts-ignore
          const url = userData?.userDetails?.[key];
          return url ? (
            <Stack
              key={key}
              spacing={2}
              direction="row"
              sx={{ wordBreak: 'break-all', typography: 'body2' }}
            >
              {icon}
              <Link color="inherit">{url}</Link>
            </Stack>
          ) : null;
        })}
      </Stack>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Stack spacing={3}>
          {renderAmountCas}
          {renderAbout}
          {renderSocials}
        </Stack>
      </Grid>

      <Grid xs={12} md={8}>
        <Stack spacing={3}>{renderAgreementHistoryList}</Stack>
      </Grid>
    </Grid>
  );
}
