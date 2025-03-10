'use client';

import { useRef, useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';

import { Layout } from '../layout';
import { ChatRoom } from '../chat-room';
import { ChatMessageInput } from '../chat-message-input';

const chatBotUrl = process.env.NEXT_PUBLIC_AI_CHAT_BOT;

export function AiChatBotView() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const botResponseRef = useRef('');

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const readStream = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder('utf-8');

    const processChunk = async () => {
      const { done, value } = await reader.read();
      if (done) return;

      const chunk = decoder.decode(value, { stream: true });
      botResponseRef.current += chunk;

      requestAnimationFrame(() => {
        setMessages((prev) => [
          ...prev.slice(0, prev.length - 1), // 기존 마지막 bot 메시지 제거
          { sender: 'bot', text: botResponseRef.current }, // 업데이트된 bot 메시지 추가
        ]);
      });

      await processChunk();
    };

    await processChunk();
  };

  const handleSendMessage = async ({ sender, text }: { sender: string; text: string }) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender, text }]);
    setLoading(true);

    try {
      const response = await fetch(chatBotUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ text }),
      });

      const reader = response.body?.getReader();
      if (reader) {
        botResponseRef.current = '';
        setMessages((prev) => [...prev, { sender: 'bot', text: '' }]); // 새로운 bot 메시지 추가
        await readStream(reader);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error: Unable to connect to AI' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [messages]);

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        AI Chat Bot
      </Typography>
      <Layout
        sx={{
          minHeight: 0,
          flex: '1 1 0',
          borderRadius: 2,
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.card,
        }}
        slots={{
          main: (
            <>
              {messages.length === 0 ? (
                <EmptyContent
                  imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-chat-active.svg`}
                  title="Good morning!"
                  description="Write something awesome..."
                />
              ) : (
                <ChatRoom messages={messages} loading={loading} />
              )}
              <ChatMessageInput
                disabled={loading}
                onNewMessage={handleSendMessage}
                inputRef={inputRef}
              />
            </>
          ),
        }}
      />
    </DashboardContent>
  );
}
