import type { IAIChatMessage } from 'src/types/chat';

import { Scrollbar } from 'src/components/scrollbar';
import { Lightbox, useLightBox } from 'src/components/lightbox';

import { ChatMessageItem } from './chat-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';

// ----------------------------------------------------------------------

type Props = {
  messages: IAIChatMessage[];
};

export function ChatMessageList({ messages = [] }: Props) {
  const { messagesEndRef } = useMessagesScroll(messages);

  const slides = messages.map((message) => ({ src: message.text }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, pt: 5, pb: 3, flex: '1 1 auto' }}>
        {messages.map((message, index) => (
          <ChatMessageItem key={index} message={message} />
        ))}
      </Scrollbar>

      <Lightbox
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        index={lightbox.selected}
      />
    </>
  );
}
