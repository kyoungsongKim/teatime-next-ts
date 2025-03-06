'use client';

import Calendar from '@fullcalendar/react'; // => request placed at the top
import type { IUserItem } from 'src/types/user';

import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { fDate } from 'src/utils/format-time';

import { getUserList } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetVacation } from 'src/actions/vacation-ssr';
import { useGetEvents, updateEventDate } from 'src/actions/calendar';

import { Iconify } from 'src/components/iconify';

import { CalendarDialog } from 'src/sections/calendar/dialog/calendar-dialog';
import { VacationFormDialog } from 'src/sections/vacation/dialog/vacation-form-dialog';

import { useUser } from 'src/auth/context/user-context';

import { StyledCalendar } from './styles';
import { useCalendar } from './hooks/use-calendar';
import { CalendarToolbar } from './calendar-toolbar';

// ----------------------------------------------------------------------

export function CalendarView() {
  const { userInfo, isAdmin } = useUser();

  const [userName, setUserName] = useState<string>(userInfo?.id || ''); // 사용자 이름 상태
  const [userList, setUserList] = useState<IUserItem[]>([]); // 사용자 리스트 상태

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    openVacationForm,
    onOpenForm,
    onCloseForm,
    onCloseVacationForm,
    //
    selectEventId,
    setSelectEventId,
    selectVacationId,
    selectedRange,
    //
  } = useCalendar();

  const { events, eventsLoading, refreshEvents } = useGetEvents(userName, date);
  const { histories, item } = useGetVacation(selectVacationId, userName, date);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

  useEffect(() => {
    if (isAdmin) {
      getUserList().then((r) => setUserList(r.data));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (userInfo?.id) {
      setUserName(userInfo.id);
    }
  }, [userInfo]);

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
        <Grid container sx={{ mb: { xs: 1, md: 2 } }}>
          <Grid xs={12} sm={6} md={6}>
            {isAdmin && (
              <Grid xs={12} md={12} flexGrow={1}>
                <FormControl size="small" fullWidth>
                  <Autocomplete
                    options={userList} // 사용자 목록
                    getOptionLabel={(option) => `${option.realName} (${option.id})`} // 항목 표시 형식
                    value={userList.find((item1) => item1.id === userName) || null} // 현재 선택된 값
                    onChange={(_, newValue) => {
                      setUserName(newValue?.id || userInfo?.id || '');
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="사용자 선택" variant="outlined" />
                    )}
                  />
                </FormControl>
              </Grid>
            )}
          </Grid>
          <Grid xs={12} sm={6} md={6} textAlign="right">
            <Button
              color="primary"
              variant="soft"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                setSelectEventId('');
                onOpenForm();
              }}
            >
              New ticket
            </Button>
          </Grid>
        </Grid>

        <Card sx={{ ...flexProps, minHeight: '50vh' }}>
          <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
            <CalendarToolbar
              date={fDate(date, 'YYYY MMMM')}
              view={view}
              loading={eventsLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
            />

            <Calendar
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={events}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              aspectRatio={3}
              eventDrop={(arg) => {
                onDropEvent(arg, userName, updateEventDate, refreshEvents);
              }}
              eventResize={(arg) => {
                onResizeEvent(arg, userName, updateEventDate, refreshEvents);
              }}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
            />
          </StyledCalendar>
        </Card>
      </DashboardContent>

      <CalendarDialog
        open={openForm}
        userName={userName}
        item={selectEventId}
        selectedDate={selectedRange}
        onClose={onCloseForm}
        onUpdate={refreshEvents}
      />
      <VacationFormDialog
        history={histories || []}
        item={item}
        user={userName}
        isAdmin={isAdmin || false}
        open={openVacationForm}
        left={50}
        onClose={onCloseVacationForm}
        onUpdate={refreshEvents}
      />
    </>
  );
}
