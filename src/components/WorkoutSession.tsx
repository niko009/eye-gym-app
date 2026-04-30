import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, X, CheckCircle2 } from 'lucide-react';
import { Complex, Exercise } from '../types';
import { EXERCISES } from '../data';
import { speak, getSettings, saveStats, getStats, updateStreak } from '../utils';
import ExerciseAnimation from './ExerciseAnimation';
import { useTelegram } from '../hooks/useTelegram';

interface Props {
  complex: Complex;
  onClose: (completed: boolean) => void;
}

export default function WorkoutSession({ complex, onClose }: Props) {
  const { hapticFeedback, tg } = useTelegram();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  useEffect(() => {
    if (tg?.BackButton) {
      tg.BackButton.show();
      const handleBack = () => onClose(false);
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [tg, onClose]);

  const settings = getSettings();
  const currentExerciseId = complex.exercises[currentIndex];
  const currentExercise = EXERCISES.find(e => e.id === currentExerciseId)!;

  const nextStep = useCallback(() => {
    if (isResting) {
      // Finished rest, go to next exercise
      if (currentIndex < complex.exercises.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsResting(false);
        setTimeLeft(30);
      } else {
        setIsFinished(true);
      }
    } else {
      // Finished exercise, go to rest (unless it was the last one)
      if (currentIndex < complex.exercises.length - 1) {
        setIsResting(true);
        setTimeLeft(10);
      } else {
        setIsFinished(true);
      }
    }
  }, [currentIndex, isResting, complex.exercises.length]);

  useEffect(() => {
    if (isPaused || isFinished) return;

    if (timeLeft <= 0) {
      nextStep();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, isFinished, nextStep]);

  // Voice handle
  useEffect(() => {
    if (isFinished) {
      if (settings.voiceEnabled) speak('Тренировка завершена. Отличная работа!');
      return;
    }

    if (isResting) {
      if (settings.voiceEnabled) speak('Перерыв десять секунд.');
    } else {
      if (settings.voiceEnabled) {
        speak(`${currentExercise.name}. ${currentExercise.instruction}`);
      }
    }
  }, [currentIndex, isResting, isFinished, settings.voiceEnabled, currentExercise.name, currentExercise.instruction]);

  const handleFinish = () => {
    // Update stats
    const stats = getStats();
    stats.completedWorkouts += 1;
    stats.totalTimeMinutes += complex.durationTotal;
    stats.complexCounts[complex.id] = (stats.complexCounts[complex.id] || 0) + 1;
    
    // Most popular complex
    let maxCount = 0;
    let popularId = stats.popularComplexId;
    for (const id in stats.complexCounts) {
      if (stats.complexCounts[id] > maxCount) {
        maxCount = stats.complexCounts[id];
        popularId = id;
      }
    }
    stats.popularComplexId = popularId;

    const updatedStats = updateStreak(stats);
    saveStats(updatedStats);
    
    onClose(true);
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-100 p-6 rounded-full text-green-600 mb-6"
        >
          <CheckCircle2 size={80} />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">Отлично!</h2>
        <p className="text-gray-600 mb-8">Вы закончили тренировку «{complex.name}».</p>
        <button
          onClick={handleFinish}
          className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2 z-10">
        <button onClick={() => onClose(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1">Упражнение {currentIndex + 1} из {complex.exercises.length}</span>
          <h1 className="text-xl font-black text-slate-800 leading-tight">
            {isResting ? 'Перерыв' : currentExercise.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
           <div className={`w-2 h-2 rounded-full ${settings.voiceEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
           <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">{settings.voiceEnabled ? 'Голос ВКЛ' : 'Без звука'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-56 h-56 bg-blue-50 rounded-[60px] flex items-center justify-center border-4 border-blue-100 shadow-inner">
                <span className="text-8xl font-black text-blue-600 tabular-nums tracking-tighter">{timeLeft}</span>
              </div>
              <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-xs">Приготовьтесь к следующему...</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center w-full"
            >
              <div className="p-4 bg-emerald-50 rounded-[60px] border-4 border-emerald-100 shadow-sm">
                <ExerciseAnimation type={currentExercise.animationType} />
              </div>
              
              <div className="mt-10 text-center px-4">
                <div className="text-8xl font-black text-slate-800 mb-2 font-sans tracking-tighter tabular-nums leading-none">
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
                <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                  {currentExercise.instruction}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar (Overall Session) */}
      <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden mb-8 max-w-xs border border-slate-100">
        <motion.div 
           className="bg-emerald-500 h-full"
           initial={{ width: 0 }}
           animate={{ width: `${((currentIndex) / complex.exercises.length) * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-center gap-4 mt-4 pb-8 z-10">
        <button
          onClick={() => { hapticFeedback(); setIsPaused(!isPaused); }}
          className="flex-1 py-4 bg-slate-100 rounded-2xl text-slate-600 font-black tracking-widest hover:bg-slate-200 transition-all uppercase text-sm"
        >
          {isPaused ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}
        </button>
        
        <button
          onClick={() => { hapticFeedback(); nextStep(); }}
          className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black tracking-widest shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-100 transition-all uppercase text-sm"
        >
          {isResting ? 'НАЧАТЬ' : 'ПРОПУСТИТЬ'}
        </button>
      </div>
    </div>
  );
}
