import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';

import { Scrollbar } from 'src/components/scrollbar';
import { useMessagesScroll } from './hooks/use-messages-scroll';

type Props = {
  loading: boolean;
  messages: { sender: string; text: string }[];
};

export function ChatRoom({ messages, loading }: Props) {
  const { messagesEndRef } = useMessagesScroll(messages);

  return (
    <>
      <Stack
        sx={{
          minHeight: 0,
          flex: '1 1 auto',
          width: '100%',
          display: 'flex',
        }}
      >
        <Scrollbar style={{ width: '100%' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                padding: '5px 10px',
              }}
            >
              <div
                style={{
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: msg.sender === 'user' ? '#007BFF' : '#f1f1f1',
                  color: msg.sender === 'user' ? 'white' : 'black',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </Scrollbar>
      </Stack>

      <Drawer
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: '100%' } }}
      >
        <Scrollbar>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                padding: '5px 10px',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: msg.sender === 'user' ? '#007BFF' : '#f1f1f1',
                  color: msg.sender === 'user' ? 'white' : 'black',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </Scrollbar>
      </Drawer>
    </>
  );
}
