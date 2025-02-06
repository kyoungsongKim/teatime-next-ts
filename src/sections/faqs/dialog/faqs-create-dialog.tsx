import type { FaqsItem } from 'src/types/faqs';

import * as zod from 'zod';
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

import { useBoolean } from 'src/hooks/use-boolean';

import { postFaq } from 'src/actions/faq-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';

export const CreateFaqSchema = zod.object({
  name: zod.string().min(1, { message: '이름을 입력해 주세요' }),
  description: zod.string().min(1, { message: '설명을 입력해 주세요' }),
});

type Props = {
  open: boolean;
  onClose: () => void;
};

export function FaqsCreateDialog({ open, onClose }: Props) {
  const confirm = useBoolean();

  const defaultCreateValue: { name: string; description: string } = {
    name: '',
    description: '',
  };

  const methods = useForm<FaqsItem>({
    mode: 'all',
    resolver: zodResolver(CreateFaqSchema),
    defaultValues: defaultCreateValue,
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onCreate = handleSubmit(async (data) => {
    try {
      await postFaq(null, data.name, data.description).then((r) => {
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          confirm.onTrue();
          reset();
          onClose();
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
        <DialogTitle>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
            Create FAQ
            <IconButton onClick={onClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Form methods={methods} onSubmit={onCreate}>
          <DialogContent>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Question</Typography>
                <Field.Text name="name" size="small" sx={{ '.Mui-error': { mx: 0 } }} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Answer</Typography>
                <Field.Text
                  name="description"
                  size="small"
                  multiline
                  rows={5}
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
        title="FAQ 등록"
        content={<Typography variant="body2">FAQ가 등록 되었습니다.</Typography>}
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
