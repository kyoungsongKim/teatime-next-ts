import type { TextFieldProps } from '@mui/material/TextField';
import type { AutocompleteProps } from '@mui/material/Autocomplete';

import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// ----------------------------------------------------------------------

export type AutocompleteBaseProps = Omit<
  AutocompleteProps<any, boolean, boolean, boolean>,
  'renderInput'
>;

export type RHFAutocompleteProps = AutocompleteBaseProps & {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: React.ReactNode;
  variant?: TextFieldProps['variant'];
};

export function RHFAutocomplete({
  name,
  label,
  variant,
  helperText,
  placeholder,
  ...other
}: RHFAutocompleteProps) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          id={`rhf-autocomplete-${name}`}
          onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
          renderInput={(params) => {
            const errorMessage = Array.isArray(error)
              ? error.find((e) => !!e)?.message // 첫 번째 `null`이 아닌 메시지 찾기
              : error?.message;

            return (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                variant={variant}
                error={!!error}
                helperText={error ? errorMessage : helperText}
                inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
              />
            );
          }}
          {...other}
        />
      )}
    />
  );
}
