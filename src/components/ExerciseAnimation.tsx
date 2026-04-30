import { motion } from 'motion/react';
import { Exercise } from '../types';

interface Props {
  type: Exercise['animationType'];
}

export default function ExerciseAnimation({ type }: Props) {
  const containerSize = 200;
  const dotSize = 20;
  const center = containerSize / 2;
  const radius = 60;

  const getAnimation = () => {
    switch (type) {
      case 'up-down':
        return {
          y: [center - radius, center + radius, center - radius],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'left-right':
        return {
          x: [center - radius, center + radius, center - radius],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'diagonal-x':
        return {
          x: [center - radius, center + radius, center + radius, center - radius, center - radius],
          y: [center - radius, center + radius, center - radius, center + radius, center - radius],
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        };
      case 'circle':
        return {
          rotate: [0, 360],
          transition: { duration: 4, repeat: Infinity, ease: "linear" }
        };
      case 'blink':
        return {
          scaleY: [1, 0, 1, 0, 1, 0, 1],
          transition: { duration: 2, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1] }
        };
      case 'focus':
        return {
          scale: [0.5, 1.5, 0.5],
          opacity: [0.5, 1, 0.5],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'square':
        return {
          x: [center - radius, center + radius, center + radius, center - radius, center - radius],
          y: [center - radius, center - radius, center + radius, center + radius, center - radius],
          transition: { duration: 6, repeat: Infinity, ease: "linear" }
        };
      case 'snake':
        return {
          x: [center - radius, center - radius / 2, center, center + radius / 2, center + radius, center + radius / 2, center, center - radius / 2, center - radius],
          y: [center, center - 20, center + 20, center - 20, center, center + 20, center - 20, center + 20, center],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'palming':
        return {
          opacity: [0, 0.8, 0],
          scale: [0.8, 1.2, 0.8],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'focus-zoom':
        return {
          scale: [0.2, 2, 0.2],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'cross':
        return {
          x: [center - 40, center, center + 40, center, center - 40],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'blink-squeeze':
        return {
          scaleY: [1, 0, 1, 0, 1, 0, 0, 0, 1],
          transition: { duration: 5, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.4, 0.7, 1] }
        };
      default:
        return {};
    }
  };

  const animation = getAnimation();

  return (
    <div className="relative w-64 h-64 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
      {/* Background Grid/Reference */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 w-full h-px bg-gray-500" />
        <div className="absolute left-1/2 h-full w-px bg-gray-500" />
      </div>

      {type === 'circle' ? (
        <motion.div
           className="w-full h-full flex items-center justify-center relative cursor-pointer"
           animate={{ rotate: 360 }}
           whileHover={{ scale: 1.1 }}
           transition={{ 
             rotate: { duration: 4, repeat: Infinity, ease: "linear" },
             scale: { type: "spring", stiffness: 300, damping: 20 }
           }}
        >
          {/* Orbital path guide */}
          <div 
            className="absolute border border-emerald-100 rounded-full pointer-events-none" 
            style={{ width: radius * 2, height: radius * 2 }}
          />
          {/* Glowing Dot */}
          <motion.div 
            className="bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] border-2 border-white"
            style={{ 
              width: dotSize * 1.5, 
              height: dotSize * 1.5, 
              marginLeft: radius * 2 
            }} 
            whileHover={{
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 15px rgba(16,185,129,0.6)",
                "0 0 25px rgba(16,185,129,0.9)",
                "0 0 15px rgba(16,185,129,0.6)"
              ],
              transition: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }
            }}
          />
        </motion.div>
      ) : type === 'snake' ? (
        <div className="relative w-full h-full">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute bg-emerald-500 rounded-full shadow-md"
              style={{ 
                width: dotSize - (i * 2), 
                height: dotSize - (i * 2), 
                left: 0, 
                top: 0,
                opacity: 1 - (i * 0.15),
                zIndex: 10 - i
              }}
              animate={animation}
              initial={{ x: center - dotSize/2, y: center - dotSize/2 }}
              transition={{
                ...animation.transition,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      ) : type === 'cross' ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            className="absolute bg-emerald-500 rounded-full shadow-lg"
            style={{ width: dotSize, height: dotSize }}
            animate={{ x: [-radius, 0, -radius] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bg-emerald-500 rounded-full shadow-lg"
            style={{ width: dotSize, height: dotSize }}
            animate={{ x: [radius, 0, radius] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      ) : type === 'focus-zoom' ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            className="bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            style={{ width: dotSize, height: dotSize }}
            animate={{ 
              scale: [1, 4, 0.5, 1],
              opacity: [1, 0.4, 1, 1],
              filter: ["blur(0px)", "blur(4px)", "blur(0px)", "blur(0px)"]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      ) : type === 'blink-squeeze' ? (
        <div className="flex flex-col items-center">
          <motion.div
            className="w-32 h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-200 overflow-hidden"
            animate={{
              scaleY: [1, 0, 1, 0, 1, 0, 0, 0, 1],
              backgroundColor: ["#ecfdf5", "#ecfdf5", "#ecfdf5", "#ecfdf5", "#ecfdf5", "#ecfdf5", "#064e3b", "#064e3b", "#ecfdf5"]
            }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.4, 0.7, 1] }}
          >
            <div className="w-12 h-12 bg-emerald-800 rounded-full" />
          </motion.div>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Моргайте и зажмуривайтесь</p>
        </div>
      ) : type === 'palming' ? (
        <div className="flex flex-col items-center">
            <motion.div 
               className="w-48 h-32 bg-slate-900 rounded-lg flex items-center justify-center"
               {...animation}
            >
               <span className="text-white text-4xl">👐</span>
            </motion.div>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Закройте глаза ладонями</p>
        </div>
      ) : (
        <motion.div
          className="absolute bg-emerald-500 rounded-full shadow-lg"
          style={{ width: dotSize, height: dotSize, left: 0, top: 0 }}
          animate={animation}
          initial={{ x: center - dotSize/2, y: center - dotSize/2 }}
        />
      )}

      {/* Decorative Outer Ring */}
      <div className="absolute inset-4 border-2 border-dashed border-emerald-200 rounded-full opacity-30 animate-spin-slow pointer-events-none" />
    </div>
  );
}
