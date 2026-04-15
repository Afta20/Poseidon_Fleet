"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Ship, Anchor, MapPin } from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'PENDING', icon: <Clock size={14} /> },
  { key: 'APPROVED', label: 'CONFIRMED', icon: <Anchor size={14} /> },
  { key: 'IN_TRANSIT', label: 'SAILING', icon: <Ship size={14} /> },
  { key: 'ARRIVED', label: 'ARRIVED', icon: <MapPin size={14} /> },
];

const statusToStep: Record<string, number> = {
  PENDING: 1,
  APPROVED: 2,
  IN_TRANSIT: 3,
  ARRIVED: 4,
  REJECTED: 0,
};

export const TrackingProgress: React.FC<{ status: string }> = ({ status }) => {
  const currentStep = statusToStep[status] || 0;
  const progressPercent = (Math.max(1, currentStep) / 4) * 100;
  const isComplete = currentStep >= 4;

  return (
    <div className="relative pt-8 pb-2">
      {/* Background line */}
      <div className="absolute top-[52px] left-[5%] w-[90%] h-1 bg-white/10 rounded-full overflow-hidden" />

      {/* Animated fill line */}
      <motion.div
        className="absolute top-[52px] left-[5%] h-1 rounded-full overflow-hidden"
        initial={{ width: '0%' }}
        animate={{ width: `${(progressPercent / 100) * 90}%` }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
      >
        {/* Base gradient fill */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-400 to-primary" />

        {/* Flowing dashes animation — the "running" effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 8px,
              rgba(255,255,255,0.4) 8px,
              rgba(255,255,255,0.4) 16px
            )`,
            backgroundSize: '24px 100%',
          }}
          animate={{ backgroundPositionX: ['0px', '-48px'] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Shimmer sweep effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ width: '40%' }}
          animate={{ left: ['-40%', '140%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 1,
          }}
        />
      </motion.div>

      {/* Glow under the line */}
      <motion.div
        className="absolute top-[50px] left-[5%] h-2 bg-primary/40 rounded-full blur-sm"
        initial={{ width: '0%' }}
        animate={{ width: `${(progressPercent / 100) * 90}%` }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
      />

      {/* Moving dot on the leading edge */}
      {!isComplete && currentStep > 0 && (
        <motion.div
          className="absolute top-[49px] w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(168,85,247,0.8),0_0_20px_rgba(168,85,247,0.4)]"
          initial={{ left: '5%' }}
          animate={{ left: `${5 + (progressPercent / 100) * 90}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        >
          {/* Ping animation on dot */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.div>
      )}

      {/* Steps */}
      <div className="relative flex justify-between w-[90%] mx-auto z-10">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum <= currentStep;
          const isActive = stepNum === currentStep;

          return (
            <motion.div
              key={step.key}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.15 }}
            >
              {/* Circle */}
              <motion.div
                className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center
                  ${isCompleted
                    ? 'bg-primary border-primary text-white'
                    : 'bg-[#121217] border-zinc-600 text-zinc-500'
                  }`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                  delay: 0.4 + idx * 0.2,
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, delay: 0.6 + idx * 0.2 }}
                  >
                    <CheckCircle2 size={18} />
                  </motion.div>
                ) : (
                  step.icon
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{
                      scale: [1, 1.8, 1.8],
                      opacity: [0.8, 0, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}

                {/* Active glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-[-4px] rounded-full bg-primary/20 blur-md"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                className={`mt-3 text-[10px] font-mono font-bold tracking-widest
                  ${isCompleted ? 'text-primary' : isActive ? 'text-white' : 'text-zinc-600'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + idx * 0.15 }}
              >
                {step.label}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
