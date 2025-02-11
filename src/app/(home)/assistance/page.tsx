import { CONFIG } from 'src/config-global';

import { AssistanceView } from 'src/sections/assistance/assistance-view';

export const metadata = { title: `Assistance - ${CONFIG.appName}` };

export default function Page() {
  return <AssistanceView />;
}
