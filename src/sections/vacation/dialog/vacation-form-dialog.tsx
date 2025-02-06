import type { VacationHistoryItem } from 'src/types/vacation';

import 'dayjs/locale/ko';
import dayjs from 'dayjs';
import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback } from 'react';

import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, renderDigitalClockTimeView } from '@mui/x-date-pickers';

import { calcDateDiff, makeDateString } from 'src/utils/format-date';

import { saveVacation, updateVacation } from 'src/actions/vacation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

const VacationHistorySchema = (auth: string) =>
  zod
    .object({
      eventStartDate: zod.union([zod.string(), zod.number()]),
      eventEndDate: zod.union([zod.string(), zod.number()]),
      type: zod.string(),
      reason: zod.string().min(1, { message: '사유를 입력해주세요.' }),
      adminMemo: zod.string().refine((value) => auth !== 'ADMIN' || value.length > 0, {
        message: '관리자 메모를 입력해주세요.',
      }),
    })
    .refine(
      (data) => {
        const startDate = new Date(data.eventStartDate);
        const endDate = new Date(data.eventEndDate);
        return startDate < endDate;
      },
      {
        message: '휴가 기간이 잘못 설정되었습니다.',
        path: ['eventEndDate'], // 오류를 표시할 필드
      }
    );

type Props = {
  item?: VacationHistoryItem;
  user: string;
  auth: string;
  open: boolean;
  left: number;
  onClose: () => void;
  onUpdate: () => void;
};

export function VacationFormDialog({
  item = undefined,
  user,
  auth,
  open,
  left,
  onClose,
  onUpdate,
}: Props) {
  const vacationType = ['연차', '공가', '경조', '출산', '특별', '보상', '기타'];
  const today = useMemo(() => new Date(), []);
  const defaultStartDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0, 0),
    [today]
  );
  const defaultEndDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 18, 0, 0),
    [today]
  );
  const defaultValues = useMemo(
    () =>
      !item
        ? {
            id: -1,
            userId: user,
            eventStartDate: makeDateString(defaultStartDate, 6),
            eventEndDate: makeDateString(defaultEndDate, 6),
            amount: 1,
            type: '연차',
            createdDate: makeDateString(today, 6),
            updatedDate: makeDateString(today, 6),
            reason: '',
            adminMemo: '',
          }
        : item,
    [item, user, defaultStartDate, defaultEndDate, today]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(VacationHistorySchema(auth)),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const values = watch();

  const vacationAmount = useCallback((eStartDate: string, eEndDate: string) => {
    const startDate = new Date(eStartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(eEndDate);
    endDate.setHours(0, 0, 0, 0);

    if (startDate.getTime() > endDate.getTime()) {
      return -1;
    }

    let amount = 0;
    amount += calcDateDiff(endDate, startDate) + 1;
    if ([13, 14, 15, 16].includes(new Date(eStartDate).getHours())) amount -= 0.5;
    if ([14, 15, 16].includes(new Date(eEndDate).getHours())) amount -= 0.5;
    return amount;
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    const params: VacationHistoryItem = {
      ...data,
      userId: user,
      amount: vacationAmount(data.eventStartDate, data.eventEndDate),
      eventStartDate: makeDateString(new Date(data.eventStartDate), 7),
      eventEndDate: makeDateString(new Date(data.eventEndDate), 7),
    };

    // item이 존재하면 수정, 아니면 생성
    if (item) {
      // 수정
      await updateVacation(item.id, params).then((r) => {
        if (r.status === 200) {
          toast.success('수정되었습니다.');
          reset(defaultValues);
          onUpdate();
          onClose();
        } else {
          toast.error('수정에 실패했습니다.');
        }
      });
    } else {
      // 생성
      await saveVacation(params).then((r) => {
        if (r.status === 200) {
          toast.success('저장되었습니다.');
          reset(defaultValues);
          onUpdate();
          onClose();
        } else {
          toast.error('저장에 실패했습니다.');
        }
      });
    }
  });

  const hours = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ];

  const filterHour = (...targetHours: number[]) =>
    hours.filter((hour) => !targetHours.includes(hour));

  const eventEndTimeDisableChecker = () => {
    if (!values.eventEndDate) return hours;
    const clonedEventEndDate = new Date(values.eventEndDate);
    clonedEventEndDate.setHours(new Date(defaultEndDate).getHours() || 0, 0, 0, 0);
    const amount = vacationAmount(values.eventStartDate, makeDateString(clonedEventEndDate, 6));
    if (amount <= 1) {
      let startTime = new Date(values.eventStartDate).getHours();
      if (startTime < 12) {
        startTime += 1;
        return filterHour(startTime + 4, startTime + 8);
      }
      return filterHour(startTime + 4);
    }
    if (amount > left) {
      return filterHour(14, 15, 16);
    }
    return filterHour(14, 15, 16, 18, 19, 20);
  };

  useEffect(() => {
    if (item) {
      reset(item);
    } else {
      reset(defaultValues);
    }
  }, [defaultValues, item, reset]);

  useEffect(() => {
    const watchEventStartDate = methods.getValues('eventStartDate');
    const watchEventEndDate = methods.getValues('eventEndDate');

    const amount = vacationAmount(watchEventStartDate, watchEventEndDate);
    if (amount === -1) {
      methods.setValue('eventEndDate', dayjs(watchEventStartDate).hour(18).format());
    }
    if (amount > 0 && amount < 1) {
      let addDays = 4;
      if (new Date(watchEventStartDate).getHours() < 12) {
        addDays = 5;
      }
      methods.setValue('eventEndDate', dayjs(watchEventStartDate).add(addDays, 'hour').format());
    }
    // eslint-disable-next-line
  }, [watch('eventStartDate'), watch('eventEndDate')]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
          {!item ? '휴가 신청' : '휴가 상세'}
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <Scrollbar sx={{ maxHeight: 400 }}>
          <DialogContent>
            <Stack spacing={1}>
              {/* 휴가 기간 */}
              <Typography variant="subtitle2">기간</Typography>
              <Stack spacing={1} direction={{ xs: 'column', sm: 'column', md: 'row' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                  <Field.MobileDateTimePicker
                    name="eventStartDate"
                    ampm={false}
                    format="YYYY-MM-DD HH:mm"
                    viewRenderers={{
                      hours: renderDigitalClockTimeView,
                      minutes: undefined,
                    }} // 분 뷰 비활성화
                    disablePast={auth !== 'ADMIN'} // 관리자 제외 과거 연차는 작성할 수 없음
                    minDate={auth !== 'ADMIN' ? dayjs().add(1, 'day') : undefined} // 관리자만 당일 휴가 신청을 작성할 수 있음
                    shouldDisableTime={(value, clockType) => {
                      if (clockType === 'hours') {
                        // 허용되지 않은 시간을 비활성화
                        return ![9, 10, 11, 13, 14, 15, 16].includes(value.hour());
                      }
                      return false;
                    }}
                    minutesStep={60} // 60분 단위
                    slotProps={{
                      toolbar: {
                        toolbarFormat: 'MM월 DD일',
                        toolbarPlaceholder: '날짜 선택',
                      },
                      dialog: {
                        sx: {
                          '& .MuiDigitalClock-root': {
                            minWidth: { xs: 320 },
                          },
                        },
                      },
                    }}
                    disabled={auth !== 'ADMIN' && !!item}
                  />
                  <Field.MobileDateTimePicker
                    name="eventEndDate"
                    ampm={false}
                    format="YYYY-MM-DD HH:mm"
                    viewRenderers={{ hours: renderDigitalClockTimeView, minutes: undefined }}
                    disablePast={auth !== 'ADMIN'} // 관리자 제외 과거 연차는 작성할 수 없음
                    minDate={dayjs(values.eventStartDate)} // 관리자만 당일 휴가 신청을 작성할 수 있음
                    maxDate={dayjs(values.eventStartDate).add(left, 'day')}
                    minutesStep={60}
                    slotProps={{
                      toolbar: {
                        toolbarFormat: 'MM월 DD일',
                        toolbarPlaceholder: '날짜 선택',
                      },
                      dialog: {
                        sx: {
                          '& .MuiDigitalClock-root': {
                            minWidth: { xs: 320 },
                          },
                        },
                      },
                    }}
                    disabled={auth !== 'ADMIN' && !!item}
                    shouldDisableTime={(value, clockType) => {
                      if (clockType === 'hours') {
                        // 허용되지 않은 시간을 비활성화
                        return eventEndTimeDisableChecker().includes(value.hour());
                      }
                      return false;
                    }}
                  />
                </LocalizationProvider>
              </Stack>
              <Typography textAlign="center" variant="body2">
                (총 {vacationAmount(watch('eventStartDate'), watch('eventEndDate'))}일)
              </Typography>

              {/* 휴가 구분(연차, 공가, 경조, 출산, 특별, 보상, 기타) */}
              <Typography variant="subtitle2">구분</Typography>
              <Field.ToggleButton
                name="type"
                options={vacationType.map((type) => ({ label: type, value: type }))}
                defaultValue="연차"
                color="primary"
                exclusive
                sx={{
                  flexWrap: 'wrap',
                  '.MuiToggleButton-root': {
                    flex: { xs: '1 0 calc(25% - 8px)', sm: '1 0 calc(25% - 8px)', md: '1 1 auto' },
                    textWrap: 'nowrap',
                  },
                }}
                disabled={auth !== 'ADMIN' && !!item}
              />

              {/* 휴가 사유 */}
              <Typography variant="subtitle2">사유</Typography>
              <Field.Text name="reason" disabled={auth !== 'ADMIN' && !!item} />

              {/* 관리자만 노출 - 관리자 메모 */}
              {auth === 'ADMIN' && (
                <>
                  <Typography variant="subtitle2">관리자 메모</Typography>
                  <Field.Text name="adminMemo" />
                </>
              )}
            </Stack>
          </DialogContent>
        </Scrollbar>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => reset(defaultValues)} disabled={auth !== 'ADMIN' && !!item}>
            초기화
          </Button>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            variant="soft"
            color="primary"
            disabled={isSubmitting || (auth !== 'ADMIN' && !!item)}
          >
            저장
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
