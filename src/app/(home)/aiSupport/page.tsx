import { CONFIG } from 'src/config-global';

import { AiChatBotView } from 'src/sections/aichatbot/view';

export const metadata = { title: `AI Support - ${CONFIG.appName}` };

export default function Page() {
  return <AiChatBotView />;
}
