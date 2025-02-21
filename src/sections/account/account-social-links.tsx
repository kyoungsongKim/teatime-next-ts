import { useForm } from 'react-hook-form';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Icon } from '@iconify/react';
import React from 'react';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { TwitterIcon, FacebookIcon, LinkedinIcon, InstagramIcon } from 'src/assets/icons';

import type { IUser } from '../../types/agreement';
import { updateUserDetailSocial } from '../../actions/user-ssr';
import { useUser } from '../../auth/context/user-context';

// ----------------------------------------------------------------------

type Props = {
  userInfo: IUser | null;
};

const socialLinks = [
  { key: 'facebookUrl', icon: <FacebookIcon width={24} />, label: 'Facebook' },
  { key: 'instagramUrl', icon: <InstagramIcon width={24} />, label: 'Instagram' },
  { key: 'linkedinUrl', icon: <LinkedinIcon width={24} />, label: 'LinkedIn' },
  {
    key: 'twitterUrl',
    icon: <TwitterIcon width={24} sx={{ color: 'text.primary' }} />,
    label: 'Twitter',
  },
  { key: 'homepageUrl', icon: <Icon icon="mdi:home" width={24} height={24} />, label: 'Homepage' },
];

export function AccountSocialLinks({ userInfo }: Props) {
  const { refreshUserInfo } = useUser();

  const defaultValues = {
    userId: userInfo?.id || '',
    facebookUrl: userInfo?.userDetails?.facebookUrl || '',
    instagramUrl: userInfo?.userDetails?.instagramUrl || '',
    linkedinUrl: userInfo?.userDetails?.linkedinUrl || '',
    twitterUrl: userInfo?.userDetails?.twitterUrl || '',
    homepageUrl: userInfo?.userDetails?.homepageUrl || '',
  };

  const methods = useForm({
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.userId = userInfo?.id || '';
      const response = await updateUserDetailSocial(data);

      if (response.status === 200) {
        await refreshUserInfo();
        toast.success('사용자 소셜 정보 수정이 완료되었습니다.');
      } else {
        toast.error('사용자 소셜 정보 수정이 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      toast.error('사용자 소셜 정보 수정이 실패했습니다.');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        {socialLinks.map(({ key, icon, label }) => (
          <Field.Text
            key={key}
            name={key}
            label={label}
            placeholder={`${label} URL 입력`}
            InputProps={{
              startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
            }}
          />
        ))}

        <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
          Save changes
        </LoadingButton>
      </Card>
    </Form>
  );
}
