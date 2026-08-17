import {useState} from 'react';
import type {ReactNode} from 'react';
import {ArrowLeft, CalendarDays, Clock3, Flame, History, Lock, Medal, Share2, Star, Trophy} from 'lucide-react';
import {COMPLEX_BY_ID, localize} from '../data';
import {calculateGameProgress, getBadgeUnlocks} from '../domain/rewards';
import {getMessages} from '../i18n';
import type {UserSettings, UserStats, WorkoutRecord} from '../types';
import {getLevelName} from './Gamification';

interface Props {records: WorkoutRecord[]; stats: UserStats; settings: UserSettings; onClose: () => void}
type Period = 'days' | 'weeks' | 'months';

export default function StatsView({records, stats, settings, onClose}: Props) {
  const t = getMessages(settings.language);
  const [period, setPeriod] = useState<Period>('days');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const favorite = stats.favoriteComplexId ? COMPLEX_BY_ID.get(stats.favoriteComplexId) : null;
  const chart = buildChart(records, period, settings.language);
  const maximum = Math.max(1, ...chart.map((point) => point.value));
  const gameProgress = calculateGameProgress(records);
  const badgeUnlocks = getBadgeUnlocks(stats);
  const achievements = [
    {name: t.firstSession, unlocked: badgeUnlocks['first-step'], symbol: '🌱', color: 'from-emerald-400 to-teal-600'},
    {name: t.threeDayStreak, unlocked: badgeUnlocks['three-days'], symbol: '🔥', color: 'from-orange-300 to-orange-600'},
    {name: t.halfHour, unlocked: badgeUnlocks['half-hour'], symbol: '⏳', color: 'from-sky-300 to-blue-600'},
    {name: t.explorer, unlocked: badgeUnlocks['three-routes'], symbol: '🧭', color: 'from-amber-300 to-amber-600'},
    {name: t.tenSessions, unlocked: badgeUnlocks['ten-sessions'], symbol: '🏆', color: 'from-violet-300 to-violet-600'},
    {name: t.badgeAllRoutes, unlocked: badgeUnlocks['all-routes'], symbol: '🌈', color: 'from-pink-300 to-rose-500'},
  ];

  const shareProgress = async () => {
    const text = t.shareText(stats.completedWorkouts, Math.round(stats.totalTimeSeconds / 60), stats.currentStreak);
    if (navigator.share) {
      await navigator.share({title: 'Eye Gym', text, url: 'https://eye-gym.bacus.dev/'}).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(`${text} https://eye-gym.bacus.dev/`).catch(() => undefined);
    setShareStatus('copied');
    window.setTimeout(() => setShareStatus('idle'), 2_000);
  };

  return (
    <div className="min-h-[var(--tg-viewport-stable-height,100dvh)] px-5 pb-14 pt-safe sm:px-8">
      <header className="mx-auto flex max-w-4xl items-center gap-4 py-5">
        <button type="button" aria-label={t.backHome} onClick={onClose} className="interactive-icon"><ArrowLeft size={21} /></button>
        <div><p className="eyebrow">Eye Gym</p><h1 className="text-2xl font-black tracking-tight">{t.statsTitle}</h1></div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Flame />} value={stats.currentStreak} label={t.currentStreak} accent="orange" />
          <StatCard icon={<Trophy />} value={stats.bestStreak} label={t.bestStreak} accent="sky" />
          <StatCard icon={<Clock3 />} value={`${Math.round(stats.totalTimeSeconds / 60)}`} label={t.totalTime} accent="emerald" />
          <StatCard icon={<History />} value={stats.completedWorkouts} label={t.sessions} accent="violet" />
        </section>

        <section className="surface-card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><p className="eyebrow">{t.activity}</p><h2 className="mt-1 text-xl font-black">{t.completed}</h2></div>
            <div className="flex rounded-xl bg-slate-500/10 p-1 text-xs font-black">
              {(['days', 'weeks', 'months'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-lg px-3 py-2 transition ${period === value ? 'bg-tg-secondary-bg text-emerald-700 shadow-sm dark:text-emerald-300' : 'text-tg-hint'}`}>
                  {periodLabel(value, settings.language)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label={t.activity}>
            {chart.map((point) => (
              <div key={point.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-black text-tg-hint">{point.value || ''}</span>
                <div title={`${point.label}: ${point.value}`} className="w-full min-w-1 rounded-t-lg bg-emerald-500/20">
                  <div className="w-full rounded-t-lg bg-emerald-500 transition-all" style={{height: `${Math.max(point.value ? 10 : 3, (point.value / maximum) * 118)}px`}} />
                </div>
                <span className="max-w-full truncate text-[9px] font-bold text-tg-hint">{point.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="eyebrow"><Medal className="mr-1 inline" size={14} />{t.gameCollectionTitle}</p><h2 className="mt-1 text-xl font-black">{achievements.filter((item) => item.unlocked).length} / {achievements.length}</h2><p className="mt-1 max-w-lg text-sm font-semibold leading-5 text-tg-hint">{t.gameCollectionBody}</p></div>
            <button type="button" onClick={() => void shareProgress()} className="secondary-button inline-flex items-center justify-center gap-2 text-sm"><Share2 size={17} />{shareStatus === 'copied' ? t.shared : t.shareProgress}</button>
          </div>
          <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-[#073f3b] p-4 text-white sm:grid-cols-[1fr_auto] sm:items-center">
            <div><p className="text-xs font-black uppercase tracking-widest text-amber-200">{t.gameLevel} {gameProgress.levelNumber}</p><p className="mt-1 text-xl font-black">{getLevelName(gameProgress.level, t)}</p></div>
            <p className="inline-flex items-center gap-2 text-2xl font-black text-amber-200"><Star size={23} fill="currentColor" />{gameProgress.stars} <span className="text-sm">{t.gameStars}</span></p>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {achievements.map((item) => (
              <li key={item.name} className={`rounded-2xl border p-4 ${item.unlocked ? 'border-amber-500/25 bg-amber-500/7' : 'border-[var(--line)] bg-slate-500/5 opacity-65'}`}>
                <div className={`mb-3 grid size-11 place-items-center rounded-2xl text-xl ${item.unlocked ? `bg-gradient-to-br ${item.color} text-white shadow-md` : 'bg-slate-500/10 text-tg-hint'}`}>{item.unlocked ? <span aria-hidden="true">{item.symbol}</span> : <Lock size={16} />}</div>
                <p className="text-sm font-black leading-5">{item.name}</p><p className="mt-1 text-[10px] font-black uppercase tracking-wider text-tg-hint">{item.unlocked ? t.unlocked : t.locked}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <section className="surface-card p-5 sm:p-6">
            <p className="eyebrow"><Star className="mr-1 inline" size={13} />{t.favorite}</p>
            {favorite ? (
              <div className="mt-5 rounded-[1.75rem] bg-emerald-600 p-5 text-white shadow-lg shadow-emerald-900/15">
                <h2 className="text-xl font-black">{localize(favorite.name, settings.language)}</h2>
                <p className="mt-2 text-sm leading-5 text-emerald-50">{localize(favorite.description, settings.language)}</p>
                <span className="mt-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-black">{t.times(stats.complexCounts[favorite.id])}</span>
              </div>
            ) : <Empty text={t.noData} />}

            <p className="eyebrow mt-7"><CalendarDays className="mr-1 inline" size={13} />{t.activity}</p>
            <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label={t.activity}>
              {buildCalendar(records).map((day) => <div key={day.key} title={`${day.key}: ${day.count}`} className={`aspect-square rounded-md ${day.count === 0 ? 'bg-slate-500/8' : day.count === 1 ? 'bg-emerald-300 dark:bg-emerald-800' : day.count === 2 ? 'bg-emerald-500' : 'bg-emerald-700'}`} />)}
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <p className="eyebrow">{t.history}</p>
            {records.length === 0 ? <Empty text={t.noData} /> : (
              <ol className="mt-4 max-h-[30rem] space-y-2 overflow-y-auto pr-1">
                {records.map((record) => {
                  const complex = COMPLEX_BY_ID.get(record.complexId);
                  return (
                    <li key={record.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-tg-bg/60 p-4">
                      <div className="min-w-0"><p className="truncate font-extrabold">{complex ? localize(complex.name, settings.language) : record.complexId}</p><time className="mt-1 block text-xs text-tg-hint">{new Intl.DateTimeFormat(settings.language, {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(record.completedAt))}</time></div>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">{Math.round(record.durationSeconds / 60)} {t.minuteShort}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({icon, value, label, accent}: {icon: ReactNode; value: string | number; label: string; accent: 'orange' | 'sky' | 'emerald' | 'violet'}) {
  const colors = {orange: 'text-orange-500 bg-orange-500/10', sky: 'text-sky-500 bg-sky-500/10', emerald: 'text-emerald-600 bg-emerald-500/10', violet: 'text-violet-500 bg-violet-500/10'};
  return <div className="surface-card p-4 sm:p-5"><div className={`mb-4 grid size-10 place-items-center rounded-2xl ${colors[accent]}`}>{icon}</div><div className="text-3xl font-black tabular-nums">{value}</div><div className="mt-1 text-[10px] font-black uppercase tracking-widest text-tg-hint">{label}</div></div>;
}

function Empty({text}: {text: string}) {return <p className="mt-5 rounded-2xl border border-dashed border-[var(--line)] p-6 text-center text-sm leading-6 text-tg-hint">{text}</p>}

function dayKey(date: Date): string {return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}

function buildCalendar(records: WorkoutRecord[]) {
  const counts = new Map<string, number>();
  for (const record of records) {const key = dayKey(new Date(record.completedAt)); counts.set(key, (counts.get(key) ?? 0) + 1)}
  return Array.from({length: 35}, (_, index) => {const date = new Date(); date.setDate(date.getDate() - 34 + index); const key = dayKey(date); return {key, count: counts.get(key) ?? 0}});
}

function periodLabel(period: Period, language: UserSettings['language']) {
  return ({ru: {days: 'Дни', weeks: 'Недели', months: 'Месяцы'}, ro: {days: 'Zile', weeks: 'Săpt.', months: 'Luni'}, en: {days: 'Days', weeks: 'Weeks', months: 'Months'}})[language][period];
}

function buildChart(records: WorkoutRecord[], period: Period, language: UserSettings['language']) {
  const now = new Date();
  const length = period === 'days' ? 14 : period === 'weeks' ? 8 : 6;
  return Array.from({length}, (_, index) => {
    const offset = length - 1 - index;
    let start: Date;
    let end: Date;
    let label: string;
    if (period === 'days') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      label = new Intl.DateTimeFormat(language, {day: 'numeric'}).format(start);
    } else if (period === 'weeks') {
      const currentMondayOffset = (now.getDay() + 6) % 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentMondayOffset - offset * 7);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
      label = new Intl.DateTimeFormat(language, {day: 'numeric', month: 'short'}).format(start);
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      label = new Intl.DateTimeFormat(language, {month: 'short'}).format(start);
    }
    const value = records.filter((record) => {const date = new Date(record.completedAt); return date >= start && date < end}).length;
    return {key: start.toISOString(), label, value};
  });
}
