'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatWindow = ({ messages, userId, onSendMessage, onDisconnect }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <motion.div
      className="flex flex-col h-screen max-h-screen bg-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
    >
      {/* Discreet Header */}
      <div className="border-b border-white/5 px-8 py-6 flex justify-between items-end">
        <div>
          <h2 className="text-amber-500/80 font-extralight text-xs tracking-[0.3em] uppercase">
            Established Connection
          </h2>
          <p className="text-[10px] text-neutral-600 mt-1 tracking-widest uppercase">
            Presence: Anonymous Stranger
          </p>
        </div>
        <button
          onClick={onDisconnect}
          className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 hover:text-red-900/80 transition-colors duration-500 border-b border-transparent hover:border-red-900/40 pb-1"
        >
          Leave Room
        </button>
      </div>

      {/* Messages: Styled as a clean transcript rather than bubbles */}
      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-10 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              className="h-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
            >
              <p className="text-neutral-500 font-light italic tracking-widest text-sm">
                The silence is waiting...
              </p>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                className={`flex flex-col ${msg.sender === userId ? 'items-end text-right' : 'items-start text-left'}`}
                initial={{ opacity: 0, x: msg.sender === userId ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 mb-2">
                  {msg.sender === userId ? 'You' : 'Stranger'}
                </span>
                
                <div className={`max-w-[80%] md:max-w-md ${
                  msg.sender === userId 
                    ? 'text-neutral-100 font-light' 
                    : 'text-amber-100/80 font-light'
                }`}>
                  <p className="text-base md:text-lg leading-relaxed tracking-wide">
                    {msg.text}
                  </p>
                </div>
                
                <span className="text-[8px] tracking-widest text-neutral-700 mt-2">
                  {msg.timestamp}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input: Integrated into the bottom layout seamlessly */}
      <div className="px-8 py-10">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Share a thought..."
            className="w-full bg-transparent border-b border-white/10 py-4 pr-20 text-lg font-extralight text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-amber-900/50 transition-all duration-700 tracking-wide"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-0 bottom-4 text-[10px] uppercase tracking-[0.3em] text-amber-700/60 hover:text-amber-500 disabled:opacity-0 transition-all duration-500 italic"
          >
            Send
          </button>
        </form>
        <div className="mt-4 text-[9px] tracking-[0.2em] text-neutral-800 uppercase text-center">
          Encrypted & Ephemeral
        </div>
      </div>
    </motion.div>
  );
};