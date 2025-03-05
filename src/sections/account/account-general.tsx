import type { ITeamItem } from 'src/types/team';
import type { IUser } from 'src/types/agreement';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';
import { makeDateString } from 'src/utils/format-date';

import { getTeamList } from 'src/actions/team-ssr';
import { updateUserDetail } from 'src/actions/user-ssr';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useUser } from 'src/auth/context/user-context';

// ----------------------------------------------------------------------

export type UpdateUserSchemaType = zod.infer<typeof UpdateUserSchema>;

export const UpdateUserSchema = zod.object({
  userId: zod.string(),
  avatarImg: schemaHelper.file().optional(),
  realName: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  cellphone: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  position: zod.string().min(1, { message: 'Position is required!' }),
  teamName: zod.string().min(1, { message: 'TeamName is required!' }),
  birthDate: zod.string().optional(),
  cbankAccount: zod.string().optional(),
  educationLevel: zod.string().optional(),
  skillLevel: zod.string().optional(),
  dailyReportList: zod.array(zod.string().email({ message: 'Invalid email format!' })).optional(),
  vacationReportList: zod
    .array(zod.string().email({ message: 'Invalid email format!' }))
    .optional(),
  description: zod.string().optional(),
});

type Props = {
  userInfo: IUser | null;
};

export function AccountGeneral({ userInfo }: Props) {
  const { refreshUserInfo } = useUser();
  const [teamList, setTeamList] = useState<ITeamItem[]>([]);

  const methods = useForm<UpdateUserSchemaType>({
    mode: 'onBlur',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      userId: userInfo?.id ?? '',
      avatarImg: '',
      realName: '',
      email: '',
      cellphone: '',
      address: '',
      position: '',
      teamName: '',
      birthDate: '',
      cbankAccount: '',
      educationLevel: '',
      skillLevel: '',
      dailyReportList: [],
      vacationReportList: [],
      description: '',
    },
  });

  const { reset, handleSubmit, setValue, formState } = methods;

  useEffect(() => {
    if (userInfo) {
      reset({
        userId: userInfo.id,
        avatarImg: userInfo.userDetails?.avatarImg ?? '',
        realName: userInfo.realName ?? '',
        email: userInfo.userDetails?.email ?? '',
        cellphone: userInfo.userDetails?.cellphone ?? '',
        address: userInfo.userDetails?.address ?? '',
        position: userInfo.position ?? '',
        teamName: userInfo.teamName ?? '',
        birthDate: userInfo.userDetails?.birthDate ?? '',
        cbankAccount: userInfo.userDetails?.cbankAccount ?? '',
        educationLevel: userInfo.userDetails?.educationLevel ?? '',
        skillLevel: userInfo.userDetails?.skillLevel ?? '',
        dailyReportList: userInfo.userDetails?.dailyReportList
          ? userInfo.userDetails.dailyReportList.split(',')
          : [],
        vacationReportList: userInfo.userDetails?.dailyReportList
          ? userInfo.userDetails.vacationReportList.split(',')
          : [],
        description: userInfo.description ?? '',
      });

      setValue(
        'dailyReportList',
        userInfo.userDetails?.dailyReportList ? userInfo.userDetails.dailyReportList.split(',') : []
      );
      setValue(
        'vacationReportList',
        userInfo.userDetails?.vacationReportList
          ? userInfo.userDetails.vacationReportList.split(',')
          : []
      );
    }
  }, [userInfo, reset, setValue]);

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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string); // "data:image/png;base64,..." 형식
      reader.onerror = (error) => reject(error);
    });

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.avatarImg instanceof File) {
        data.avatarImg = await fileToBase64(data.avatarImg);
      }

      if (data.birthDate) {
        data.birthDate = makeDateString(new Date(data.birthDate), 2);
      }

      // @ts-ignore
      data.dailyReportList = data.dailyReportList.length > 0 ? data.dailyReportList.join(',') : '';
      // @ts-ignore
      data.vacationReportList =
        // @ts-ignore
        data.vacationReportList.length > 0 ? data.vacationReportList.join(',') : '';
      data.userId = userInfo?.id as string;

      const response = await updateUserDetail(data);

      if (response.status === 200) {
        toast.success('사용자 정보 수정이 완료되었습니다.');
        await refreshUserInfo();
      } else {
        toast.error('사용자 정보 수정이 실패했습니다.');
      }
    } catch (error) {
      toast.error('사용자 정보 수정이 실패했습니다.');
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <Field.UploadAvatar
              name="avatarImg"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
            <IconButton
              onClick={() => setValue('avatarImg', null)}
              sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 15,
                height: 15,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            >
              <Field.Text name="realName" label="이름" />
              <Field.Text name="email" label="Email" />
              <Field.Phone name="cellphone" label="전화 번호" country="KR" />
              <Field.Text name="address" label="주소" />
              <Field.Text name="position" label="직위" />
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
              <Field.DatePicker name="birthDate" label="생년월일" format="YYYY-MM-DD" />
              <Field.Text name="cbankAccount" label="CBank 커플 계좌번호" />
              <Field.Text name="educationLevel" label="최종학력" />
              <Field.Text name="skillLevel" label="보유 기술" />
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
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Field.Text name="description" multiline rows={4} label="About" />
              <LoadingButton type="submit" variant="contained" loading={formState.isSubmitting}>
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
