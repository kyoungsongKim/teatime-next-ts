import { CONFIG } from 'src/config-global';

// import { OverviewAppView } from 'src/sections/overview/app/view';
import { DashboardView } from 'src/sections/dashboard/dashboard-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DashboardView />;
}
