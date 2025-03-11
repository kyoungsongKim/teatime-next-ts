import type { IAIChatMessage } from 'src/types/chat';

import { useRef, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { useUser } from 'src/auth/context/user-context';

type Props = {
  disabled: boolean;
  onNewMessage: (message: IAIChatMessage) => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

export function ChatMessageInput({ disabled, onNewMessage, inputRef }: Props) {
  const { userInfo } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!message.trim()) return;
      const sendInfo: IAIChatMessage = {
        senderId: userInfo?.id,
        senderName: userInfo?.realName,
        avatarUrl: userInfo?.userDetails?.avatarImg,
        text: message,
      };

      onNewMessage(sendInfo);
      setMessage('');
    }
  };

  return (
    <>
      <InputBase
        name="chat-message"
        id="chat-message-input"
        inputRef={inputRef}
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder="Type a message..."
        disabled={disabled}
        startAdornment={
          <IconButton>
            <Iconify icon="eva:smiling-face-fill" />
          </IconButton>
        }
        endAdornment={
          <Stack direction="row">
            <IconButton onClick={handleAttach}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>
            <IconButton onClick={handleAttach}>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
            <IconButton>
              <Iconify icon="solar:microphone-bold" />
            </IconButton>
          </Stack>
        }
        sx={{
          px: 1,
          height: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      />
      <input type="file" ref={fileRef} style={{ display: 'none' }} />
    </>
  );
}
