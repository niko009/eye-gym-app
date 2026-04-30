import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Flame, Clock, Award, Settings, BarChart3, Zap, Coffee, Activity, Sparkles } from 'lucide-react';
import { COMPLEXES } from '../data';
import { Complex, UserStats, UserSettings } from '../types';
import { useTelegram } from '../hooks/useTelegram';

interface Props {
  stats: UserStats;
  settings: UserSettings;
  onSelectComplex: (complex: Complex) => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

const getComplexIcon = (id: string) => {
  switch (id) {
    case 'quick-start': return <Zap size={18} />;
    case 'work-break': return <Coffee size={18} />;
    case 'full-recovery': return <Activity size={18} />;
    case 'tension-relief': return <Sparkles size={18} />;
    default: return <BarChart3 size={18} />;
  }
};

const getComplexColor = (id: string) => {
  switch (id) {
    case 'quick-start': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'work-break': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'full-recovery': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'tension-relief': return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  }
};

const translations = {
  ru: {
    hello: (name: string) => `Привет, ${name}!`,
    defaultTitle: 'Упражнения для глаз',
    tagline: 'Здоровье Ваших Глаз',
    streak: 'Дней',
    min: 'Мин.',
    sessions: 'Сессий',
    workouts: 'Тренировки',
    available: (count: number) => `${count} Доступно`,
    minShort: 'Мин',
    exShort: 'Упр.',
  },
  ro: {
    hello: (name: string) => `Salut, ${name}!`,
    defaultTitle: 'Exerciții pentru ochi',
    tagline: 'Sănătatea ochilor tăi',
    streak: 'Zile',
    min: 'Min.',
    sessions: 'Sesiuni',
    workouts: 'Antrenamente',
    available: (count: number) => `${count} Disponibile`,
    minShort: 'Min',
    exShort: 'Ex.',
  }
};

export default function Dashboard({ stats, settings, onSelectComplex, onOpenStats, onOpenSettings }: Props) {
  const { hapticFeedback, user } = useTelegram();
  const t = translations[settings.language || 'ru'] || translations.ru;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--tg-theme-bg-color, #f0fdf4)' }}>
      {/* Header */}
      <header className="bg-white px-6 pt-safe pb-8 rounded-b-[40px] shadow-sm border-b border-emerald-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-emerald-900 tracking-tight leading-none">
                {user?.first_name ? t.hello(user.first_name) : t.defaultTitle}
              </h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">{t.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { hapticFeedback(); onOpenSettings(); }}
              className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-emerald-50 p-4 rounded-3xl flex flex-col items-center shadow-sm">
            <Flame className="text-orange-500 mb-1" size={20} />
            <span className="text-xl font-black text-slate-900 leading-none">{stats.streak}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{t.streak}</span>
          </div>
          <div className="bg-white border border-emerald-50 p-4 rounded-3xl flex flex-col items-center shadow-sm">
            <Clock className="text-emerald-500 mb-1" size={20} />
            <span className="text-xl font-black text-slate-900 leading-none">{stats.totalTimeMinutes}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{t.min}</span>
          </div>
          <div className="bg-white border border-emerald-50 p-4 rounded-3xl flex flex-col items-center shadow-sm">
            <Award className="text-blue-500 mb-1" size={20} />
            <span className="text-xl font-black text-slate-900 leading-none">{stats.completedWorkouts}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{t.sessions}</span>
          </div>
        </div>
      </header>

      {/* Complexes List */}
      <main className="px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{t.workouts}</h2>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.available(COMPLEXES.length)}</span>
        </div>

        <div className="space-y-4">
          {COMPLEXES.map((complex) => (
            <motion.div
              key={complex.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { hapticFeedback(); onSelectComplex(complex); }}
              className="group bg-white p-5 rounded-[28px] shadow-sm border border-emerald-50 flex items-start gap-4 cursor-pointer hover:border-emerald-200 transition-all"
            >
              <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center border ${getComplexColor(complex.id)} shadow-sm`}>
                {getComplexIcon(complex.id)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="text-lg font-bold text-slate-800 leading-tight">
                     {settings.language === 'ro' ? complex.nameRo : complex.name}
                   </h3>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1">
                  {settings.language === 'ro' ? complex.descriptionRo : complex.description}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Clock size={12} /> {complex.durationTotal} {t.minShort}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    < Award size={12} /> {complex.exercises.length} {t.exShort}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500 flex-shrink-0 self-center">
                <Play size={16} fill="currentColor" strokeWidth={0} />
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
