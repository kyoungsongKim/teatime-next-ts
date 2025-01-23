import { CONFIG } from 'src/config-global';

import { PointView } from 'src/sections/point/point-view';

export const metadata = { title: `Point - ${CONFIG.appName}` };

export default function Page() {
  return <PointView />;
}
