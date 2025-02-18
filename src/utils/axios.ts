import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/login',
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  statistics: {
    sales: '/api/statistics/sales',
  },
  user: {
    root: '/api/user',
    list: '/api/users',
  },
  monthlySales: {
    current: '/api/monthly-sales/current',
  },
  point: {
    list: '/api/point/list',
    code: '/api/point/pointCode', // post -> donate, get -> make
    month: '/api/point/month',
    summary: '/api/point/summary',
  },
  exp: {
    levelup: '/api/exp/levelup',
    levelupall: '/api/exp/levelupall',
  },
  vacation: {
    root: '/api/vacation',
    all: '/api/vacation/all',
  },
  faqs: {
    root: '/api/faqs',
  },
  agreement: {
    root: '/api/agreement',
    info: '/api/agreement/info',
    history: '/api/agreement/history',
  },
  userNavigationHistory: {
    root: '/api/navigation-history',
  },
  assistance: {
    root: '/api/assistance',
    apply: {
      root: '/api/assistance/apply',
    },
    group: {
      root: '/api/assistance/group',
    },
  },
  file: {
    root: '/api/file',
  },
  service: {
    root: '/api/service',
  },
};
