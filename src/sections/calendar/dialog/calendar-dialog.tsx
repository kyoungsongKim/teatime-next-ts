import type { DialogProps } from '@mui/material/Dialog';
import type { ProjectItem, ICalendarRange } from 'src/types/calendar';

import dayjs from 'dayjs';
import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { renderMultiSectionDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers/timeViewRenderers';

import { useBoolean } from 'src/hooks/use-boolean';

import { makeDateString } from 'src/utils/format-date';

import { createEvent, deleteEvent, updateEvent } from 'src/actions/calendar';
import { getSiteList, getTicketInfo, getProjectList } from 'src/actions/ticket-ssr';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';

type Props = DialogProps & {
  userName: string;
  item: string;
  selectedDate: ICalendarRange;
  onClose: () => void;
  onUpdate: () => void;
};

const TicketFormSchema = zod.object({
  project: zod.string().min(1, { message: '프로젝트명을 입력해주세요.' }),
  site: zod.union([
    zod.string().min(1, { message: '사업부를 선택해주세요.' }),
    zod.null().refine(() => false, { message: '사업부를 선택해주세요.' }),
  ]),
  content: zod.string().min(1, { message: '내용을 입력해주세요.' }),
  md: zod.union([
    zod.number().min(1, { message: 'CAS를 입력해주세요.' }),
    zod
      .string()
      .min(1, { message: 'CAS를 입력해주세요.' }) // 빈 문자열 체크
      .transform((val) => Number(val)) // 숫자로 변환
      .refine((val) => !Number.isNaN(val) && val >= 1, { message: 'CAS는 1 이상이어야 합니다.' }),
  ]),
  eventStartDate: zod.string().min(1, { message: '시작일을 입력해주세요.' }),
  eventEndDate: zod.string().min(1, { message: '종료일을 입력해주세요.' }),
});

const isAllDayFormat = (dateStr: string) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

export function CalendarDialog({
  item,
  userName,
  selectedDate,
  onClose,
  onUpdate,
  ...other
}: Props) {
  const deleteConfirm = useBoolean();

  const [siteList, setSiteList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<ProjectItem[]>([]);

  const defaultStartDate = useMemo(() => {
    if (selectedDate)
      return isAllDayFormat(selectedDate.start)
        ? new Date(selectedDate.start).setHours(9, 0, 0, 0)
        : new Date(selectedDate.start);
    return new Date().setHours(9, 0, 0, 0);
  }, [selectedDate]);
  const defaultEndDate = useMemo(() => {
    if (selectedDate)
      return isAllDayFormat(selectedDate.end)
        ? new Date(selectedDate.end).setHours(18, 0, 0, 0)
        : new Date(selectedDate.end);
    return new Date().setHours(18, 0, 0, 0);
  }, [selectedDate]);

  const defaultValues = useMemo(
    () => ({
      project: '',
      site: '',
      content: '',
      md: '',
      eventStartDate: makeDateString(new Date(defaultStartDate), 7),
      eventEndDate: makeDateString(new Date(defaultEndDate), 7),
    }),
    [defaultStartDate, defaultEndDate]
  );

  const methods = useForm({
    mode: 'all',
    defaultValues,
    resolver: zodResolver(TicketFormSchema),
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      if (!item) {
        const ticketData: any = {
          teamName: '',
          ...defaultValues,
          ...formValues,
          userName,
          eventStartDate: dayjs(formValues.eventStartDate).format('YYYY-MM-DD HH:mm:ss'),
          eventEndDate: dayjs(formValues.eventEndDate).format('YYYY-MM-DD HH:mm:ss'),
          title: formValues.project,
        };
        await createEvent(ticketData).then((r) => {
          if (r.status !== 200) {
            console.error(r.data);
          } else {
            toast.success('티켓이 등록되었습니다.');
            onUpdate();
            onClose();
            reset(defaultValues);
          }
        });
      } else {
        const eventData: any = {
          ...methods.formState.defaultValues,
          ...formValues,
          userName,
          teamName: '',
          title: formValues.project,
          id: Number(item),
          eventStartDate: dayjs(formValues.eventStartDate).format('YYYY-MM-DD HH:mm:ss'),
          eventEndDate: dayjs(formValues.eventEndDate).format('YYYY-MM-DD HH:mm:ss'),
        };
        await updateEvent(eventData).then((r) => {
          if (r.status !== 200) {
            console.error(r.data);
          } else {
            toast.success('티켓이 수정되었습니다.');
            onUpdate();
            onClose();
            reset(defaultValues);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  const isFutureDate = useMemo(
    () =>
      methods.formState.defaultValues &&
      dayjs(methods.formState.defaultValues.eventStartDate)
        .startOf('day')
        .diff(dayjs().startOf('day'), 'day') >= 0,
    [methods.formState.defaultValues]
  );

  const isFieldDisabled = useMemo(() => !!item && !isFutureDate, [item, isFutureDate]);

  const deleteTicket = () => {
    try {
      if (item) {
        deleteConfirm.onFalse();
        deleteEvent(item).then((r) => {
          if (r.status !== 200) {
            console.error(r.data);
          } else {
            toast.success('티켓이 삭제되었습니다.');
            onUpdate();
            onClose();
            reset(defaultValues);
          }
        });
      } else {
        console.error('티켓 ID가 없습니다.');
      }
    } catch (e) {
      console.error('deleteTicket: ', e);
    }
  };

  useEffect(() => {
    getSiteList().then((r) => {
      const siteStrList = r
        .map((site: { site: string }) => site.site)
        .sort((a: string, b: string) => {
          const isNumber = (str: string) => /^[0-9]/.test(str);
          const isEnglish = (str: string) => /^[A-Za-z]/.test(str);

          if (isNumber(a) && !isNumber(b)) return -1;
          if (!isNumber(a) && isNumber(b)) return 1;

          if (isEnglish(a) && !isEnglish(b)) return -1;
          if (!isEnglish(a) && isEnglish(b)) return 1;

          return a.localeCompare(b, 'ko-KR'); // 한글 포함한 문자열 정렬
        });
      setSiteList(siteStrList);
    });
  }, []);

  useEffect(() => {
    if (values.site !== '') {
      getProjectList(values.site).then((r) => {
        setProjectList(r);
      });
    } else {
      setProjectList([]);
    }
  }, [values.site]);

  useEffect(() => {
    if (item !== '') {
      getTicketInfo(item).then((r) => {
        reset({
          project: r.project,
          site: r.site,
          content: r.content,
          md: r.md,
          eventStartDate: r.eventStartDate,
          eventEndDate: r.eventEndDate,
        });
      });
    } else {
      reset({
        ...defaultValues,
        eventStartDate: makeDateString(new Date(defaultStartDate), 7),
        eventEndDate: makeDateString(new Date(defaultEndDate), 7),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, selectedDate]);

  return (
    <>
      <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
        <DialogTitle>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
            티켓 {item ? '상세' : '추가'}
            <IconButton onClick={onClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Form methods={methods} onSubmit={onSubmit}>
          <Scrollbar sx={{ maxHeight: { xs: 400, sm: 500, md: 600 } }}>
            <DialogContent sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={1}>
                <Grid xs={12} sm={6} md={6}>
                  <Stack>
                    <Typography variant="body2">사업부</Typography>
                    <Field.Autocomplete
                      options={siteList}
                      name="site"
                      size="small"
                      disabled={isFieldDisabled}
                    />
                  </Stack>
                </Grid>
                <Grid xs={12} sm={6} md={6}>
                  <Stack>
                    <Typography variant="body2">프로젝트</Typography>
                    <Field.Select name="project" size="small" disabled={isFieldDisabled}>
                      {projectList
                        .sort((a, b) => a.projectName.localeCompare(b.projectName))
                        .map((project) => (
                          <MenuItem key={project.projectName} value={project.projectName}>
                            {project.projectName}
                          </MenuItem>
                        ))}
                    </Field.Select>
                  </Stack>
                </Grid>
              </Grid>
              <Typography variant="body2">CAS</Typography>
              <Field.Text name="md" size="small" type="number" disabled={isFieldDisabled} />
              <Grid container spacing={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                  <Grid xs={12} sm={6} md={6}>
                    <Stack>
                      <Typography variant="body2">시작일</Typography>
                      <Field.MobileDateTimePicker
                        name="eventStartDate"
                        format="YYYY-MM-DD HH:mm"
                        ampm={false}
                        viewRenderers={{
                          hours: renderMultiSectionDigitalClockTimeView,
                          minutes: renderMultiSectionDigitalClockTimeView,
                        }}
                        slotProps={{
                          textField: { size: 'small' },
                          dialog: {
                            sx: {
                              '.MuiPickersLayout-contentWrapper': { width: '100%' }, // 전체 너비 조정
                              '.MuiPickersLayout-actionBar': { justifyContent: 'center' }, // 버튼 중앙 정렬
                              '.MuiMultiSectionDigitalClock-root': {
                                minWidth: { xs: 320, sm: 320 },
                              }, // 디지털 시계의 최소 너비 설정
                              '.MuiList-root': {
                                width: '100%',
                                '& .MuiButtonBase-root': { width: 'calc(100% - 8px)' },
                              },
                            },
                          },
                        }}
                        minutesStep={1}
                        disabled={isFieldDisabled}
                      />
                    </Stack>
                  </Grid>
                  <Grid xs={12} sm={6} md={6}>
                    <Stack>
                      <Typography variant="body2">종료일</Typography>
                      <Field.MobileDateTimePicker
                        name="eventEndDate"
                        format="YYYY-MM-DD HH:mm"
                        ampm={false}
                        viewRenderers={{
                          hours: renderMultiSectionDigitalClockTimeView,
                          minutes: renderMultiSectionDigitalClockTimeView,
                        }}
                        slotProps={{
                          textField: { size: 'small' },
                          dialog: {
                            sx: {
                              '.MuiPickersLayout-contentWrapper': { width: '100%' }, // 전체 너비 조정
                              '.MuiPickersLayout-actionBar': { justifyContent: 'center' }, // 버튼 중앙 정렬
                              '.MuiMultiSectionDigitalClock-root': {
                                minWidth: { xs: 320, sm: 320 },
                              }, // 디지털 시계의 최소 너비 설정
                              '.MuiList-root': {
                                width: '100%',
                                '& .MuiButtonBase-root': { width: 'calc(100% - 8px)' },
                              },
                            },
                          },
                        }}
                        disabled={isFieldDisabled}
                      />
                    </Stack>
                  </Grid>
                </LocalizationProvider>
              </Grid>
              <Typography variant="body2">내용</Typography>
              <Field.Text
                name="content"
                multiline
                rows={8}
                size="small"
                disabled={isFieldDisabled}
              />
            </DialogContent>
          </Scrollbar>
          <DialogActions sx={{ flexShrink: 0, justifyContent: 'space-between' }}>
            <Box flex={1}>
              {!!item && (
                <IconButton disabled={isFieldDisabled} color="error" onClick={deleteConfirm.onTrue}>
                  <Iconify icon="eva:trash-2-fill" />
                </IconButton>
              )}
            </Box>
            <Stack direction="row" spacing={1} flex={2} justifyContent="center">
              <Button
                onClick={() => {
                  reset(methods.formState.defaultValues);
                }}
                disabled={isFieldDisabled}
              >
                초기화
              </Button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                variant="soft"
                color="primary"
                disabled={isSubmitting || isFieldDisabled}
              >
                저장
              </LoadingButton>
            </Stack>
            <Box flex={1} />
          </DialogActions>
        </Form>
      </Dialog>
      <ConfirmDialog
        open={deleteConfirm.value}
        title="티켓 삭제"
        onClose={deleteConfirm.onFalse}
        content={
          <>
            <Typography variant="subtitle2">
              {values.project}({dayjs(values.eventStartDate).format('YYYY-MM-DD HH:mm:ss')}~
              {dayjs(values.eventEndDate).format('YYYY-MM-DD HH:mm:ss')})
            </Typography>
            <Typography variant="body2">티켓을 삭제하시겠습니까?</Typography>
          </>
        }
        action={
          <Button variant="soft" color="error" onClick={deleteTicket}>
            삭제
          </Button>
        }
      />
    </>
  );
}
