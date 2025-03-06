import type { IAttendanceItem, IAttendanceRequest } from 'src/types/attendance';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { fTimeForString } from 'src/utils/format-time';

import { postAssistance } from 'src/actions/attendance-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

export const UpdateWorkAttendanceSchema = zod.object({
  managerName: zod.string().min(1, { message: '승인자 또는 요청자를 입력해주세요.' }),
  location: zod.string().optional(),
  taskDescription: zod.string().min(1, { message: '업무 내용을 입력해주세요.' }),
  dailyReportList: zod.array(zod.string().email({ message: 'Invalid email format!' })).optional(),
});

type Props = {
  userId: string;
  open: boolean;
  onClose: (payload: IAttendanceRequest, success: boolean) => void;
  onUpdate: () => void;
  workType: 'REMOTE' | 'FIELD';
  attendance: IAttendanceItem | undefined;
  dailyReportList: string[];
};

export function DashboardWorkDialog({
  userId,
  open,
  onClose,
  onUpdate,
  workType,
  attendance,
  dailyReportList,
}: Props) {
  const [loading, setLoading] = useState(false);

  const methods = useForm<IAttendanceRequest>({
    mode: 'all',
    resolver: zodResolver(UpdateWorkAttendanceSchema),
    defaultValues: {
      managerName: attendance?.managerName || '',
      location: attendance?.location || '',
      taskDescription: attendance?.taskDescription || '',
      dailyReportList: dailyReportList || [],
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      reset({
        managerName: attendance?.managerName || '',
        location: attendance?.location || '',
        taskDescription: attendance?.taskDescription || '',
        dailyReportList: dailyReportList || [],
      });
    }
  }, [open, reset, attendance, dailyReportList]);

  const onHandleSubmit = handleSubmit(async (data, event?: React.BaseSyntheticEvent) => {
    if (event) event.preventDefault();

    const formEvent = event?.nativeEvent as SubmitEvent;
    const submitter = formEvent?.submitter as HTMLButtonElement | null;
    let isTypeStr;

    let timeType: 'update' | 'startTime' | 'endTime';
    switch (submitter?.name) {
      case 'update':
        timeType = 'update';
        isTypeStr = '내용 수정';
        break;
      case 'start':
        timeType = 'startTime';
        isTypeStr = '시작';
        break;
      default:
        timeType = 'endTime';
        isTypeStr = '종료';
    }

    setLoading(true);

    const payload = {
      userId,
      workType,
      timeType,
      location: workType === 'FIELD' ? data.location : 'Home',
      managerName: data.managerName,
      taskDescription: data.taskDescription,
      dailyReportList: data.dailyReportList,
    };

    try {
      const response = await postAssistance(payload);

      if (response.status === 200) {
        toast.info(`${workType === 'REMOTE' ? '재택' : '외근'} ${isTypeStr} 완료`);
        onUpdate();
        onClose(payload, true);
      } else {
        toast.error(response.data);
        onClose(payload, false);
      }
    } catch (error) {
      console.error('출퇴근 체크 중 오류 발생:', error);
      toast.error(`${workType === 'REMOTE' ? '재택' : '외근'} ${isTypeStr} 중 오류 발생`);
      onClose(payload, false);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={() => onClose({} as IAttendanceRequest, false)}
    >
      <DialogTitle>
        {workType === 'REMOTE' ? '재택' : '외근'} 체크
        <IconButton
          onClick={() => onClose({} as IAttendanceRequest, false)}
          sx={{ position: 'absolute', right: 16, top: 16 }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <Form methods={methods} onSubmit={onHandleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <Stack spacing={2} sx={{ pt: 1, pb: 1 }}>
              <Field.Text
                name="managerName"
                fullWidth
                label={workType === 'REMOTE' ? '재택 승인자' : '외근 요청자'}
              />

              {workType === 'FIELD' && <Field.Text name="location" fullWidth label="외근 지역" />}

              <Field.Text name="taskDescription" fullWidth label="업무 내용" multiline rows={3} />

              <Field.Autocomplete
                name="dailyReportList"
                label="업무 보고 Email"
                multiple
                freeSolo
                disableCloseOnSelect
                options={[]}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
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

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    시작 시간:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {attendance?.workStartTime ? fTimeForString(attendance.workStartTime) : '--:--'}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    종료 시간:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {attendance?.workEndTime ? fTimeForString(attendance.workEndTime) : '--:--'}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <LoadingButton
            type="submit"
            variant="soft"
            color="primary"
            name="start"
            sx={{
              fontWeight: 'bold',
              width: '30%',
            }}
            disabled={!!attendance?.workStartTime || isSubmitting}
            loading={isSubmitting}
          >
            {loading ? '처리 중...' : workType === 'REMOTE' ? '재택 시작' : '외근 시작'}
          </LoadingButton>

          <LoadingButton
            type="submit"
            variant="soft"
            color="primary"
            name="end"
            sx={{
              fontWeight: 'bold',
              width: '30%',
            }}
            disabled={!attendance?.workStartTime || !!attendance?.workEndTime || isSubmitting}
            loading={isSubmitting}
          >
            {loading ? '처리 중...' : workType === 'REMOTE' ? '재택 종료' : '외근 종료'}
          </LoadingButton>

          <LoadingButton
            type="submit"
            variant="soft"
            color="primary"
            name="update"
            sx={{
              fontWeight: 'bold',
              width: '30%',
            }}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {loading ? '처리 중...' : '내용 수정'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
