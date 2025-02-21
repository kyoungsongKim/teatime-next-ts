'use client';

import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  userId: string;
  password: string;
};

export type SignUpParams = {
  id: string;
  name: string;
  email: string;
  phone: string;
  reportEmail: string;
  vacationReportList: string;
  password: string;
  team: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ userId, password }: SignInParams): Promise<void> => {
  try {
    const params = { userId, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  id,
  name,
  email,
  phone,
  reportEmail,
  vacationReportList,
  password,
  team,
}: SignUpParams): Promise<void> => {
  const params = {
    id,
    name,
    email,
    phone,
    reportEmail,
    vacationReportList,
    password,
    team,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { apiToken } = res.data;

    if (!apiToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(STORAGE_KEY, apiToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
