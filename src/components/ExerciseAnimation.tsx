import React from 'react';
import { motion } from 'motion/react';
import type {Exercise, MotionPreference} from '../types';

interface Props {
  type: Exercise['animationType'];
  motionPreference: MotionPreference;
}

const Eye = ({ 
  pupilX = 0, 
  pupilY = 0, 
  scale = 1, 
  blinkProgress = "0%",
  irisScale = 1,
  squeezeProgress = 0,
  animated = true,
  transition = { duration: 2, repeat: Infinity, ease: "easeInOut" }
}: { 
  pupilX?: any, 
  pupilY?: any, 
  scale?: any, 
  blinkProgress?: any,
  irisScale?: any,
  squeezeProgress?: any,
  animated?: boolean,
  transition?: any
}) => {
  return (
    <div className="relative w-28 h-20 bg-white rounded-full border-4 border-emerald-500/20 shadow-xl overflow-hidden flex items-center justify-center">
      {/* Iris and Pupil */}
      <motion.div
        className="w-10 h-10 rounded-full bg-emerald-600 relative flex items-center justify-center shadow-lg border-2 border-emerald-700/20"
        animate={animated ? {x: pupilX, y: pupilY, scale: irisScale} : undefined}
        transition={transition}
      >
        <motion.div 
          className="w-5 h-5 bg-slate-900 rounded-full" 
          animate={animated ? {scale} : undefined}
          transition={transition}
        />
        {/* Iris detail */}
        <div className="absolute inset-0 rounded-full border border-white/20" />
        {/* Reflection */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white/50 rounded-full" />
      </motion.div>
      
      {/* Eyelids */}
      <motion.div 
        className="absolute top-0 left-0 right-0 bg-emerald-500/20 border-b border-emerald-500/20 z-10"
        animate={animated ? {height: blinkProgress} : undefined}
        transition={transition}
      />
      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-emerald-500/20 border-t border-emerald-500/20 z-10"
        animate={animated ? {height: blinkProgress} : undefined}
        transition={transition}
      />
 
      {/* Tight Squeeze Overlay */}
      <motion.div 
        className="absolute inset-0 bg-emerald-900/40 z-20"
        animate={animated ? {opacity: squeezeProgress} : undefined}
        transition={transition}
      />
    </div>
  );
};

export default function ExerciseAnimation({type, motionPreference}: Props) {
  const rangeX = 25;
  const rangeY = 15;

  const getAnimationProps = () => {
    switch (type) {
      case 'up-down':
        return {
          pupilY: [rangeY, -rangeY, rangeY],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'left-right':
        return {
          pupilX: [-rangeX, rangeX, -rangeX],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'diagonal-x':
        return {
          pupilX: [-rangeX, rangeX, rangeX, -rangeX, -rangeX],
          pupilY: [-rangeY, rangeY, -rangeY, rangeY, -rangeY],
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        };
      case 'circle':
      case 'malyshev-circle':
        return {
          pupilX: [-rangeX, 0, rangeX, 0, -rangeX],
          pupilY: [0, -rangeY, 0, rangeY, 0],
          transition: { duration: 4, repeat: Infinity, ease: "linear" }
        };
      case 'blink':
      case 'butterfly':
        return {
          blinkHeight: ["0%", "50%", "0%", "50%", "0%", "50%", "0%"],
          transition: { duration: 3, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 1] }
        };
      case 'focus':
        return {
          scale: [0.6, 1.2, 0.6],
          pupilX: 0,
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'square':
        return {
          pupilX: [-rangeX, rangeX, rangeX, -rangeX, -rangeX],
          pupilY: [-rangeY, -rangeY, rangeY, rangeY, -rangeY],
          transition: { duration: 6, repeat: Infinity, ease: "linear" }
        };
      case 'snake':
        return {
          pupilX: [-rangeX, -rangeX * 0.5, 0, rangeX * 0.5, rangeX, rangeX * 0.5, 0, -rangeX * 0.5, -rangeX],
          pupilY: [0, -rangeY, rangeY, -rangeY, 0, rangeY, -rangeY, rangeY, 0],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'infinity':
        return {
          pupilX: [-rangeX, 0, rangeX, 0, -rangeX, 0, rangeX, 0, -rangeX],
          pupilY: [0, -rangeY, 0, rangeY, 0, rangeY, 0, -rangeY, 0],
          transition: { duration: 6, repeat: Infinity, ease: "linear" }
        };
      case 'nose-writing':
        return {
          pupilX: [-rangeX, -8, 12, rangeX, 5, -rangeX],
          pupilY: [rangeY, -rangeY, 8, -8, rangeY, rangeY],
          transition: { duration: 7, repeat: Infinity, ease: "easeInOut" }
        };
      case 'palming':
        return {
          opacity: [1, 0, 1],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'focus-zoom':
        return {
          irisScale: [0.8, 1.5, 0.8],
          scale: [0.5, 1.3, 0.5],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'cross':
      case 'malyshev-convergence':
        return {
          pupilX: {
            left: [0, rangeX * 0.8, 0],
            right: [0, -rangeX * 0.8, 0]
          },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'malyshev-switches':
        return {
          pupilX: [-rangeX, rangeX, -rangeX, 0, 0, 0],
          pupilY: [0, 0, 0, -rangeY, rangeY, -rangeY],
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        };
      case 'blink-squeeze':
        return {
          blinkHeight: ["0%", "50%", "0%", "50%", "0%", "50%", "50%", "50%", "0%"],
          squeeze: [0, 0, 0, 0, 0, 0, 1, 1, 0],
          transition: { duration: 5, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.4, 0.7, 1] }
        };
      default:
        return {};
    }
  };

  const rawAnimation = getAnimationProps() as any;
  const anim = motionPreference === 'slow' && rawAnimation.transition?.duration
    ? {...rawAnimation, transition: {...rawAnimation.transition, duration: rawAnimation.transition.duration * 1.6}}
    : rawAnimation;
  const animated = motionPreference !== 'off';

  return (
    <div className="relative w-full h-64 flex items-center justify-center gap-6">
      {/* Animation Context for palming */}
      <motion.div 
        className="flex gap-8 items-center justify-center p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10 shadow-inner"
        animate={animated && type === 'palming' ? {opacity: anim.opacity} : undefined}
        transition={type === 'palming' ? anim.transition : {}}
      >
        {/* Left Eye */}
        <Eye 
          animated={animated}
          pupilX={type === 'cross' || type === 'malyshev-convergence' ? anim.pupilX?.left : anim.pupilX}
          pupilY={anim.pupilY}
          scale={anim.scale}
          irisScale={anim.irisScale}
          blinkProgress={anim.blinkHeight}
          squeezeProgress={anim.squeeze}
          transition={anim.transition}
        />
        
        {/* Right Eye */}
        <Eye 
          animated={animated}
          pupilX={type === 'cross' || type === 'malyshev-convergence' ? anim.pupilX?.right : anim.pupilX}
          pupilY={anim.pupilY}
          scale={anim.scale}
          irisScale={anim.irisScale}
          blinkProgress={anim.blinkHeight}
          squeezeProgress={anim.squeeze}
          transition={anim.transition}
        />
      </motion.div>
 
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none overflow-hidden">
         <div className="absolute top-1/2 left-0 w-full h-px bg-emerald-500" />
         <div className="absolute left-1/2 top-0 h-full w-px bg-emerald-500" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-emerald-500 rounded-full" />
      </div>
    </div>
  );
}

