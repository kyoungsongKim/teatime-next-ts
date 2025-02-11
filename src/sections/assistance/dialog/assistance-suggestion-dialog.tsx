import type { DialogProps } from '@mui/material/Dialog';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { postAssistanceSuggestion } from 'src/actions/assistance';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

type Props = DialogProps & {
  onClose: () => void;
};

const AssistanceSuggestionSchema = zod.object({
  content: zod.string().min(1, { message: '내용을 입력해주세요.' }),
});

export function AssistanceSuggestionDialog({ onClose, ...other }: Props) {
  const defaultValues = {
    content: '',
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(AssistanceSuggestionSchema),
    defaultValues,
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    await postAssistanceSuggestion(data)
      .then((r) => {
        if (r.status === 201) {
          toast.success('비서 서비스 제안이 등록되었습니다.');
          onClose();
          reset(defaultValues);
        } else {
          toast.error('비서 서비스 제안 등록에 실패했습니다.');
        }
      })
      .catch((e) => {
        toast.error('비서 서비스 제안 등록에 실패했습니다.');
      });
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
      <DialogTitle>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
          비서 서비스 제안
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <Scrollbar sx={{ maxHeight: 400 }}>
          <DialogContent>
            <Stack spacing={1}>
              <Typography variant="body2">건의하고 싶은 의견을 자유롭게 작성해주세요.</Typography>
              <Field.Text name="content" multiline rows={8} />
            </Stack>
          </DialogContent>
        </Scrollbar>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            variant="soft"
            color="primary"
          >
            제출
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
