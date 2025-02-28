import { CONFIG } from 'src/config-global';

import { FaqsView } from 'src/sections/faqs/view';

export const metadata = { title: `FAQ - ${CONFIG.appName}` };

export default function Page() {
  return <FaqsView />;
}
