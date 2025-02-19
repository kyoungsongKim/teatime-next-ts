import { z as zod } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import type { IUser } from '../../types/agreement';
// ----------------------------------------------------------------------

export type UpdateUserSchemaType = zod.infer<typeof UpdateUserSchema>;

export const UpdateUserSchema = zod.object({
  realName: zod.string().min(1, { message: 'Name is required!' }),
  position: zod.string().min(1, { message: 'Position is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  avatarImg: schemaHelper.file({ message: { required_error: 'Avatar is required!' } }),
  cellphone: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  description: zod.string().min(1, { message: 'About is required!' }),
  teamName: zod.string().min(1, { message: 'About is required!' }),
  userName: zod.string().min(1, { message: 'About is required!' }),
  birthDate: zod.string().min(1, { message: 'About is required!' }),
  cbankAccount: zod.string().min(1, { message: 'About is required!' }),
  cbankId: zod.string().min(1, { message: 'About is required!' }),
  educationLevel: zod.string().min(1, { message: 'About is required!' }),
  skillLevel: zod.string().min(1, { message: 'About is required!' }),
});

type Props = {
  userInfo: IUser | null;
};

export function AccountGeneral({ userInfo }: Props) {
  const methods = useForm<UpdateUserSchemaType>({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      description: '',
      position: '',
      realName: '',
      teamName: '',
      userName: '',
      address: '',
      birthDate: '',
      avatarImg: '',
      cbankAccount: '',
      cbankId: '',
      cellphone: '',
      educationLevel: '',
      email: '',
      skillLevel: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // 🔹 userInfo가 변경될 때 `reset`으로 값 업데이트
  useEffect(() => {
    if (userInfo) {
      reset({
        description: userInfo.description ?? '',
        position: userInfo.position ?? '',
        realName: userInfo.realName ?? '',
        teamName: userInfo.teamName ?? '',
        userName: userInfo.userName ?? '',
        address: userInfo.userDetails?.address ?? '',
        birthDate: userInfo.userDetails?.birthDate ?? '',
        avatarImg: userInfo.userDetails?.avatarImg ?? '',
        cbankAccount: userInfo.userDetails?.cbankAccount ?? '',
        cbankId: userInfo.userDetails?.cbankId ?? '',
        cellphone: userInfo.userDetails?.cellphone ?? '',
        educationLevel: userInfo.userDetails?.educationLevel ?? '',
        email: userInfo.userDetails?.email ?? '',
        skillLevel: userInfo.userDetails?.skillLevel ?? '',
      });
    }
  }, [userInfo, reset]); // userInfo 변경 시 업데이트

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
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
              <Field.Text name="realName" label="Name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone name="cellphone" label="Phone number" country="KR" />
              <Field.Text name="address" label="Address" />

              <Field.CountrySelect name="country" label="Country" placeholder="Choose a country" />

              <Field.Text name="state" label="State/region" />
              <Field.Text name="city" label="City" />
              <Field.Text name="zipCode" label="Zip/code" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Field.Text name="description" multiline rows={4} label="About" />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
