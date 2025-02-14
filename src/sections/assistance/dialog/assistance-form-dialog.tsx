import type { DialogProps } from '@mui/material/Dialog';
import type { ApplyFileItem, AssistanceItem } from 'src/types/assistance';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, Fragment, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { download } from 'src/utils/file';
import { fData } from 'src/utils/format-number';

import { postAssistanceApply } from 'src/actions/assistance';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

type Props = DialogProps & {
  id: string;
  auth: string;
  item?: AssistanceItem;
  editable: boolean;
  onUpdate: () => void;
  onClose: () => void;
};

const FormSchema = zod.object({
  content: zod.string().min(1, { message: '내용을 입력해주세요.' }),
  files: schemaHelper.files({ minFiles: 0 }).optional(),
});

export function AssistanceFormDialog({
  id,
  auth,
  item,
  editable,
  onUpdate,
  onClose,
  ...other
}: Props) {
  const defaultValues = {
    content: !item ? '' : item.form.replaceAll('<br>', '\n'),
    files: [] as File[],
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    if (!item) {
      toast.error('선택된 서비스에 대한 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('content', data.content);
    if (data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    await postAssistanceApply(item.id, formData)
      .then((r) => {
        if (r.status === 201) {
          toast.success('서비스 신청이 완료되었습니다.');
          onUpdate();
          onClose();
          reset(defaultValues);
        } else {
          toast.error('서비스 신청에 실패했습니다.');
        }
      })
      .catch((e) => {
        toast.error('서비스 신청에 실패했습니다.');
        console.error(e);
      });
  });

  const renderDescription = useMemo(() => {
    const str = item?.description.split('<br>') ?? [];
    return str.map((i, index) => (
      <Fragment key={index}>
        {i}
        {index !== str.length && <br />}
      </Fragment>
    ));
  }, [item?.description]);

  const handleRemoveFile = (index: number) => {
    const files = methods.getValues('files');

    methods.setValue(
      'files',
      files.filter((_, i) => i !== index)
    );
  };

  const convertToFiles = (applyFileItems: ApplyFileItem[]): File[] => {
    if (!applyFileItems || applyFileItems.length === 0) return [] as File[];
    return applyFileItems.map((applyFile) => {
      const file = new File([''], applyFile.originalName, {
        type: 'application/octet-stream',
        lastModified: Date.now(),
      });

      Object.defineProperty(file, 'size', {
        value: applyFile.size,
        writable: false,
      });

      return file;
    });
  };

  const downloadFile = async (index: number) => {
    if (!item) {
      toast.error('파일 정보가 없습니다.');
      return;
    }
    const file = item.files[index];
    download(file.id, file.originalName);
  };

  useEffect(() => {
    if (item) {
      reset({
        content: item.form.replaceAll('<br>', '\n'),
        files: convertToFiles(item.files),
      });
    }
  }, [item, reset]);

  return (
    <Dialog {...other} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
          {item?.name}
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <Scrollbar sx={{ maxHeight: 600 }}>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {renderDescription}
            </Typography>
            <Field.Text name="content" multiline rows={8} sx={{ mb: 1 }} disabled={!editable} />
            <Field.UploadBox
              name="files"
              multiple
              disabled={isSubmitting || !editable}
              placeholder={
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={35} />
                  <Typography variant="body2">Upload file</Typography>
                </Box>
              }
              sx={{ width: '100%', p: 1 }}
            />
            {values.files.length > 0 && (
              <>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  파일 목록({values.files.length})
                </Typography>
                <List>
                  <Scrollbar sx={{ maxHeight: 150 }}>
                    {values.files.map((file, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isSubmitting || !editable}
                          >
                            <Iconify icon="eva:close-outline" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={
                            editable ? (
                              file.name
                            ) : (
                              <Link sx={{ cursor: 'pointer' }} onClick={() => downloadFile(index)}>
                                {file.name}
                              </Link>
                            )
                          }
                          secondary={`${fData(file.size)}`}
                        />
                      </ListItem>
                    ))}
                  </Scrollbar>
                </List>
              </>
            )}
          </DialogContent>
        </Scrollbar>
        <DialogActions sx={{ justifyContent: 'center' }}>
          {editable && (
            <LoadingButton
              type="submit"
              variant="soft"
              color="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              신청
            </LoadingButton>
          )}
          {!editable && (
            <Button variant="soft" color="primary" onClick={onClose}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Form>
    </Dialog>
  );
}
