'use client';

import { useSocket } from '@/hooks/useSocket';
import { DiscoveryButton } from '@/components/DiscoveryButton';
import { MatchScreen } from '@/components/MatchScreen';
import { ChatWindow } from '@/components/ChatWindow';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const { state, messages, userId, startSearch, sendMessage, stopSearch } =
    useSocket();

  return (
    <div className="w-full h-screen bg-neutral-950 text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {state === 'IDLE' && (
          <div
            key="idle"
            className="h-full flex flex-col items-center justify-center gap-12"
          >
            <div className="text-center">
              <h1 className="text-5xl font-light tracking-widest mb-3">
                Vibe Check
              </h1>
              <p className="text-gray-500 text-sm tracking-wide">
                Connect with random people and find your vibe
              </p>
            </div>
            <DiscoveryButton onStartSearch={startSearch} />
          </div>
        )}

        {state === 'SEARCHING' && (
          <div key="searching" className="h-full flex items-center justify-center">
            <MatchScreen onCancel={stopSearch} />
          </div>
        )}

        {state === 'CHATTING' && (
          <div key="chatting" className="h-full">
            <ChatWindow
              messages={messages}
              userId={userId}
              onSendMessage={sendMessage}
              onDisconnect={stopSearch}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
