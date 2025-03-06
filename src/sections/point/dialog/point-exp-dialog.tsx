import type { IUserItem } from 'src/types/user';
import type { ChangePointExpItem } from 'src/types/point';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { changePointToExp } from 'src/actions/exp-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

export const ChangePointExpSchema = zod.object({
  sender: zod
    .string()
    .min(1, { message: '경험치 전환자에 대한 정보가 만료되었습니다. 다시 로그인해주세요.' }),
  receiver: zod.object({
    id: zod.string().min(1, { message: '경험치를 전환할 사람을 선택해주세요.' }),
    realName: zod.string().min(1, { message: '경험치를 전환할 사람을 선택해주세요.' }),
  }),
  memo: zod.string().min(1, { message: '메모를 입력해주세요.' }),
  exp: zod.number().min(0, { message: '경험치를 입력해주세요.' }).or(zod.literal(0)),
});

type Props = {
  id: string;
  open: boolean;
  userList: IUserItem[];
  onClose: () => void;
  onUpdate: () => void;
};

export function PointExpDialog({ id, open, userList, onClose, onUpdate }: Props) {
  const defaultPointExpAllValue: ChangePointExpItem = {
    sender: id,
    receiver: null,
    memo: '',
    exp: 0,
  };

  const methods = useForm<ChangePointExpItem>({
    mode: 'all',
    resolver: zodResolver(ChangePointExpSchema),
    defaultValues: defaultPointExpAllValue,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onChangeAllExp = handleSubmit(async (data) => {
    const receiver = data.receiver ? data.receiver.id : '';
    try {
      await changePointToExp(data.sender, receiver, data.exp, data.memo).then((r) => {
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          toast.success(
            `${receiver}(${data.receiver?.realName})의 (${data.exp}) 포인트가 경험치로 전환되었습니다.`,
            { duration: 5000 }
          );
          onUpdate();
          onClose();
          reset();
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
          경험치 전환
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onChangeAllExp}>
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
                  option && option.id && option.realName ? `${option.id} (${option.realName})` : ''
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
              <Typography variant="subtitle2">Exp</Typography>
              <Field.Text
                type="number"
                name="exp"
                placeholder="0"
                size="small"
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
            Change
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
