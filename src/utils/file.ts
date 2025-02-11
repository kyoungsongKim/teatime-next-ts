import { toast } from 'sonner';

import { getFileItem } from 'src/actions/file-ssr';

export const download = async (fileId: number, originalName: string) => {
  try {
    await getFileItem(fileId).then((r) => {
      if (r.status === 200) {
        const url = window.URL.createObjectURL(r.data);
        const filename = originalName;
        if (!filename) {
          toast.error('파일 이름이 없습니다.');
          return;
        }
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);

        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        toast.error('파일 다운로드에 실패했습니다.');
      }
    });
  } catch (e) {
    toast.error('파일 다운로드에 실패했습니다.');
    console.error(e);
  }
};
