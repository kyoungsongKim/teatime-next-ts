import { CONFIG } from 'src/config-global';

import { AgreementListView } from '../../../sections/agreement/view/agreement-list-view';

export const metadata = { title: `Agreement - ${CONFIG.appName}` };

export default function Page() {
  return <AgreementListView />;
}
