import type { FaqsItem } from 'src/types/faqs';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
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

import { postFaq, deleteFaq } from 'src/actions/faq-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';

export const EditFaqSchema = zod.object({
  name: zod.string().min(1, { message: '이름을 입력해 주세요' }),
  description: zod.string().min(1, { message: '설명을 입력해 주세요' }),
});

type Props = {
  open: boolean;
  faqs: FaqsItem[];
  onClose: () => void;
  onFaqsUpdate: (updatedFaqs: FaqsItem[]) => void;
};

export function FaqsEditDialog({ open, faqs, onClose, onFaqsUpdate }: Props) {
  const confirm = useBoolean();

  const defaultEditValue: { name: string; description: string } = {
    name: '',
    description: '',
  };

  const methods = useForm<FaqsItem>({
    mode: 'all',
    resolver: zodResolver(EditFaqSchema),
    defaultValues: defaultEditValue,
  });
  const {
    reset,
    watch,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onModify = handleSubmit(async (data) => {
    if (!selectedFaq || !selectedFaq.id) {
      toast.error('수정할 FAQ를 선택해주세요.');
      return;
    }

    try {
      await postFaq(selectedFaq.id, data.name, data.description).then((r) => {
        console.log(r);
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          confirm.onTrue();
          reset();
          onFaqsUpdate(
            faqs.map((faq) =>
              faq.id === selectedFaq.id
                ? { ...faq, name: data.name, description: data.description }
                : faq
            )
          );
          onClose();
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  const onDelete = async () => {
    if (!selectedFaq || !selectedFaq.id) {
      toast.error('삭제할 FAQ를 선택해주세요.');
      return;
    }

    try {
      await deleteFaq(selectedFaq.id).then((r) => {
        if (r.status !== 200) {
          toast.error(r.data);
        } else {
          confirm.onTrue();
          reset();
          onFaqsUpdate(faqs.filter((faq) => faq.id !== selectedFaq.id));
          onClose();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Watch for the selected FAQ
  const selectedFaq: FaqsItem | null = watch('receiver' as any);

  // Populate fields when a FAQ is selected
  useEffect(() => {
    if (selectedFaq && typeof selectedFaq === 'object') {
      setValue('name', selectedFaq.name || '');
      setValue('description', selectedFaq.description || '');
    }
  }, [selectedFaq, setValue]);

  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
        <DialogTitle>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
            Edit FAQ
            <IconButton onClick={onClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Form methods={methods} onSubmit={onModify}>
          <DialogContent>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">FAQ ID</Typography>
                <Field.Autocomplete
                  autoComplete={false}
                  options={faqs || []}
                  name="receiver"
                  size="small"
                  value={selectedFaq || null} // undefined 방지
                  isOptionEqualToValue={(option: FaqsItem, value: FaqsItem | null) =>
                    option.id === value?.id
                  }
                  getOptionLabel={(option: FaqsItem) => option?.name || ''}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id || 'default-key'}>
                      {option.id || 'N/A'} ({option.name || 'No Name'})
                    </li>
                  )}
                />
              </Stack>
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
              Modify
            </LoadingButton>
            <Button variant="soft" color="error" onClick={() => onDelete()}>
              Delete
            </Button>
          </DialogActions>
        </Form>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="FAQ 수정"
        content={<Typography variant="body2">FAQ가 수정 되었습니다.</Typography>}
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
