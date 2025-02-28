import { CONFIG } from 'src/config-global';

import { AgreementListView } from 'src/sections/agreement/view';

export const metadata = { title: `Agreement - ${CONFIG.appName}` };

export default function Page() {
  return <AgreementListView />;
}
