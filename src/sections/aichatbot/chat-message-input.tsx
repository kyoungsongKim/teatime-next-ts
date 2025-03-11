import type { IAIChatMessage } from 'src/types/chat';

import { useRef, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { useUser } from 'src/auth/context/user-context';

type Props = {
  disabled: boolean;
  onNewMessage: (message: IAIChatMessage) => void;
};

export function ChatMessageInput({ disabled, onNewMessage }: Props) {
  const { userInfo } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [onNewMessage]);

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter' || !message) return;
      try {
        event.preventDefault();
        if (!message.trim()) return;
        const sendInfo: IAIChatMessage = {
          senderId: userInfo?.id,
          senderName: userInfo?.realName,
          avatarUrl: userInfo?.userDetails?.avatarImg,
          text: message,
        };

        onNewMessage(sendInfo);
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setMessage('');
      }
    },
    [message, onNewMessage, userInfo?.id, userInfo?.realName, userInfo?.userDetails?.avatarImg]
  );

  return (
    <>
      <InputBase
        inputProps={{ ref: inputRef }}
        name="chat-message"
        id="chat-message-input"
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder="Type a message..."
        disabled={disabled}
        startAdornment={<IconButton />}
        endAdornment={<Stack direction="row" />}
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
