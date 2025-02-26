import SvgIcon from '@mui/material/SvgIcon';

import { Iconify } from 'src/components/iconify';

import { paths } from '../routes/paths';

// ----------------------------------------------------------------------

export const _account = [
  {
    label: 'Home',
    href: '/',
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'Profile',
    href: paths.root.user.root,
    icon: (
      <SvgIcon>
        <path
          opacity="0.5"
          d="M2.28099 19.6575C2.36966 20.5161 2.93261 21.1957 3.77688 21.3755C5.1095 21.6592 7.6216 22 12 22C16.3784 22 18.8905 21.6592 20.2232 21.3755C21.0674 21.1957 21.6303 20.5161 21.719 19.6575C21.8505 18.3844 22 16.0469 22 12C22 7.95305 21.8505 5.6156 21.719 4.34251C21.6303 3.48389 21.0674 2.80424 20.2231 2.62451C18.8905 2.34081 16.3784 2 12 2C7.6216 2 5.1095 2.34081 3.77688 2.62451C2.93261 2.80424 2.36966 3.48389 2.28099 4.34251C2.14952 5.6156 2 7.95305 2 12C2 16.0469 2.14952 18.3844 2.28099 19.6575Z"
          fill="currentColor"
        />
        <path
          d="M13.9382 13.8559C15.263 13.1583 16.1663 11.7679 16.1663 10.1666C16.1663 7.8655 14.3008 6 11.9996 6C9.69841 6 7.83291 7.8655 7.83291 10.1666C7.83291 11.768 8.73626 13.1584 10.0612 13.856C8.28691 14.532 6.93216 16.1092 6.51251 18.0529C6.45446 18.3219 6.60246 18.5981 6.87341 18.6471C7.84581 18.8231 9.45616 19 12.0006 19C14.545 19 16.1554 18.8231 17.1278 18.6471C17.3977 18.5983 17.5454 18.3231 17.4876 18.0551C17.0685 16.1103 15.7133 14.5321 13.9382 13.8559Z"
          fill="currentColor"
        />
      </SvgIcon>
    ),
  },
  // {
  //   label: 'Projects',
  //   href: '#',
  //   icon: <Iconify icon="solar:notes-bold-duotone" />,
  //   info: '3',
  // },
  // {
  //   label: 'Subscription',
  //   href: '#',
  //   icon: (
  //     <SvgIcon>
  //       <path
  //         opacity="0.5"
  //         fillRule="evenodd"
  //         clipRule="evenodd"
  //         d="M17.7556 2.30079C17.3519 2.11371 17.1172 2.08917 17.0632 2.08595C15.766 2.03476 14.1085 2 11.999 2C7.72437 2 5.30557 2.14276 3.97974 2.27571C3.04019 2.36993 2.36895 3.04117 2.27473 3.98072C2.14178 5.30655 1.99902 7.72535 1.99902 12C1.99902 16.6448 2.16757 19.604 2.30894 21.2694C2.37429 22.039 3.24545 22.378 3.83887 21.8834L5.49902 20.5L6.86612 21.8671C7.22642 22.2274 7.80002 22.2592 8.19792 21.9408L9.99902 20.5L11.2919 21.7929C11.6824 22.1834 12.3156 22.1834 12.7061 21.7929L13.999 20.5L15.8001 21.9408C16.198 22.2592 16.7716 22.2274 17.1319 21.8671L18.499 20.5L20.1592 21.8834C20.7526 22.378 21.6238 22.039 21.6891 21.2694C21.8305 19.604 21.999 16.6448 21.999 12C21.999 9.87288 21.9637 8.20528 21.9118 6.90321C21.4743 6.95701 20.8561 7.00045 20 7.00045C19.3705 7.00045 18.8696 6.97695 18.4746 6.94315C17.6146 6.8695 17.0559 6.21195 17.0228 5.3494C17.0092 4.99245 17 4.54875 17 4.00045C17 3.11398 17.0239 2.50092 17.0522 2.08594C17.0522 2.08594 17.2925 2.08635 17.7556 2.30079ZM11.6589 15.2672C12.2031 15.2672 12.5962 15.1752 12.8381 14.9912C13.0901 14.8072 13.2161 14.5817 13.2161 14.3149C13.2161 14.0757 13.1203 13.8825 12.9288 13.7352C12.7373 13.588 12.4501 13.4592 12.0671 13.3488L11.2355 13.1004C10.8223 12.9807 10.4493 12.8519 10.1167 12.7139C9.78412 12.5759 9.50192 12.4103 9.27007 12.217C9.03827 12.0238 8.85682 11.7938 8.72582 11.527C8.59477 11.2601 8.52927 10.9427 8.52927 10.5746C8.52927 9.94895 8.74092 9.4291 9.16427 9.01505C9.58757 8.601 10.1923 8.32495 10.9785 8.18695V7.7944C10.9785 7.3862 11.2613 7.0214 11.6691 7.00345C11.7215 7.00115 11.7736 7 11.8252 7C12.1981 7 12.4652 7.0598 12.6265 7.1794C12.7978 7.29905 12.8835 7.51525 12.8835 7.8281V8.13175C13.5285 8.19615 14.0527 8.33875 14.4558 8.5596C14.859 8.7712 15.0606 9.05185 15.0606 9.4015C15.0606 9.55725 15.0194 9.70145 14.9481 9.8323C14.7585 10.1803 14.2851 10.1546 13.9096 10.0279C13.8023 9.99165 13.687 9.9577 13.5638 9.92595C13.1808 9.81555 12.7625 9.76035 12.309 9.76035C11.805 9.76035 11.427 9.83855 11.1751 9.995C10.9331 10.1422 10.8122 10.3354 10.8122 10.5746C10.8122 10.7679 10.8928 10.9243 11.0541 11.0439C11.2254 11.1635 11.4825 11.2739 11.8252 11.3751L12.6718 11.6098C13.5789 11.8674 14.2744 12.2078 14.7582 12.6311C15.2521 13.0543 15.499 13.6248 15.499 14.3425C15.499 14.9774 15.2773 15.5157 14.8338 15.9573C14.3903 16.3898 13.7402 16.6796 12.8835 16.8268V17.2056C12.8835 17.6138 12.6007 17.9786 12.1929 17.9965C12.1405 17.9988 12.0884 18 12.0368 18C11.6639 18 11.3918 17.9402 11.2204 17.8206C11.0591 17.7009 10.9785 17.4847 10.9785 17.1719V16.8958C10.2427 16.8222 9.64302 16.6612 9.17937 16.4128C8.72582 16.1551 8.49902 15.8331 8.49902 15.4466C8.49902 15.2209 8.58567 15.0249 8.72467 14.8601C8.97352 14.5651 9.41662 14.6382 9.75947 14.8155C9.90572 14.8911 10.0651 14.9634 10.2377 15.0326C10.6509 15.189 11.1247 15.2672 11.6589 15.2672Z"
  //         fill="currentColor"
  //       />
  //       <path
  //         d="M21.9128 6.9031C21.4752 6.95695 20.8567 7.00045 20 7.00045C19.3705 7.00045 18.8696 6.97695 18.4746 6.94315C17.6146 6.8695 17.0559 6.21195 17.0228 5.3494C17.0092 4.99245 17 4.54875 17 4.00045C17 3.11398 17.0239 2.50092 17.0522 2.08594C17.0522 2.08594 18.0872 2.08772 20 4.00045C21.9128 5.9132 21.9128 6.9031 21.9128 6.9031Z"
  //         fill="currentColor"
  //       />
  //       <path
  //         d="M11.6599 15.2672C12.2041 15.2672 12.5972 15.1752 12.8391 14.9912C13.091 14.8072 13.217 14.5817 13.217 14.3149C13.217 14.0757 13.1213 13.8825 12.9298 13.7352C12.7383 13.588 12.4511 13.4592 12.0681 13.3488L11.2365 13.1004C10.8232 12.9807 10.4503 12.8519 10.1177 12.7139C9.7851 12.5759 9.5029 12.4103 9.27105 12.217C9.03925 12.0238 8.8578 11.7938 8.7268 11.527C8.59575 11.2601 8.53025 10.9427 8.53025 10.5746C8.53025 9.94895 8.7419 9.4291 9.16525 9.01505C9.58855 8.601 10.1933 8.32495 10.9795 8.18695V7.7944C10.9795 7.3862 11.2623 7.0214 11.6701 7.00345C11.7225 7.00115 11.7745 7 11.8261 7C12.199 7 12.4662 7.0598 12.6274 7.1794C12.7988 7.29905 12.8844 7.51525 12.8844 7.8281V8.13175C13.5295 8.19615 14.0537 8.33875 14.4568 8.5596C14.86 8.7712 15.0616 9.05185 15.0616 9.4015C15.0616 9.55725 15.0203 9.70145 14.9491 9.8323C14.7594 10.1803 14.2861 10.1546 13.9106 10.0279C13.8032 9.99165 13.688 9.9577 13.5648 9.92595C13.1818 9.81555 12.7635 9.76035 12.3099 9.76035C11.806 9.76035 11.428 9.83855 11.1761 9.995C10.9341 10.1422 10.8132 10.3354 10.8132 10.5746C10.8132 10.7679 10.8938 10.9243 11.0551 11.0439C11.2264 11.1635 11.4834 11.2739 11.8261 11.3751L12.6728 11.6098C13.5799 11.8674 14.2754 12.2078 14.7592 12.6311C15.253 13.0543 15.5 13.6248 15.5 14.3425C15.5 14.9774 15.2783 15.5157 14.8348 15.9573C14.3913 16.3898 13.7412 16.6796 12.8844 16.8268V17.2056C12.8844 17.6138 12.6016 17.9786 12.1938 17.9965C12.1415 17.9988 12.0894 18 12.0378 18C11.6648 18 11.3928 17.9402 11.2214 17.8206C11.0601 17.7009 10.9795 17.4847 10.9795 17.1719V16.8958C10.2437 16.8222 9.644 16.6612 9.18035 16.4128C8.7268 16.1551 8.5 15.8331 8.5 15.4466C8.5 15.2209 8.58665 15.0249 8.72565 14.8601C8.9745 14.5651 9.4176 14.6382 9.76045 14.8155C9.9067 14.8911 10.0661 14.9634 10.2387 15.0326C10.6519 15.189 11.1257 15.2672 11.6599 15.2672Z"
  //         fill="currentColor"
  //       />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   label: 'Security',
  //   href: '#',
  //   icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
  // },
  {
    label: 'Account settings',
    href: paths.root.user.account,
    icon: <Iconify icon="solar:settings-bold-duotone" />,
  },
];
