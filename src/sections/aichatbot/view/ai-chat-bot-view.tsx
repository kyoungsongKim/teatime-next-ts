'use client';

import type { IAIChatMessage } from 'src/types/chat';

import { useRef, useState } from 'react';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { postAiSupportHistory } from 'src/actions/ai-support-ssr';

import { EmptyContent } from 'src/components/empty-content';

import { ChatMessageList } from 'src/sections/aichatbot/chat-message-list';

import { Layout } from '../layout';
import { ChatMessageInput } from '../chat-message-input';

const chatBotUrl = process.env.NEXT_PUBLIC_AI_CHAT_BOT;

export function AiChatBotView() {
  const botResponseRef = useRef('');

  const [messages, setMessages] = useState<IAIChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendInfo: IAIChatMessage = {
    senderId: 'bot',
    senderName: 'AI Bot',
    avatarUrl: '',
    text: '',
  };

  const readStream = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder('utf-8');

    const processChunk = async () => {
      const { done, value } = await reader.read();
      if (done) return;

      const chunk = decoder.decode(value, { stream: true });
      botResponseRef.current += chunk;

      sendInfo.text = botResponseRef.current;

      requestAnimationFrame(() => {
        setMessages((prev) => [
          ...prev.slice(0, prev.length - 1), // 기존 마지막 bot 메시지 제거
          sendInfo, // 업데이트된 bot 메시지 추가
        ]);
      });

      await processChunk();
    };

    await processChunk();
  };

  const handleSendMessage = async (message: IAIChatMessage) => {
    if (!message.text) return;

    setMessages((prev) => [...prev, message]);
    setLoading(true);

    try {
      const response = await fetch(chatBotUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ user_id: message.senderId, text: message.text }),
      });

      const reader = response.body?.getReader();
      if (reader) {
        botResponseRef.current = '';

        setMessages((prev) => [...prev, sendInfo]); // 새로운 bot 메시지 추가
        await readStream(reader);
      }

      await postAiSupportHistory(message.senderId || 'unknown', message.text, sendInfo.text);
    } catch (error) {
      sendInfo.text = 'Error: Unable to connect to AI';
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [...prev, sendInfo]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
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
                  title="웹사이트 이용 중 불편한 점이 있으면 ‘송송이’에게 말씀해주세요."
                  description="대화 내용은 사이트 개선을 위해 저장·전송될 수 있습니다."
                />
              ) : (
                <ChatMessageList messages={messages ?? []} />
              )}
              <ChatMessageInput disabled={loading} onNewMessage={handleSendMessage} />
            </>
          ),
        }}
      />
    </DashboardContent>
  );
}
