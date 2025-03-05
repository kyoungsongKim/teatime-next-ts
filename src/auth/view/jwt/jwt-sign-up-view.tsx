'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { getTeamList } from 'src/actions/team-ssr';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { signUp } from '../../context/jwt';
import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { SignUpTerms } from '../../components/sign-up-terms';

import type { ITeamItem } from '../../../types/team';

// ----------------------------------------------------------------------

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod.object({
  userId: zod.string().min(1, { message: 'userId is required!' }),
  realName: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  cellphone: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  teamName: zod.string().min(1, { message: 'TeamName is required!' }),
  dailyReportList: zod.array(zod.string().email({ message: 'Invalid email format!' })).optional(),
  vacationReportList: zod
    .array(zod.string().email({ message: 'Invalid email format!' }))
    .optional(),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(4, { message: 'Password must be at least 4 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const { checkUserSession } = useAuthContext();

  const router = useRouter();

  const password = useBoolean();

  const [errorMsg, setErrorMsg] = useState('');

  const [teamList, setTeamList] = useState<ITeamItem[]>([]);

  const defaultValues = {
    userId: '',
    realName: '',
    email: '',
    cellphone: '',
    teamName: 'saram',
    dailyReportList: [],
    vacationReportList: [],
    password: '',
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // @ts-ignore
      const reportEmail = data.dailyReportList.length > 0 ? data.dailyReportList.join(',') : '';
      const vacationReportList =
        // @ts-ignore
        data.vacationReportList.length > 0 ? data.vacationReportList.join(',') : '';

      await signUp({
        id: data.userId,
        name: data.realName,
        email: data.email,
        phone: data.cellphone,
        team: data.teamName,
        reportEmail,
        vacationReportList,
        password: data.password,
      });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.msg);
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await getTeamList();
        setTeamList(response.data);
      } catch (error) {
        console.error('팀 리스트 불러오기 실패', error);
      }
    })();
  }, []);

  const renderForm = (
    <Box gap={3} display="flex" flexDirection="column">
      <Field.Text name="userId" label="ID" />
      <Field.Text name="realName" label="이름" />
      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={password.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Field.Text name="email" label="Email" />
      <Field.Phone name="cellphone" label="전화 번호" country="KR" />
      <Field.Select
        native
        name="teamName"
        label="팀 이름"
        InputLabelProps={{ shrink: true }}
        onChange={(event) => setValue('teamName', event.target.value)}
      >
        {teamList.map((team) => (
          <option key={team.teamName} value={team.teamName}>
            {team.teamDescription}
          </option>
        ))}
      </Field.Select>
      <Field.Autocomplete
        name="dailyReportList"
        label="일일 리포트 Email"
        multiple
        freeSolo
        disableCloseOnSelect
        options={[]}
        getOptionLabel={(option) => option}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {option}
          </li>
        )}
        renderTags={(selected, getDailyReportProps) =>
          selected.map((option, index) => (
            <Chip
              {...getDailyReportProps({ index })}
              key={option}
              label={option}
              size="small"
              color="primary"
              variant="soft"
            />
          ))
        }
      />
      <Field.Autocomplete
        name="vacationReportList"
        label="휴가 리포트 Email"
        multiple
        freeSolo
        disableCloseOnSelect
        options={[]}
        getOptionLabel={(option) => option}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {option}
          </li>
        )}
        renderTags={(selected, getVacationReportProps) =>
          selected.map((option, index) => (
            <Chip
              {...getVacationReportProps({ index })}
              key={option}
              label={option}
              size="small"
              color="primary"
              variant="soft"
            />
          ))
        }
      />
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Create account..."
      >
        Create account
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Get started absolutely free"
        description={
          <>
            {`Already have an account? `}
            <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
              Get started
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      <SignUpTerms />
    </>
  );
}
