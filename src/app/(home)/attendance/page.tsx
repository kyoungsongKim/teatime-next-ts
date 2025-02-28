import { CONFIG } from 'src/config-global';

import { AttendanceListView } from 'src/sections/attendance/view/attendance-list-view';

export const metadata = { title: `Agreement - ${CONFIG.appName}` };

export default function Page() {
  return <AttendanceListView />;
}
