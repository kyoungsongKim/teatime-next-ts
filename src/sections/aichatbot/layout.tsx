import type { StackProps } from '@mui/material/Stack';

import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

type Props = StackProps & {
  slots: {
    main: React.ReactNode;
  };
};

export function Layout({ slots, sx, ...other }: Props) {
  const renderMain = <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>{slots.main}</Stack>;

  return (
    <Stack direction="row" sx={sx} {...other}>
      <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>
        <Stack direction="row" sx={{ flex: '1 1 auto', minHeight: 0 }}>
          {renderMain}
        </Stack>
      </Stack>
    </Stack>
  );
}
