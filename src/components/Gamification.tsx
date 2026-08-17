import {Check, ChevronRight, Compass, Gift, Sparkles, Star, Trophy} from 'lucide-react';
import {motion} from 'motion/react';
import {calculateGameProgress, calculateWorkoutReward, type ExplorerLevelId} from '../domain/rewards';
import {plannedDurationSeconds} from '../domain/workouts';
import {getMessages} from '../i18n';
import type {Language, WorkoutPlan, WorkoutRecord} from '../types';

interface ProgressProps {
  records: readonly WorkoutRecord[];
  language: Language;
  onOpenCollection: () => void;
}

export function GameProgressCard({records, language, onOpenCollection}: ProgressProps) {
  const t = getMessages(language);
  const progress = calculateGameProgress(records);
  const levelName = getLevelName(progress.level, t);

  return (
    <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-[#073f3b] p-5 text-white shadow-xl shadow-emerald-950/20 sm:p-7">
      <div aria-hidden="true" className="absolute -right-12 -top-14 size-44 rounded-full border-[24px] border-amber-300/10" />
      <div aria-hidden="true" className="absolute bottom-5 right-8 size-2 rounded-full bg-amber-300 shadow-[32px_-22px_0_rgba(125,211,252,.7),-18px_-45px_0_rgba(255,255,255,.45)]" />
      <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-amber-200"><Compass size={14} />{t.gameEyebrow}</p>
          <div className="mt-3 flex items-end gap-3">
            <div className="grid size-14 shrink-0 place-items-center rounded-[1.25rem] bg-amber-300 text-amber-950 shadow-lg shadow-black/15"><Star size={27} fill="currentColor" /></div>
            <div><p className="text-3xl font-black tabular-nums tracking-tight">{progress.stars} <span className="text-base text-amber-100">{t.gameStars}</span></p><p className="mt-0.5 text-sm font-bold text-emerald-100">{t.gameLevel} {progress.levelNumber} · {levelName}</p></div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={t.gameTitle} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress.levelProgressPercent)}>
            <motion.div initial={{width: 0}} animate={{width: `${progress.levelProgressPercent}%`}} className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" />
          </div>
          <p className="mt-2 text-xs font-bold text-emerald-100">{progress.nextLevelAt ? t.gameToNext(progress.starsToNextLevel) : t.gameMaxLevel}</p>
        </div>

        <div className="min-w-0 rounded-[1.5rem] bg-white/8 p-4 md:w-64">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-100">{t.gameMissionTitle}</p>
          <p className="mt-2 text-sm font-bold leading-5">{progress.dailyMissionComplete ? t.gameMissionDone : t.gameMissionBody}</p>
          <button type="button" onClick={onOpenCollection} className="mt-4 inline-flex min-h-11 w-full items-center justify-between rounded-xl bg-white px-3.5 text-xs font-black text-emerald-900">
            <span className="inline-flex items-center gap-2"><Trophy size={16} />{t.gameOpenCollection}</span><ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function WorkoutRewardSummary({plan, previousRecords, language}: {plan: WorkoutPlan; previousRecords: readonly WorkoutRecord[]; language: Language}) {
  const t = getMessages(language);
  const preview: WorkoutRecord = {...plan, completedAt: new Date().toISOString(), durationSeconds: plannedDurationSeconds(plan.exerciseIds), syncedAt: null};
  const reward = calculateWorkoutReward(preview, previousRecords);
  const before = calculateGameProgress(previousRecords);
  const after = calculateGameProgress([...previousRecords, preview]);
  const levelUp = before.level !== after.level;

  return (
    <motion.section initial={{opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} transition={{delay: 0.18}} className="relative mt-6 overflow-hidden rounded-[2rem] border border-amber-400/25 bg-gradient-to-br from-amber-400/15 to-emerald-500/10 p-5 text-left">
      <motion.div aria-hidden="true" initial={{scale: 0, rotate: -25}} animate={{scale: 1, rotate: 0}} transition={{delay: 0.25, type: 'spring'}} className="absolute right-5 top-5 text-amber-400"><Sparkles size={34} /></motion.div>
      <p className="text-xs font-black uppercase tracking-[.16em] text-amber-700 dark:text-amber-300">{t.gameRewardTitle}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-amber-400 text-amber-950"><Star size={24} fill="currentColor" /></span>
        <p className="text-3xl font-black text-tg-text">+{reward.totalStars} <span className="text-base text-tg-hint">{t.gameStars}</span></p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
        <RewardChip label={t.gameRewardBase} value={reward.baseStars} />
        {reward.newRouteBonus ? <RewardChip label={t.gameRewardNewRoute} value={reward.newRouteBonus} /> : null}
        {reward.dailyMissionBonus ? <RewardChip label={t.gameRewardDaily} value={reward.dailyMissionBonus} /> : null}
      </div>
      {levelUp ? <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white"><Gift size={17} />{t.gameNewLevel}: {getLevelName(after.level, t)}</p> : null}
    </motion.section>
  );
}

function RewardChip({label, value}: {label: string; value: number}) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-tg-secondary-bg px-3 py-1.5 text-tg-hint"><Check size={13} className="text-emerald-600" />{label} +{value}</span>;
}

export function getLevelName(level: ExplorerLevelId, t: ReturnType<typeof getMessages>): string {
  return ({sunbeam: t.levelSunbeam, observer: t.levelObserver, pathfinder: t.levelPathfinder, guardian: t.levelGuardian, master: t.levelMaster})[level];
}
