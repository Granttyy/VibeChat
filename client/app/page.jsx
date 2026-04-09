'use client';

import { useSocket } from '@/hooks/useSocket';
import { DiscoveryButton } from '@/components/DiscoveryButton';
import { MatchScreen } from '@/components/MatchScreen';
import { ChatWindow } from '@/components/ChatWindow';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { state, messages, userId, startSearch, sendMessage, stopSearch } = useSocket();

  // A more "viscous" animation—feels like honey or slow smoke
  const transitionSettings = {
    initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -10, filter: 'blur(10px)' },
    transition: { duration: 1, ease: [0.19, 1, 0.22, 1] }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] text-neutral-200 overflow-hidden font-light selection:bg-amber-500/30">
      
      {/* Background: The "Low Light" glow - Warm amber light hitting a dark corner */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_#1c1610_0%,_#050505_100%)] pointer-events-none" />
      
      {/* The Grain: Adds a tactile, paper-like quality to the screen */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      <main className="relative z-10 w-full h-full flex flex-col">
        <AnimatePresence mode="wait">
          
          {state === 'IDLE' && (
            <motion.div
              key="idle"
              {...transitionSettings}
              className="h-full flex flex-col items-center justify-center gap-20 px-8"
            >
              <div className="text-center space-y-8">
                {/* Larger, more commanding but elegant Title */}
                <h1 className="text-6xl md:text-8xl font-extralight tracking-[0.2em] uppercase text-neutral-100 italic drop-shadow-2xl">
                  Vibe<span className="text-amber-600/60 font-thin">Chat</span>
                </h1>
                
                {/* Discreet subtitle: Large enough to read easily, but low contrast */}
                <div className="space-y-2">
                  <p className="text-lg md:text-xl text-neutral-500 tracking-[0.15em] font-light">
                    Anonymity is the ultimate luxury.
                  </p>
                  <p className="text-sm md:text-base text-amber-700/50 tracking-widest uppercase">
                    Establish a connection.
                  </p>
                </div>
              </div>

              {/* The "Enter" Action */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <DiscoveryButton onStartSearch={startSearch} />
              </motion.div>
            </motion.div>
          )}

          {state === 'SEARCHING' && (
            <motion.div 
              key="searching" 
              {...transitionSettings}
              className="h-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <MatchScreen onCancel={stopSearch} />
            </motion.div>
          )}

          {state === 'CHATTING' && (
            <motion.div 
              key="chatting" 
              {...transitionSettings}
              className="h-full w-full max-w-5xl mx-auto flex flex-col pt-12"
            >
              <ChatWindow
                messages={messages}
                userId={userId}
                onSendMessage={sendMessage}
                onDisconnect={stopSearch}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Decorative Corner Element: Adds that 'Branding' feel without being messy */}
      <div className="absolute bottom-8 right-8 text-[10px] tracking-[0.5em] text-neutral-700 uppercase pointer-events-none">
        Est. 2026 — Members Only
      </div>
    </div>
  );
}