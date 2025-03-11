import type { IAIChatMessage } from 'src/types/chat';

import { useRef, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseMessagesScrollReturn = {
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

export function useMessagesScroll(messages: IAIChatMessage[]): UseMessagesScrollReturn {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (!messages) {
      return;
    }

    if (!messagesEndRef.current) {
      return;
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(
    () => {
      scrollToBottom();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages]
  );

  return { messagesEndRef };
}
