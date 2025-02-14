import type { CUserItem } from 'src/types/user';
import type { CreatePointItem } from 'src/types/point';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { makePoint } from 'src/actions/point-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';

export const CreatePointSchema = zod.object({
  sender: zod
    .string()
    .min(1, { message: '기부코드 전달자에 대한 정보가 만료되었습니다. 다시 로그인해주세요.' }),
  receiver: zod.object({
    id: zod.string().min(1, { message: '기부코드를 받을 사람을 선택해주세요.' }),
  }),
  memo: zod.string().min(1, { message: '메모를 입력해주세요.' }),
  point: zod.number().min(0, { message: '포인트를 입력해주세요.' }).or(zod.literal(0)),
});

type Props = {
  id: string;
  open: boolean;
  userList: CUserItem[];
  onClose: () => void;
};

export function PointCreateDialog({ id, open, userList, onClose }: Props) {
  const confirm = useBoolean();
  const [publishCode, setPublishCode] = useState('');

  const defaultPointValue: CreatePointItem = {
    sender: id,
    receiver: null,
    memo: '',
    point: 0,
  };
  const methods = useForm<CreatePointItem>({
    mode: 'all',
    resolver: zodResolver(CreatePointSchema),
    defaultValues: defaultPointValue,
  });
  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onCreate = handleSubmit(async (data) => {
    const receiver = data.receiver ?? { id: '' };
    try {
      await makePoint(data.sender, receiver.id, data.point, data.memo).then((r) => {
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          setPublishCode(r.data);
          confirm.onTrue();
          reset();
          onClose();
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  // 복사 기능
  const handleCopy = async () => {
    if (!publishCode) return;

    try {
      // 1. navigator.clipboard API 사용
      await navigator.clipboard.writeText(publishCode);
      toast.success('Copied!');
    } catch (error) {
      console.warn('Navigator clipboard failed, falling back to textarea method.', error);

      // 2. textarea를 사용한 백업 복사 방법
      const textarea = document.createElement('textarea');
      textarea.value = publishCode;
      textarea.style.position = 'fixed'; // 화면에서 보이지 않게 설정
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        toast.success('Copied!');
      } catch (fallbackError) {
        toast.error('복사 실패!');
      } finally {
        document.body.removeChild(textarea); // textarea 제거
      }
    }
  };

  return (
    <>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
        <DialogTitle>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
            Create Point
            <IconButton onClick={onClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Form methods={methods} onSubmit={onCreate}>
          <DialogContent>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Choice ID</Typography>
                <Field.Autocomplete
                  options={userList || []}
                  name="receiver"
                  size="small"
                  value={watch('receiver')}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) =>
                    option && option.id && option.realName
                      ? `${option.id} (${option.realName})`
                      : ''
                  }
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.id} ({option.realName})
                    </li>
                  )}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Memo</Typography>
                <Field.Text name="memo" size="small" sx={{ '.Mui-error': { mx: 0 } }} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Point</Typography>
                <Field.Text
                  type="number"
                  name="point"
                  size="small"
                  placeholder="0"
                  sx={{ '.Mui-error': { mx: 0 } }}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button variant="soft" onClick={() => reset()}>
              Reset
            </Button>
            <LoadingButton
              type="submit"
              variant="soft"
              color="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="코드 발행"
        content={
          <>
            <Typography variant="body2">포인트 기부용 코드가 발급되었습니다.</Typography>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={publishCode}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopy} edge="end" aria-label="copy">
                      <Iconify width={18} icon="solar:copy-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        }
        action={
          <Button type="button" variant="soft" color="primary" onClick={confirm.onFalse}>
            확인
          </Button>
        }
        showCancel={false}
      />
    </>
  );
}
