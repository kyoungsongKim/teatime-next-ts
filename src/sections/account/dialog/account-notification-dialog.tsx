import type { IUserItem } from 'src/types/user';
import type { INotificationItem } from 'src/types/notification';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { getUserList } from 'src/actions/user-ssr';
import { postNotification, getUserNotificationList } from 'src/actions/notification-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomTreeView } from 'src/components/custom-treeview';

export const EditFaqSchema = zod.object({
  id: zod.string().optional(),
  title: zod.string().min(1, { message: '제목을 입력해 주세요' }),
  content: zod.string().min(1, { message: '내용을 입력해 주세요' }),
  isGlobal: zod.boolean(),
  notificationType: zod.string(),
});

type Props = {
  userInfo: IUserItem | null;
  open: boolean;
  notification: INotificationItem | null;
  onClose: () => void;
  onUpdate: () => void;
};

export const NOTIFICATION_TYPE_STATUS_OPTIONS = [{ value: 'trueOrFalse', label: '확인또는거절' }];

export function AccountNotificationDialog({
  userInfo,
  open,
  notification,
  onClose,
  onUpdate,
}: Props) {
  const confirm = useBoolean();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userTreeList, setUserTreeList] = useState<{}>();

  const defaultEditValue = {
    id: '',
    title: '',
    content: '',
    isGlobal: true,
    notificationType: 'trueOrFalse',
  };

  const methods = useForm<INotificationItem>({
    mode: 'all',
    resolver: zodResolver(EditFaqSchema),
    defaultValues: defaultEditValue,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      if (notification) {
        reset({
          id: String(notification.id || ''),
          title: notification.title || '',
          content: notification.content || '',
          isGlobal: notification.isGlobal ?? true,
          notificationType: notification.notificationType ?? 'trueOrFalse',
        });
        getUserNotificationList(notification.id).then((r) => {
          setSelectedUsers(r.map((user) => user.user.id));
        });
      } else {
        console.log(open);
        reset({
          id: '',
          title: '',
          content: '',
          isGlobal: true,
          notificationType: 'trueOrFalse',
        });
        setSelectedUsers([]);
      }
      getUserList().then((r) => setUserTreeList(r.data));
    }
  }, [open, notification, reset]);

  const isGlobal = watch('isGlobal');

  const handleClose = () => {
    reset();
    setSelectedUsers([]);
    onClose();
  };

  const onSave = handleSubmit(async (data) => {
    try {
      await postNotification(
        data.id,
        userInfo?.id,
        data.title,
        data.content,
        data.isGlobal,
        data.notificationType,
        selectedUsers
      ).then((r) => {
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          confirm.onTrue();
          reset();
          setSelectedUsers([]);
          onUpdate();
          onClose();
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
        <DialogTitle>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
            Notification
            <IconButton onClick={handleClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Form methods={methods} onSubmit={onSave}>
          <DialogContent>
            <Stack spacing={2}>
              <Field.Switch
                name="isGlobal"
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      전체 공지
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      비활성화시 선택한 사용자에게만 알림이 전송됩니다.
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <Field.Text name="title" label="Title" size="small" />
              <Field.Select
                native
                name="notificationType"
                label="알람 종류"
                InputLabelProps={{ shrink: true }}
              >
                {NOTIFICATION_TYPE_STATUS_OPTIONS.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Field.Select>
              <Field.Text name="content" size="small" label="Content" multiline rows={5} />
              {!isGlobal && (
                <CustomTreeView
                  data={userTreeList || []}
                  groupBy="teamName"
                  labelKey="realName"
                  idKey="id"
                  selectedItems={selectedUsers}
                  setSelectedItems={setSelectedUsers}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              variant="soft"
              onClick={() => {
                reset();
                setSelectedUsers([]);
              }}
            >
              초기화
            </Button>
            <LoadingButton
              type="submit"
              variant="soft"
              color="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              저장
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="알람 저장"
        content={<Typography variant="body2">알람이 저장 되었습니다.</Typography>}
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
