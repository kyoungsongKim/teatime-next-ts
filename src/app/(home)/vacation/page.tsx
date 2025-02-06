import { CONFIG } from 'src/config-global';

import { VacationView } from 'src/sections/vacation/vacation-view';

export const metadata = { title: `Vacation - ${CONFIG.appName}` };

export default function Page() {
  return <VacationView />;
}
