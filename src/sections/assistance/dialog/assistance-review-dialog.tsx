import type { ApplyItem } from 'src/types/assistance';
import type { DialogProps } from '@mui/material/Dialog';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
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

import { postAssistanceReview } from 'src/actions/assistance';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

type Props = DialogProps & {
  id: string;
  auth: string;
  item?: ApplyItem;
  onClose: () => void;
  onUpdate: () => void;
};

export const ReviewSchema = zod.object({
  rating: zod.number().min(1, { message: '별점은 1 이상이어야 합니다.' }),
  content: zod.string(),
});

export function AssistanceReviewDialog({ id, auth, item, onClose, onUpdate, ...other }: Props) {
  const defaultValues = useMemo(
    () =>
      item && item.review
        ? {
            rating: item.review.rating,
            content: item.review.content ?? '',
          }
        : {
            rating: 5,
            content: '',
          },
    [item]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ReviewSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (!item) {
      toast.error('선택된 서비스가 없습니다.');
      return;
    }
    await postAssistanceReview(item.id, data)
      .then((r) => {
        if (r.status === 201) {
          toast.success('리뷰가 등록되었습니다.');
          onUpdate();
          onClose();
          reset(defaultValues);
        } else {
          toast.error('리뷰 등록에 실패했습니다.');
        }
      })
      .catch((e) => {
        toast.error('리뷰 등록에 싫패했습니다.');
      });
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, item, reset]);

  return (
    <Dialog {...other} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
          {item?.assistance.name}
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <Scrollbar sx={{ maxHeight: 400 }}>
          <DialogContent>
            <Stack spacing={1}>
              <Typography>별점</Typography>
              <Field.Rating name="rating" readOnly={item?.applier.id !== id && auth === 'ADMIN'} />
              <Field.Text
                name="content"
                aria-readonly={item?.applier.id !== id && auth === 'ADMIN'}
              />
            </Stack>
          </DialogContent>
        </Scrollbar>
        <DialogActions sx={{ justifyContent: 'center' }}>
          {!item ? (
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              variant="soft"
              color="primary"
            >
              제출
            </LoadingButton>
          ) : (
            <Button variant="soft" color="primary" onClick={onClose}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Form>
    </Dialog>
  );
}
