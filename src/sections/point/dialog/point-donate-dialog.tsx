import type { DonatePointItem } from 'src/types/point';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
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

import { donatePoint } from 'src/actions/point';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

export const DonatePointSchema = zod.object({
  code: zod.string().min(1, { message: 'Please input code' }),
  recver: zod.string().min(1, { message: 'Please input recver' }),
});

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

export function PointDonateDialog({ id, open, onClose, onUpdate }: Props) {
  const defaultPointValue: DonatePointItem = {
    code: '',
    recver: id,
  };
  const methods = useForm<DonatePointItem>({
    mode: 'all',
    resolver: zodResolver(DonatePointSchema),
    defaultValues: defaultPointValue,
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onDonate = handleSubmit(async (data) => {
    // post /api/point/pointCode API 호출
    try {
      await donatePoint(data.code.toUpperCase(), data.recver)
        .then((r) => {
          if (r.status !== 200) {
            toast.error(r.data);
          } else {
            toast.success('기부가 완료되었습니다.');
            reset();
            onUpdate();
            onClose();
          }
        })
        .catch((e) => {
          toast.error(e);
        });
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
          Donation Point
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onDonate}>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2">기부 기회권 코드</Typography>
            <Field.Text
              name="code"
              size="small"
              sx={{ '.Mui-error': { mx: 0 } }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
              기부 기회권 코드를 입력하세요.
              <br />
              에이전시 공용 계좌에서 사람 기부금 계좌(0379-0201)로 자동이체 됩니다!
            </Typography>
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
            Donate
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
