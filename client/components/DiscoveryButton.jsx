'use client';

import { motion } from 'framer-motion';

export const DiscoveryButton = ({ onStartSearch }) => {
  return (
    <motion.button
      onClick={onStartSearch}
      className="px-8 py-4 text-xl font-light tracking-wider text-white bg-violet-600 hover:bg-violet-700 transition-colors duration-300 rounded-lg shadow-lg hover:shadow-violet-500/50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Find a Vibe
    </motion.button>
  );
};
