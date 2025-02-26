import dayjs from 'dayjs';
import { z as zod } from 'zod';

// ----------------------------------------------------------------------

type InputProps = {
  message?: {
    required_error?: string;
    invalid_type_error?: string;
  };
  minFiles?: number;
  isValidPhoneNumber?: (text: string) => boolean;
};

export const schemaHelper = {
  /**
   * Phone number
   * defaultValue === ''
   */
  phoneNumber: (props?: InputProps) =>
    zod
      .string({
        required_error: props?.message?.required_error ?? 'Phone number is required!',
        invalid_type_error: props?.message?.invalid_type_error ?? 'Invalid phone number!',
      })
      .min(1, {
        message: props?.message?.required_error ?? 'Phone number is required!',
      })
      .refine((data) => props?.isValidPhoneNumber?.(data), {
        message: props?.message?.invalid_type_error ?? 'Invalid phone number!',
      }),
  /**
   * Date
   * defaultValue === null
   */
  date: (props?: InputProps) =>
    zod.coerce
      .date()
      .nullable()
      .transform((dateString, ctx) => {
        const date = dayjs(dateString).format();

        const stringToDate = zod.string().pipe(zod.coerce.date());

        if (!dateString) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: props?.message?.required_error ?? 'Date is required!',
          });
          return null;
        }

        if (!stringToDate.safeParse(date).success) {
          ctx.addIssue({
            code: zod.ZodIssueCode.invalid_date,
            message: props?.message?.invalid_type_error ?? 'Invalid Date!!',
          });
        }

        return date;
      })
      .pipe(zod.union([zod.number(), zod.string(), zod.date(), zod.null()])),
  /**
   * Editor
   * defaultValue === '' | <p></p>
   */
  editor: (props?: InputProps) =>
    zod.string().min(8, { message: props?.message?.required_error ?? 'Editor is required!' }),
  /**
   * Object
   * defaultValue === null
   */
  objectOrNull: <T>(props?: InputProps) =>
    zod.custom<T | null>().refine((data) => data !== null && data !== '', {
      message: props?.message?.required_error ?? 'Field is required!',
    }),
  /**
   * Boolean
   * defaultValue === false
   */
  boolean: (props?: InputProps) =>
    zod.coerce.boolean().refine((bool) => bool === true, {
      message: props?.message?.required_error ?? 'Switch is required!',
    }),
  /**
   * File
   * defaultValue === '' || null
   */
  file: (props?: InputProps) =>
    zod.custom<File | string | null>().transform((data, ctx) => {
      const hasFile = data instanceof File || (typeof data === 'string' && !!data.length);

      if (!hasFile && props?.message?.required_error) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props.message.required_error,
        });
        return null;
      }

      return data;
    }),
  /**
   * Files
   * defaultValue === []
   */
  files: (props?: InputProps) =>
    zod.array(zod.custom<File | string>()).transform((data, ctx) => {
      const minFiles = props?.minFiles ?? 2;

      if (!data.length) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message?.required_error ?? 'Files is required!',
        });
      } else if (data.length < minFiles) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: `Must have at least ${minFiles} items!`,
        });
      }

      return data;
    }),
};
