'use client';

import { motion } from 'framer-motion';

const SoftGlow = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* The core light source */}
      <motion.div
        className="w-1.5 h-1.5 bg-amber-500/60 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* The expanding 'Vibe' wave */}
      <motion.div
        className="absolute w-12 h-12 border border-amber-900/20 rounded-full"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [1, 2.5],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </div>
  );
};

export const MatchScreen = ({ onCancel }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-16"
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}
    >
      <div className="text-center space-y-6">
        <motion.h2
          className="text-4xl md:text-5xl font-extralight tracking-[0.25em] text-neutral-200 italic"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          Listening<span className="text-amber-800/50">...</span>
        </motion.h2>
        
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600">
            Scanning the frequency
          </p>
          <p className="text-[9px] italic tracking-widest text-amber-900/60 font-light">
            Wait for the counter-party to arrive
          </p>
        </div>
      </div>

      {/* The Ambient Visualizer */}
      <div className="py-8">
        <SoftGlow />
      </div>

      {/* The "Step back out" button */}
      <motion.button
        onClick={onCancel}
        className="group relative flex flex-col items-center"
        whileHover="hover"
      >
        <span className="text-[10px] tracking-[0.5em] uppercase text-neutral-700 group-hover:text-amber-800/80 transition-colors duration-500">
          Cancel Search
        </span>
        <motion.div 
          className="w-0 h-[1px] bg-amber-900/30 mt-2" 
          variants={{
            hover: { w: '100%', transition: { duration: 0.5 } }
          }}
        />
      </motion.button>
    </motion.div>
  );
};