import { CONFIG } from 'src/config-global';

import { NotificationsView } from 'src/sections/notification/view';

export const metadata = { title: `Notification Settings - ${CONFIG.appName}` };

export default function Page() {
  return <NotificationsView />;
}
