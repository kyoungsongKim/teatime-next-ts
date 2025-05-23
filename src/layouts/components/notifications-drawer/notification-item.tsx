import type { ButtonProps } from '@mui/material/Button';
import type { INotificationUserItem } from 'src/types/notification';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
import { FileThumbnail } from 'src/components/file-thumbnail';

// ----------------------------------------------------------------------

export function NotificationItem({
  notification,
  onUpdate,
}: {
  notification: INotificationUserItem;
  onUpdate: (reply: string, notificationId: string) => void;
}) {
  const [inputText, setInputText] = useState('');

  const renderAvatar = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 56,
        minWidth: 56,
      }}
    >
      {notification.avatarImg ? (
        <Avatar
          src={notification.avatarImg}
          sx={{ bgcolor: 'background.neutral', width: 40, height: 40 }}
        />
      ) : (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'background.neutral',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={`${CONFIG.assetsDir}/assets/icons/notification/${
              (notification.notification.notificationType === 'yesOrNo' && 'ic-order') ||
              (notification.notification.notificationType === 'chat' && 'ic-chat') ||
              (notification.notification.notificationType === 'mail' && 'ic-mail') ||
              (notification.notification.notificationType === 'delivery' && 'ic-delivery') ||
              'ic-default'
            }.svg`}
            sx={{ width: 24, height: 24 }}
          />
        </Box>
      )}

      <Typography
        variant="caption"
        noWrap
        sx={{ mt: 0.5, color: 'text.secondary', textAlign: 'center' }}
      >
        {notification.notification.user?.realName || '-'}
      </Typography>
    </Box>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={reader(notification.notification.title)}
      secondary={
        <>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ typography: 'caption', color: 'text.primary' }}
            dangerouslySetInnerHTML={{
              __html: notification.notification.content.replace(/\n/g, '<br />'),
            }}
          />
          {notification.reply && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{ typography: 'caption', color: 'info.main', mt: 0.5 }}
            >
              <Label color="info">{notification.reply}</Label>
            </Stack>
          )}

          <Stack
            direction="row"
            alignItems="center"
            sx={{ typography: 'caption', color: 'text.disabled' }}
            divider={
              <Box
                sx={{
                  width: 2,
                  height: 2,
                  bgcolor: 'currentColor',
                  mx: 0.5,
                  borderRadius: '50%',
                }}
              />
            }
          >
            {fToNow(notification.createdAt)}
          </Stack>
        </>
      }
    />
  );

  const renderUnReadBadge = !notification.isRead && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: '50%',
        bgcolor: 'info.main',
        position: 'absolute',
      }}
    />
  );

  const yesOrNoAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      <Button
        size="small"
        variant="soft"
        color="success"
        onClick={() => onUpdate('Yes', notification.id)}
        sx={{
          px: 1.5,
          py: 0.5,
          minWidth: 'auto',
          fontSize: '0.75rem',
        }}
      >
        Yes
      </Button>
      <Button
        size="small"
        variant="soft"
        color="info"
        onClick={() => onUpdate('No', notification.id)}
        sx={{
          px: 1.5,
          py: 0.5,
          minWidth: 'auto',
          fontSize: '0.75rem',
        }}
      >
        No
      </Button>
    </Stack>
  );

  const textInputAction = (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ mt: 1.5 }}>
      <TextField
        size="small"
        placeholder="Type your response"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        inputProps={{ maxLength: 50 }}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          '.MuiInputBase-root': {
            height: 30,
          },
        }}
      />

      <Button
        size="medium"
        variant="soft"
        color="info"
        onClick={() => {
          if (inputText.trim()) {
            onUpdate(inputText.trim(), notification.id);
            setInputText('');
          }
        }}
        sx={{
          height: 30,
          minWidth: 70,
          px: 2,
          fontSize: '0.875rem',
        }}
      >
        확인
      </Button>
    </Stack>
  );

  const renderColoredOptions = (options: string[], colors: ButtonProps['color'][]) => (
    <Stack spacing={1} direction="row" sx={{ mt: 1, flexWrap: 'wrap' }}>
      {options.map((option, index) => (
        <Button
          key={option}
          size="small"
          variant="soft"
          color={colors[index % colors.length]}
          onClick={() => onUpdate(option, notification.id)}
          sx={{
            px: 1.5,
            py: 0.5,
            minWidth: 'auto',
            fontSize: '0.75rem',
          }}
        >
          {option}
        </Button>
      ))}
    </Stack>
  );

  const projectAction = (
    <Stack alignItems="flex-start">
      <Box
        sx={{
          p: 1.5,
          my: 1.5,
          borderRadius: 1.5,
          color: 'text.secondary',
          bgcolor: 'background.neutral',
        }}
      >
        {reader(
          `<p><strong>@Jaydon Frankie</strong> feedback by asking questions or just leave a note of appreciation.</p>`
        )}
      </Box>

      <Button size="small" variant="contained" onClick={() => onUpdate('reply', notification.id)}>
        Reply
      </Button>
    </Stack>
  );

  const fileAction = (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        pl: 1,
        p: 1.5,
        mt: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
      }}
    >
      <FileThumbnail file="http://localhost:8080/httpsdesign-suriname-2015.mp3" />

      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} flexGrow={1} sx={{ minWidth: 0 }}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="subtitle2" component="div" sx={{ color: 'text.secondary' }} noWrap>
              design-suriname-2015.mp3
            </Typography>
          }
          secondary={
            <Stack
              direction="row"
              alignItems="center"
              sx={{ typography: 'caption', color: 'text.disabled' }}
              divider={
                <Box
                  sx={{
                    mx: 0.5,
                    width: 2,
                    height: 2,
                    borderRadius: '50%',
                    bgcolor: 'currentColor',
                  }}
                />
              }
            >
              <span>2.3 GB</span>
              <span>30 min ago</span>
            </Stack>
          }
        />

        <Button
          size="small"
          variant="outlined"
          onClick={() => onUpdate('download', notification.id)}
        >
          Download
        </Button>
      </Stack>
    </Stack>
  );

  const tagsAction = (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
      <Label variant="outlined" color="info">
        Design
      </Label>
      <Label variant="outlined" color="warning">
        Dashboard
      </Label>
      <Label variant="outlined">Design system</Label>
    </Stack>
  );

  const paymentAction = (
    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
      <Button size="small" variant="contained" onClick={() => onUpdate('pay', notification.id)}>
        Pay
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => onUpdate('decline_payment', notification.id)}
      >
        Decline
      </Button>
    </Stack>
  );

  return (
    <ListItemButton
      disableRipple
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
      }}
    >
      {renderUnReadBadge}

      {renderAvatar}

      <Stack sx={{ flexGrow: 1 }}>
        {renderText}
        {!notification.isRead &&
          (() => {
            const type = notification.notification.notificationType;

            const optionMap: Record<string, JSX.Element> = {
              yesOrNo: yesOrNoAction,
              textInput: textInputAction,
              threeOption: renderColoredOptions(['1', '2', '3'], ['success', 'info', 'warning']),
              fourOption: renderColoredOptions(
                ['1', '2', '3', '4'],
                ['success', 'info', 'warning', 'error']
              ),
              fiveOption: renderColoredOptions(
                ['1', '2', '3', '4', '5'],
                ['success', 'info', 'warning', 'error', 'secondary']
              ),
              project: projectAction,
              file: fileAction,
              tags: tagsAction,
              payment: paymentAction,
            };

            return optionMap[type] || null;
          })()}
      </Stack>
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function reader(data: string) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: data }}
      sx={{
        mb: 0.5,
        '& p': { typography: 'body2', m: 0 },
        '& a': { color: 'inherit', textDecoration: 'none' },
        '& strong': { typography: 'subtitle2' },
      }}
    />
  );
}
