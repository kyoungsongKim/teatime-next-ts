import type { IAttendance, IAttendanceRequest } from 'src/types/attendance';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
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
  managerName: zod.string().optional(),
  location: zod.string().optional(),
  taskDescription: zod.string().optional(),
});

type Props = {
  userId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  workType: 'REMOTE' | 'FIELD';
  attendance: IAttendance | undefined;
};

export function DashboardWorkDialog({
  userId,
  open,
  onClose,
  onUpdate,
  workType,
  attendance,
}: Props) {
  const [loading, setLoading] = useState(false);

  const methods = useForm<IAttendanceRequest>({
    mode: 'all',
    resolver: zodResolver(UpdateWorkAttendanceSchema),
    defaultValues: {
      managerName: attendance?.managerName || '',
      location: attendance?.location || '',
      taskDescription: attendance?.taskDescription || '',
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
      });
    }
  }, [open, reset, attendance]);

  const onHandleSubmit = handleSubmit(async (data, event?: React.BaseSyntheticEvent) => {
    event?.preventDefault();
    const formEvent = event?.nativeEvent as SubmitEvent;
    const submitter = formEvent?.submitter as HTMLButtonElement | null;
    const isStart = submitter?.name === 'start';

    const timeType =
      submitter?.name === 'update'
        ? ('update' as const)
        : submitter?.name === 'start'
          ? ('startTime' as const)
          : ('endTime' as const);

    setLoading(true);
    try {
      const payload = {
        userId,
        workType,
        timeType,
        location: workType === 'FIELD' ? data.location : 'Home',
        managerName: data.managerName,
        taskDescription: data.taskDescription,
      };

      await postAssistance(payload).then((r) => {
        if (r.status === 200) {
          toast.info(
            `${workType === 'REMOTE' ? '재택' : '외근'} ${isStart ? '시작' : '종료'} 완료`
          );
        } else {
          toast.error(r.data);
        }
      });
    } catch (error) {
      toast.error(
        `${workType === 'REMOTE' ? '재택' : '외근'} ${isStart ? '시작' : '종료'} 중 오류 발생`
      );
      console.error(error);
    } finally {
      onUpdate();
      setLoading(false);
      onClose();
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>
        {workType === 'REMOTE' ? '재택' : '외근'} 체크
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
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
          {/* ✅ 시작 버튼 */}
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

          {/* ✅ 종료 버튼 */}
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

          {/* ✅ 종료 버튼 */}
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
