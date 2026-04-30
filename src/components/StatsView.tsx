import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, TrendingUp, History, Star } from 'lucide-react';
import { UserStats, UserSettings } from '../types';
import { COMPLEXES } from '../data';

interface Props {
  stats: UserStats;
  settings: UserSettings;
  onClose: () => void;
}

const translations = {
  ru: {
    title: 'Статистика',
    streak: '🔥 Стрик',
    totalMin: 'Всего мин.',
    popular: 'Популярная программа',
    noData: 'Нет данных. Начните тренировку!',
    timesDone: (count: number) => `Выполнено ${count} раз`,
    achievements: 'Достижения',
    totalSessions: 'Всего сессий',
    avgTime: 'Среднее время',
    minText: 'мин',
    toMain: 'На главную',
  },
  ro: {
    title: 'Statistici',
    streak: '🔥 Zile la rând',
    totalMin: 'Minute în total',
    popular: 'Program Popular',
    noData: 'Nu există date. Începeți antrenamentul!',
    timesDone: (count: number) => `Finalizat de ${count} ori`,
    achievements: 'Realizări',
    totalSessions: 'Total sesiuni',
    avgTime: 'Timp mediu',
    minText: 'min',
    toMain: 'Acasă',
  }
};

export default function StatsView({ stats, settings, onClose }: Props) {
  const t = translations[settings.language || 'ru'] || translations.ru;
  const popularComplex = COMPLEXES.find(c => c.id === stats.popularComplexId);

  return (
    <div className="fixed inset-0 bg-tg-bg z-50 flex flex-col pt-safe px-6">
      <header className="py-6 flex items-center justify-between border-b border-emerald-500/10">
        <h1 className="text-2xl font-black text-tg-text tracking-tight">{t.title}</h1>
        <button onClick={onClose} className="p-3 bg-tg-secondary-bg border border-emerald-500/10 rounded-2xl text-tg-hint hover:text-tg-text transition-colors shadow-sm">
          <X size={24} />
        </button>
      </header>
 
      <main className="flex-1 overflow-y-auto py-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-tg-secondary-bg p-6 rounded-[32px] border border-emerald-500/10 shadow-sm">
            <Trophy className="text-orange-500 mb-2" size={24} />
            <div className="text-3xl font-black text-tg-text">{stats.streak}</div>
            <div className="text-[10px] text-tg-hint font-bold uppercase tracking-widest">{t.streak}</div>
          </div>
          <div className="bg-tg-secondary-bg p-6 rounded-[32px] border border-emerald-500/10 shadow-sm">
            <TrendingUp className="text-emerald-500 mb-2" size={24} />
            <div className="text-3xl font-black text-tg-text">{stats.totalTimeMinutes}</div>
            <div className="text-[10px] text-tg-hint font-bold uppercase tracking-widest">{t.totalMin}</div>
          </div>
        </div>
 
        <section className="mb-8">
           <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Star size={12} /> {t.popular}
           </h2>
           {popularComplex ? (
              <div className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-lg shadow-emerald-500/20">
                <h3 className="text-xl font-bold mb-1">
                  {settings.language === 'ro' ? popularComplex.nameRo : popularComplex.name}
                </h3>
                <p className="text-emerald-50 text-sm mb-4 line-clamp-2">
                  {settings.language === 'ro' ? popularComplex.descriptionRo : popularComplex.description}
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {t.timesDone(stats.complexCounts[popularComplex.id])}
                </div>
              </div>
           ) : (
             <div className="bg-tg-secondary-bg p-8 rounded-[32px] text-center border border-emerald-500/10">
               <p className="text-tg-hint text-sm font-medium">{t.noData}</p>
             </div>
           )}
        </section>
 
        <section>
          <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={12} /> {t.achievements}
          </h2>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-5 bg-tg-secondary-bg border border-emerald-500/10 rounded-3xl shadow-sm">
                <span className="text-sm font-bold text-tg-hint">{t.totalSessions}</span>
                <span className="text-lg font-black text-tg-text">{stats.completedWorkouts}</span>
             </div>
             <div className="flex items-center justify-between p-5 bg-tg-secondary-bg border border-emerald-500/10 rounded-3xl shadow-sm">
                <span className="text-sm font-bold text-tg-hint">{t.avgTime}</span>
                <span className="text-lg font-black text-tg-text">
                   {stats.completedWorkouts > 0 ? Math.round(stats.totalTimeMinutes / stats.completedWorkouts) : 0} {t.minText}
                </span>
             </div>
          </div>
        </section>
      </main>
 
      <div className="py-8">
        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20"
        >
          {t.toMain}
        </button>
      </div>
    </div>
  );
}
