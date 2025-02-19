import type FullCalendar from '@fullcalendar/react';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import type { EventDropArg, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import type { ICalendarView, ICalendarRange, ICalendarEvent } from 'src/types/calendar';

import { useRef, useState, useCallback } from 'react';

import { useResponsive } from 'src/hooks/use-responsive';

import { makeDateString } from 'src/utils/format-date';

// ----------------------------------------------------------------------

export function useCalendar() {
  const calendarRef = useRef<FullCalendar>(null);

  const calendarEl = calendarRef.current;

  const smUp = useResponsive('up', 'sm');

  const [date, setDate] = useState(new Date());

  const [openForm, setOpenForm] = useState(false);
  const [openVacationForm, setOpenVacationForm] = useState(false);

  const [selectVacationId, setSelectVacationId] = useState<string>('');

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState<ICalendarRange>(null);

  const [view, setView] = useState<ICalendarView>(smUp ? 'dayGridMonth' : 'timeGridDay');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onOpenVacationForm = useCallback(() => {
    setOpenVacationForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onCloseVacationForm = useCallback(() => {
    setOpenVacationForm(false);
  }, []);

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = smUp ? 'dayGridMonth' : 'timeGridDay';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);

  const onChangeView = useCallback(
    (newView: ICalendarView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback(
    (arg: DateSelectArg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }

      onOpenForm();
      if (arg.allDay) {
        const endDate = new Date(arg.end);
        endDate.setDate(endDate.getDate() - 1);
        setSelectedRange({ start: arg.startStr, end: makeDateString(endDate, 2) });
      } else {
        setSelectedRange({ start: arg.startStr, end: arg.endStr });
      }
    },
    [calendarEl, onOpenForm]
  );

  const onClickEvent = useCallback(
    (arg: EventClickArg) => {
      const { event } = arg;

      if (event.extendedProps.no === 0) {
        return;
      }
      if (event.title !== '휴가') {
        onOpenForm();
        setSelectEventId(event.extendedProps.no);
      } else {
        onOpenVacationForm();
        setSelectVacationId(event.extendedProps.no);
      }
    },
    [onOpenForm, onOpenVacationForm]
  );

  const onResizeEvent = useCallback(
    async (
      arg: EventResizeDoneArg,
      userName: string,
      updateEvent: (userName: string, eventData: Partial<ICalendarEvent>) => void,
      refreshEvents: () => void
    ) => {
      const { event } = arg;

      if (event.start && event.end) {
        await updateEvent(userName, {
          id: event.extendedProps.no,
          start: makeDateString(event.start, 7),
          end: makeDateString(event.end, 7),
        });
        refreshEvents();
      }
    },
    []
  );

  const onDropEvent = useCallback(
    async (
      arg: EventDropArg,
      userName: string,
      updateEvent: (userName: string, eventData: Partial<ICalendarEvent>) => void,
      refreshEvents: () => void
    ) => {
      const { event } = arg;
      if (event.start && event.end) {
        await updateEvent(userName, {
          id: event.extendedProps.no,
          start: makeDateString(event.start, 7),
          end: makeDateString(event.end, 7),
        });
        refreshEvents();
      }
    },
    []
  );

  const onClickEventInFilters = useCallback(
    (eventId: string) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    openVacationForm,
    onOpenForm,
    onOpenVacationForm,
    onCloseForm,
    onCloseVacationForm,
    //
    selectEventId,
    selectVacationId,
    setSelectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  };
}
