'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

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
      className="flex flex-col h-screen max-h-screen bg-neutral-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-white font-light text-lg tracking-wide">
            Connected
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Chatting with a stranger
          </p>
        </div>
        <motion.button
          onClick={onDisconnect}
          className="px-4 py-2 text-xs text-gray-400 border border-gray-700 hover:border-red-600 hover:text-red-600 transition-colors duration-300 rounded"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Disconnect
        </motion.button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide">
        {messages.length === 0 ? (
          <motion.div
            className="h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-600 text-sm tracking-wide">
              Say hello to start the conversation
            </p>
          </motion.div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.sender === userId
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm font-light leading-relaxed break-words">
                  {msg.text}
                </p>
                <p className="text-xs opacity-60 mt-1 mt-2">
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-800 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/50 transition-all duration-300"
          />
          <motion.button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};
