'use client';

import { motion } from 'framer-motion';

const PulsingDot = () => {
  return (
    <motion.div
      className="w-3 h-3 bg-cyan-400 rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.8, 0.3, 0.8],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  );
};

export const MatchScreen = ({ onCancel }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <motion.h2
          className="text-3xl font-light tracking-widest text-white mb-4"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Searching for a vibe...
        </motion.h2>
        <p className="text-sm text-gray-500 tracking-wide">
          Waiting for someone awesome to join
        </p>
      </div>

      <div className="flex gap-3">
        <PulsingDot />
        <PulsingDot />
        <PulsingDot />
      </div>

      <motion.button
        onClick={onCancel}
        className="px-6 py-2 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white transition-colors duration-300 rounded-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Cancel
      </motion.button>
    </motion.div>
  );
};
