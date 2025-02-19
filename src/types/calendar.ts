import type { IDatePickerControl } from './common';

// ----------------------------------------------------------------------

export type ICalendarFilters = {
  colors: string[];
  startDate: IDatePickerControl;
  endDate: IDatePickerControl;
};

export type ICalendarDate = string;

export type ICalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

export type ICalendarRange = { start: ICalendarDate; end: ICalendarDate } | null;

export type ICalendarEvent = {
  id: string;
  color: string;
  title: string;
  allDay: boolean;
  description: string;
  end: ICalendarDate;
  start: ICalendarDate;
};

export type CalendarItem = {
  id: number;
  teamName: string;
  userName: string;
  title: string;
  site: string;
  project: string;
  md: string;
  eventStartDate: string;
  eventEndDate: string;
  content: string;
};

export type CalendarEvent = {
  no: number;
  color: string;
  className: string;
  description: string | null;
  start: string;
  end: string;
  title: string;
};

export type ProjectItem = {
  projectName: string;
  bgColor: string;
  startDate: string;
  endDate: string;
  site: string;
};
