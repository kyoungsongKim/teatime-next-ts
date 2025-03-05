import type { ReportItem } from 'src/types/report';
import type { DialogProps } from '@mui/material/Dialog';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { sendReport } from 'src/actions/report';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

import { useUser } from 'src/auth/context/user-context';

type Props = DialogProps & {
  date: string;
  site: string;
  project: string;
  md: number;
  content: string;
  justReport: boolean;
  onClose: () => void;
  parentSubmit: () => void;
  parentClose: () => void;
};

const ReportSchema = zod.object({
  title: zod.string().min(1, { message: '제목을 입력해주세요.' }),
  contents: zod.string().min(1, { message: '내용을 입력해주세요.' }),
  receiveEmail: zod
    .array(zod.string().trim().email({ message: '올바른 이메일 형식이 아닙니다.' }))
    .refine((emails) => emails.length > 0, {
      message: '최소 하나 이상의 이메일을 입력해야 합니다.',
    }),
});

export function CalendarReportDialog({
  date,
  site,
  project,
  md,
  content,
  justReport,
  onClose,
  parentSubmit,
  parentClose,
  ...other
}: Props) {
  const { userInfo } = useUser();

  const defaultTitle = useMemo(() => `${date} 일일 업무 보고 입니다.`, [date]);
  const defaultContents = useMemo(() => {
    let result = '';
    result += `[${site}] - ${project}( ${md.toLocaleString()} CAS )\n`;
    result += `${content}`;

    return result;
  }, [content, md, project, site]);
  const defaultValues = useMemo(
    () => ({
      sendUserName: userInfo ? userInfo.id : '',
      title: defaultTitle,
      receiveEmail: userInfo ? userInfo?.userDetails.dailyReportList.trim().split(',') : [],
      contents: defaultContents,
    }),
    [defaultContents, defaultTitle, userInfo]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ReportSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (userInfo === null) {
        toast.error('로그인 정보가 없습니다.');
        return;
      }
      const params: ReportItem = {
        sendUserName: userInfo.id,
        receiveEmail: values.receiveEmail,
        title: `[업무보고] ${values.title}`,
        contents: values.contents,
      };

      await sendReport(params).then((r) => {
        if (r.status !== 200) {
          console.error(r.data);
          toast.error(r.data);
        } else {
          toast.success('일일업무 보고가 성공적으로 전송되었습니다.');
          if (!justReport) {
            parentSubmit();
          } else {
            parentClose();
          }
          onClose();
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">일일업무 보고</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <Scrollbar sx={{ maxHeight: { xs: 400, sm: 500, md: 600 } }}>
          <DialogContent sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">To</Typography>
            <Field.Autocomplete
              name="receiveEmail"
              multiple
              freeSolo
              disableCloseOnSelect
              options={[]}
              size="small"
              renderTags={(selected, getDailyReportProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getDailyReportProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="primary"
                    variant="soft"
                  />
                ))
              }
            />
            <Typography variant="body2">제목</Typography>
            <Field.Text name="title" size="small" />
            <Typography variant="body2">내용</Typography>
            <Field.Text name="contents" multiline rows={8} />
          </DialogContent>
        </Scrollbar>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={onClose}>취소</Button>
          <LoadingButton
            loading={isSubmitting}
            type="submit"
            variant="soft"
            color="primary"
            disabled={isSubmitting}
          >
            보내기
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
