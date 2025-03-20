import { useForm, Controller } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';

import { AccountNotificationsTable } from 'src/sections/account/account-notifications-table';

import { useUser } from 'src/auth/context/user-context';

// ----------------------------------------------------------------------

const NOTIFICATIONS = [
  {
    subheader: 'Activity',
    caption: 'Donec mi odio, faucibus at, scelerisque quis',
    items: [
      { id: 'activity_comments', label: 'Email me when someone comments onmy article' },
      { id: 'activity_answers', label: 'Email me when someone answers on my form' },
      { id: 'activityFollows', label: 'Email me hen someone follows me' },
    ],
  },
];

// ----------------------------------------------------------------------

export function AccountNotifications() {
  const { userInfo, isAdmin } = useUser();

  const methods = useForm({
    defaultValues: { selected: ['activity_comments', 'application_product'] },
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const getSelected = (selectedItems: string[], item: string) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={12}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
            {NOTIFICATIONS.map((notification) => (
              <Grid key={notification.subheader} container spacing={3}>
                <Grid xs={12} md={4}>
                  <ListItemText
                    primary={notification.subheader}
                    secondary={notification.caption}
                    primaryTypographyProps={{ typography: 'h6', mb: 0.5 }}
                    secondaryTypographyProps={{ component: 'span' }}
                  />
                </Grid>

                <Grid xs={12} md={8}>
                  <Stack spacing={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Controller
                      name="selected"
                      control={control}
                      render={({ field }) => (
                        <>
                          {notification.items.map((item) => (
                            <FormControlLabel
                              key={item.id}
                              label={item.label}
                              labelPlacement="start"
                              control={
                                <Switch
                                  checked={field.value.includes(item.id)}
                                  onChange={() =>
                                    field.onChange(getSelected(values.selected, item.id))
                                  }
                                />
                              }
                              sx={{ m: 0, width: 1, justifyContent: 'space-between' }}
                            />
                          ))}
                        </>
                      )}
                    />
                  </Stack>
                </Grid>
              </Grid>
            ))}

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              sx={{ ml: 'auto' }}
            >
              Save changes
            </LoadingButton>
          </Card>
        </Form>
      </Grid>
      <Grid xs={12} md={12}>
        {isAdmin && <AccountNotificationsTable userInfo={userInfo || null} isAdmin={isAdmin} />}
      </Grid>
    </Grid>
  );
}
