import type { Theme } from 'src/theme/types';
import type { SxProps } from '@mui/material/styles';
import type { ToggleButtonGroupProps } from '@mui/material';
import type { FormLabelProps } from '@mui/material/FormLabel';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';

import { Controller, useFormContext } from 'react-hook-form';

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import FormHelperText from '@mui/material/FormHelperText';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

type Props = ToggleButtonGroupProps & {
  name: string;
  label?: string;
  helperText?: React.ReactNode;
  slotProps?: {
    wrap?: SxProps<Theme>;
    formLabel: FormLabelProps;
    formHelperText: FormHelperTextProps;
  };
  options: {
    label: string;
    value: string;
  }[];
};

export function RHFToggleButton({ name, label, options, helperText, slotProps, ...other }: Props) {
  const { control } = useFormContext();

  const labelledby = `${name}-toggle-buttons-group-label`;
  const ariaLabel = (val: string) => `Toggle Button ${val}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset" sx={slotProps?.wrap}>
          {label && (
            <FormLabel
              id={labelledby}
              component="legend"
              {...slotProps?.formLabel}
              sx={{ mb: 1, typography: 'body2', ...slotProps?.formLabel.sx }}
            >
              {label}
            </FormLabel>
          )}

          <ToggleButtonGroup {...field} aria-labelledby={labelledby} {...other}>
            {options.map((option, index) => (
              <ToggleButton key={index} value={option.value} aria-label={ariaLabel(option.value)}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {helperText && (
            <FormHelperText
              {...slotProps?.formHelperText}
              sx={{ mt: 1, ...slotProps?.formHelperText.sx }}
            >
              {helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}
