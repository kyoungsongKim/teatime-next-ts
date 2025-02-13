import type { DialogProps } from '@mui/material/Dialog';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { fData } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { createAgreement } from '../../../actions/agreement-ssr';

export const AGREEMENT_OPTIONS = [
  { value: 'GUARANTEE', label: '보장' },
  { value: 'MANAGER', label: '주관' },
  { value: 'JOINED', label: '참여' },
  { value: 'OTHER', label: '기타' },
];

type Props = DialogProps & {
  realName: string;
  userId: string;
  onUpdate: () => void;
  onClose: () => void;
};

const FormSchema = zod
  .object({
    type: zod.string().min(1, { message: '계약 종류를 선택해 주세요.' }),
    startDate: zod.string().min(1, { message: '시작 날짜를 선택해 주세요.' }),
    endDate: zod.string().min(1, { message: '종료 날짜를 선택해 주세요.' }),
    amount: zod.number().min(1, { message: '계약 금액을 입력해 주세요.' }),
    file: zod.instanceof(File, { message: '파일을 하나 업로드해 주세요.' }).optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: '종료 날짜는 시작 날짜보다 빠를 수 없습니다.',
    path: ['endDate'],
  });

export function AgreementFormDialog({ realName, userId, onUpdate, onClose, ...other }: Props) {
  const defaultValues = {
    type: 'GUARANTEE',
    startDate: '',
    endDate: '',
    amount: 0,
    file: null as File | null,
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;
  const values = watch();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setValue('file', acceptedFiles[0]);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    console.log(data.file);
    const formData = new FormData();
    const startDate = data.startDate.split('T')[0];
    const endDate = data.endDate.split('T')[0];

    const jsonBlob = new Blob(
      [
        JSON.stringify({
          userId,
          type: data.type,
          startDate,
          endDate,
          amount: data.amount,
        }),
      ],
      { type: 'application/json' }
    );
    formData.append('body', jsonBlob);

    if (data.file) {
      formData.append('file', data.file);
    }

    await createAgreement(formData)
      .then((r) => {
        if (r.status === 201) {
          toast.success('계약서 추가 완료되었습니다.');
          onUpdate();
          onClose();
          reset(defaultValues);
        } else {
          toast.error('계약서 추가 실패했습니다.');
        }
      })
      .catch((e) => {
        toast.error('계약서 추가 실패했습니다.');
        console.error(e);
      });
  });

  return (
    <Dialog {...other} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between">
          {realName}님 계약서 추가
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ m: 1 }}>
            <Field.Select
              native
              name="type"
              label="계약 종류"
              InputLabelProps={{ shrink: true }}
              onChange={(event) => setValue('type', event.target.value)}
            >
              {AGREEMENT_OPTIONS.map((types) => (
                <option key={types.label} value={types.value}>
                  {types.label}
                </option>
              ))}
            </Field.Select>

            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <Field.DatePicker name="startDate" label="시작 날짜" format="YYYY-MM-DD" />
              <Field.DatePicker name="endDate" label="종료 날짜" format="YYYY-MM-DD" />
            </Stack>

            <Field.Text label="계약 금액" name="amount" type="number" sx={{ mb: 1 }} />

            <Field.UploadBox
              name="file"
              multiple={false}
              disabled={isSubmitting}
              placeholder={
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={35} />
                  <Typography variant="body2">Upload file</Typography>
                </Box>
              }
              sx={{ width: '100%', p: 1 }}
              onDrop={onDrop}
            />

            {values.file && (
              <>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  업로드된 파일
                </Typography>
                <List>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => setValue('file', null)}
                        disabled={isSubmitting}
                      >
                        <Iconify icon="eva:close-outline" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={values.file.name}
                      secondary={`${fData(values.file.size)}`}
                    />
                  </ListItem>
                </List>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button variant="soft" onClick={() => reset(defaultValues)}>
            Reset
          </Button>
          <LoadingButton
            type="submit"
            variant="soft"
            color="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            추가
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
