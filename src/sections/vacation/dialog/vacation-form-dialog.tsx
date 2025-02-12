import type { VacationHistoryItem } from 'src/types/vacation';

import 'dayjs/locale/ko';
import dayjs from 'dayjs';
import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { getNextBusinessDate, makeDateString } from 'src/utils/format-date';

import { saveVacation, updateVacation } from 'src/actions/vacation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { fNumber } from 'src/utils/format-number';

const VacationHistorySchema = (auth: string) =>
  zod
    .object({
      eventStartDate: zod.union([zod.string(), zod.number()]),
      eventEndDate: zod.union([zod.string(), zod.number()]),
      type: zod.string(),
      amount: zod.number().min(0, { message: '휴가 일수는 0일 이상이어야 합니다.' }),
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

  const [selectedOption, setSelectedOption] = useState<string>('연차');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');

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

  const onSubmit = handleSubmit(async (data) => {
    const params: VacationHistoryItem = {
      ...data,
      userId: user,
      eventStartDate: makeDateString(new Date(data.eventStartDate), 7),
      eventEndDate: makeDateString(new Date(data.eventEndDate), 7),
    };

    // item이 존재하면 수정, 아니면 생성
    if (item) {
      // 수정
      await updateVacation(item.id, params)
        .then((r) => {
          if (r.status === 200) {
            toast.success('수정되었습니다.');
            reset(defaultValues);
            setSelectedTime('09:00');
            setSelectedOption('연차');
            onUpdate();
            onClose();
          } else {
            toast.error('수정에 실패했습니다.');
          }
        })
        .catch(() => {
          toast.error('수정에 실패했습니다.');
        });
    } else {
      // 생성
      await saveVacation(params)
        .then((r) => {
          if (r.status === 200) {
            toast.success('저장되었습니다.');
            reset(defaultValues);
            setSelectedTime('09:00');
            setSelectedOption('연차');
            onUpdate();
            onClose();
          } else {
            toast.error('저장에 실패했습니다.');
          }
        })
        .catch(() => {
          toast.error('저장에 실패했습니다.');
        });
    }
  });

  const countAmount = useCallback(
    (value: number, init = false) => {
      methods.setValue('amount', init ? value : watch('amount') + value);
      updateDates();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [methods, watch]
  );

  const timeSelectOption = useMemo(() => {
    let result = [];
    if (selectedOption === '연차') {
      setSelectedTime('09:00');
      return [];
    }
    if (selectedOption.includes('오전')) {
      result = ['09:00', '10:00'];
    } else if (selectedOption.includes('반반차')) {
      result = ['16:00', '17:00'];
    } else {
      result = ['14:00', '15:00'];
    }

    if (!result.includes(selectedTime)) {
      setSelectedTime(result[0]);
    }

    return result;
  }, [selectedOption, selectedTime]);

  const handleSelection = (event: React.MouseEvent<HTMLElement>, newValue: string) => {
    // 연차 선택 시 개수 조절 가능하도록 기본값 1 설정
    const targetValue = newValue === null ? selectedOption : newValue;
    if (selectedOption !== targetValue && targetValue === '연차') {
      countAmount(1, true);
    } else if (selectedOption === targetValue && targetValue === '연차') {
      countAmount(1);
    }
    setSelectedOption(targetValue);
  };

  const getHourOffset = (hour: number, option: string) => {
    if (option.includes('반반차')) {
      return 2; // 오전 반반차
    }

    if (option.includes('반차')) {
      if (hour === 9 || hour === 10) return 5; // 오전 반차 (점심 포함)
      if (hour === 14 || hour === 15) return 4; // 오후 반차
    }

    return 0;
  };

  const updateDates = useCallback(() => {
    const startDate = dayjs(methods.getValues('eventStartDate'));
    const amount = methods.getValues('amount');
    const hour = parseInt(selectedTime.split(':')[0], 10);
    const updatedStart = startDate.hour(hour);
    const hourOffset = getHourOffset(hour, selectedOption);

    methods.setValue('eventStartDate', updatedStart.format('YYYY-MM-DD HH:mm'));

    if (selectedOption.includes('연차')) {
      methods.setValue('eventEndDate', getNextBusinessDate(startDate.hour(18), amount));
    } else {
      methods.setValue(
        'eventEndDate',
        updatedStart.add(hourOffset, 'hour').format('YYYY-MM-DD HH:mm')
      );
    }
  }, [methods, selectedTime, selectedOption]);

  const setInitData = useCallback((start: string, end: string) => {
    const startTime = dayjs(start).hour();
    const endTime = dayjs(end).hour();

    if (startTime === 9 && endTime === 18) {
      setSelectedOption('연차');
    } else if ((startTime === 9 && endTime === 11) || (startTime === 10 && endTime === 12)) {
      setSelectedOption('반반차(오전)');
    } else if ((startTime === 9 && endTime === 14) || (startTime === 10 && endTime === 15)) {
      setSelectedOption('반차(오전)');
    } else if ((startTime === 14 && endTime === 18) || (startTime === 15 && endTime === 19)) {
      setSelectedOption('반차(오후)');
    } else {
      setSelectedOption('반반차(오후)');
    }
    setSelectedTime(`${String(startTime).padStart(2, '0')}:00`);
  }, []);

  useEffect(() => {
    updateDates();
  }, [updateDates]);

  useEffect(() => {
    if (item) {
      reset(item);
      if (item.type === '경조휴가') methods.setValue('type', '경조');
      setInitData(item.eventStartDate, item.eventEndDate);
    } else {
      setSelectedOption('연차');
      setSelectedTime('09:00');
      reset(defaultValues);
    }
  }, [defaultValues, item, methods, reset, setInitData]);

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
              <Stack spacing={1}>
                <Typography variant="subtitle2">휴가 기간</Typography>
                <Typography variant="caption">
                  시작일 설정 후, 휴가 사용일에 맞춰 종료일(주말 제외)이 자동으로 계산됩니다.
                </Typography>
              </Stack>
              <Stack spacing={1} direction={{ xs: 'column', sm: 'column', md: 'row' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                  <Field.DatePicker
                    name="eventStartDate"
                    format="YYYY-MM-DD HH:mm"
                    disablePast={auth !== 'ADMIN'}
                    minDate={auth !== 'ADMIN' ? dayjs().add(1, 'day') : undefined} // 관리자만 당일 휴가 신청을 작성할 수 있음
                    disabled={auth !== 'ADMIN' && !!item}
                  />

                  <Field.DatePicker name="eventEndDate" format="YYYY-MM-DD HH:mm" disabled />
                </LocalizationProvider>
              </Stack>
              <Stack spacing={1} direction="row" alignItems="center">
                <Typography variant="body1">총 {watch('amount')}일</Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedOption('연차');
                    methods.setValue('amount', 1);
                    updateDates();
                  }}
                  disabled={auth !== 'ADMIN' && !!item}
                >
                  <Iconify icon="eva:refresh-outline" />
                </IconButton>
              </Stack>
              <Stack spacing={3}>
                {/* 반차 / 반반차 / 연차 선택 */}
                <ToggleButtonGroup
                  value={selectedOption}
                  exclusive
                  onChange={handleSelection}
                  aria-label="vacation selection"
                  color="primary"
                  sx={{
                    flexWrap: 'wrap',
                    '.MuiToggleButton-root': {
                      flex: {
                        xs: '1 0 calc(25% - 8px)',
                        sm: '1 0 calc(25% - 8px)',
                        md: '1 1 auto',
                      },
                      textWrap: 'nowrap',
                    },
                  }}
                  disabled={auth !== 'ADMIN' && !!item}
                >
                  <ToggleButton value="반반차(오전)" onClick={() => countAmount(0.25, true)}>
                    반반차 (오전)
                  </ToggleButton>
                  <ToggleButton value="반차(오전)" onClick={() => countAmount(0.5, true)}>
                    반차 (오전)
                  </ToggleButton>
                  <ToggleButton value="연차">
                    연차({selectedOption === '연차' ? watch('amount') : 1})
                  </ToggleButton>
                  <ToggleButton value="반차(오후)" onClick={() => countAmount(0.5, true)}>
                    반차 (오후)
                  </ToggleButton>
                  <ToggleButton value="반반차(오후)" onClick={() => countAmount(0.25, true)}>
                    반반차 (오후)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {/* 반반차, 반차일 경우엔 시간 선택지 추가 */}
              {selectedOption.includes('반차') && (
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  fullWidth
                  value={selectedTime}
                  disabled={auth !== 'ADMIN' && !!item}
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      setSelectedTime(newValue);
                    }
                  }}
                >
                  {timeSelectOption.map((time) => (
                    <ToggleButton key={time} value={time}>
                      {time}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}

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
          <Button
            onClick={() => {
              setSelectedOption('연차');
              reset(defaultValues);
            }}
            disabled={auth !== 'ADMIN' && !!item}
          >
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
