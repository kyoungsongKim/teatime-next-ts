import type { ChangePointExpAllItem } from 'src/types/point';

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

import { changePointToExpAll } from 'src/actions/exp-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

export const ChangePointExpAllSchema = zod.object({
  sender: zod
    .string()
    .min(1, { message: '경험치 전환자에 대한 정보가 만료되었습니다. 다시 로그인해주세요.' }),
  memo: zod.string().min(1, { message: '메모를 입력해주세요.' }),
  exp: zod.number().min(0, { message: '경험치를 입력해주세요.' }).or(zod.literal(0)),
});

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

export function PointExpAllDialog({ id, open, onClose, onUpdate }: Props) {
  const defaultPointExpAllValue: ChangePointExpAllItem = {
    sender: id,
    memo: '',
    exp: 0,
  };

  const methods = useForm<ChangePointExpAllItem>({
    mode: 'all',
    resolver: zodResolver(ChangePointExpAllSchema),
    defaultValues: defaultPointExpAllValue,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onChangeAllExp = handleSubmit(async (data) => {
    try {
      await changePointToExpAll(data.sender, data.memo, data.exp).then((r) => {
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          toast.success(`모든 고객에 대해 (${data.exp}) 포인트가 경험치로 전환되었습니다.`, {
            duration: 5000,
          });
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
          경험치 전환(고객 전체)
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onChangeAllExp}>
        <DialogContent>
          <Stack spacing={2}>
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
          <Button variant="soft" onClick={onClose}>
            Cancel
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
