'use client';

import Calendar from '@fullcalendar/react'; // => request placed at the top
import type { CUserItem } from 'src/types/user';

import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import FormControl from '@mui/material/FormControl';

import { fDate } from 'src/utils/format-time';

import { getUserList } from 'src/actions/user-ssr';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetVacation } from 'src/actions/vacation-ssr';
import { useGetEvents, updateEventDate } from 'src/actions/calendar';

import { Iconify } from 'src/components/iconify';

import { CalendarDialog } from 'src/sections/calendar/dialog/calendar-dialog';
import { VacationFormDialog } from 'src/sections/vacation/dialog/vacation-form-dialog';

import { StyledCalendar } from './styles';
import { useCalendar } from './hooks/use-calendar';
import { CalendarToolbar } from './calendar-toolbar';
import { useUser } from '../../auth/context/user-context';

// ----------------------------------------------------------------------

export function CalendarView() {
  const { userInfo, isAdmin } = useUser();

  const [userName, setUserName] = useState<string>(userInfo?.id || ''); // 사용자 이름 상태
  const [userList, setUserList] = useState<CUserItem[]>([]); // 사용자 리스트 상태

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
        <Grid container sx={{ mb: { xs: 1, md: 2 } }}>
          <Grid xs={12} sm={6} md={6}>
            {isAdmin && (
              <FormControl size="small" sx={{ paddingRight: { xs: 1, sm: 1, md: 1.5 } }}>
                <Select
                  value={userName}
                  onChange={(newValue) => {
                    const targetUser = userList.find(
                      (userItem) => newValue.target.value === userItem.id
                    );
                    setUserName(targetUser?.id ?? (userInfo?.id || ''));
                  }}
                  variant="outlined"
                >
                  {userList.map((userItem) => (
                    <MenuItem key={userItem.id} value={userItem.id}>
                      {`${userItem.realName}(${userItem.id})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
