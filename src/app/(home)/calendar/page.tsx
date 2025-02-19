import { CONFIG } from 'src/config-global';

import { CalendarView } from 'src/sections/calendar/calendar-view';

export const metadata = { title: `Calendar - ${CONFIG.appName}` };

export default function Page() {
  return <CalendarView />;
}
