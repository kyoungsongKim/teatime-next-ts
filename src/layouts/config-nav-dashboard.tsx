import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  faq: icon('ic-blog'),
  attendance: icon('ic-attendance'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   *
   */
  {
    subheader: '',
    items: [
      {
        title: 'Dashboard',
        path: paths.root.dashboard,
        icon: ICONS.dashboard,
        roles: ['USER', 'USER_VIP', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'Calendar',
        path: paths.root.calendar,
        icon: ICONS.calendar,
        roles: ['USER', 'USER_VIP', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'Attendance',
        path: paths.root.attendance,
        icon: ICONS.attendance,
        roles: ['USER', 'USER_VIP', 'USER_SILVER', 'USER_GOLD', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'Agreement',
        path: paths.root.agreement.root,
        icon: ICONS.file,
        roles: ['USER', 'USER_VIP', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'Assistance',
        path: paths.root.assistance,
        icon: ICONS.job,
        roles: ['USER', 'USER_VIP', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'Vacation',
        path: paths.root.vacation,
        icon: ICONS.booking,
        roles: ['USER', 'USER_GOLD', 'USER_VIP', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'My Point',
        path: paths.root.point.root,
        icon: ICONS.invoice,
        roles: ['USER_BASIC', 'USER_SILVER', 'USER_GOLD', 'USER_VIP', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'FAQ',
        path: paths.root.faq,
        icon: ICONS.faq,
        roles: ['USER', 'USER_VIP', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        title: 'Profile',
        path: paths.dashboard.user.root,
        icon: ICONS.user,
      },
    ],
  },
];
