import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, MotionConfig, motion} from 'motion/react';
import Dashboard from './components/Dashboard';
import ConsentBanner from './components/ConsentBanner';
import InstallPrompt from './components/InstallPrompt';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';
import SettingsView from './components/SettingsView';
import StatsView from './components/StatsView';
import WorkoutSession from './components/WorkoutSession';
import {COMPLEX_BY_ID} from './data';
import {createWorkoutPlan} from './domain/workouts';
import {calculateStats} from './domain/stats';
import {api, ApiError} from './api/client';
import {configureAnalytics, track} from './analytics';
import {ensureAudioPack} from './audio/packs';
import {bootstrapAccount, synchronize} from './api/sync';
import type {PublicConfig} from './api/types';
import {getTelegramWebApp} from './platform/telegram';
import {configureReminders} from './push';
import {clearWorkouts, listWorkouts, saveWorkout, subscribeToWorkoutChanges} from './storage/database';
import {defaultSettings, getSettings, resetSettings, saveSettings} from './storage/settings';
import type {Complex, SessionState, UserSettings, WorkoutPlan, WorkoutRecord} from './types';

type View = 'dashboard' | 'stats' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [historyStatus, setHistoryStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [session, setSession] = useState<SessionState>({status: 'loading', user: null});
  const [publicConfig, setPublicConfig] = useState<PublicConfig>({googleAuthEnabled: false, telegramAuthEnabled: false, pushEnabled: false, vapidPublicKey: null});
  const [syncing, setSyncing] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'saving' | 'enabled' | 'disabled' | 'unsupported' | 'denied' | 'error'>('idle');
  const trackedUserId = useRef<string | null>(null);
  const trackedLaunch = useRef(false);

  const loadHistory = async () => {
    try {
      setRecords(await listWorkouts());
      setHistoryStatus('ready');
    } catch {
      setHistoryStatus('error');
    }
  };

  useEffect(() => {
    void loadHistory();
    return subscribeToWorkoutChanges(() => void loadHistory());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      let available = publicConfig;
      try {
        available = await api.config();
        if (!cancelled) setPublicConfig(available);
      } catch {
        if (!cancelled) setSession({status: 'guest', user: null});
        return;
      }
      try {
        const {user} = await api.me();
        if (!cancelled) setSession({status: 'authenticated', user});
      } catch (error) {
        const telegram = getTelegramWebApp();
        if (error instanceof ApiError && error.status === 401 && telegram && available.telegramAuthEnabled) {
          try {
            const {user} = await api.telegramLogin(telegram.initData);
            if (!cancelled) setSession({status: 'authenticated', user});
            return;
          } catch {
            // Invalid or unavailable Telegram auth falls back to a local guest safely.
          }
        }
        if (!cancelled) setSession({status: 'guest', user: null});
      }
    };
    void restore();
    return () => {cancelled = true};
  }, []);

  useEffect(() => {
    if (session.status !== 'authenticated' || !navigator.onLine) return;
    let cancelled = false;
    setSyncing(true);
    void bootstrapAccount(settings)
      .then((accountSettings) => {
        if (cancelled) return;
        setSettings(accountSettings);
        saveSettings(accountSettings);
        return synchronize();
      })
      .catch(() => synchronize().catch(() => undefined))
      .finally(() => {if (!cancelled) setSyncing(false)});
    return () => {cancelled = true};
  }, [session.status, session.user?.id]);

  useEffect(() => {
    const syncOnline = () => {
      if (session.status !== 'authenticated') return;
      setSyncing(true);
      void synchronize().catch(() => undefined).finally(() => setSyncing(false));
    };
    window.addEventListener('online', syncOnline);
    return () => window.removeEventListener('online', syncOnline);
  }, [session.status, settings]);

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.lang = settings.language;
      document.documentElement.dataset.textSize = settings.textSize;
      document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'standard';
      document.documentElement.dataset.motion = settings.motion;
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [settings.highContrast, settings.language, settings.motion, settings.textSize, settings.theme]);

  useEffect(() => configureAnalytics(settings.analyticsConsent), [settings.analyticsConsent]);

  useEffect(() => {
    if (!navigator.onLine) return;
    void ensureAudioPack(settings.language).catch(() => undefined);
  }, [settings.language]);

  useEffect(() => {
    if (settings.analyticsConsent !== 'granted' || trackedLaunch.current) return;
    trackedLaunch.current = true;
    const channel = getTelegramWebApp() ? 'telegram' : matchMedia('(display-mode: standalone)').matches ? 'pwa' : 'browser';
    track('app_opened', {channel});
  }, [settings.analyticsConsent]);

  useEffect(() => {
    if (!session.user) {trackedUserId.current = null; return}
    if (session.user.id === trackedUserId.current) return;
    trackedUserId.current = session.user.id;
    track('signed_in', {provider: session.user.provider});
  }, [session.user]);

  const updateSettings = (next: UserSettings) => {
    const remindersChanged = next.reminders !== settings.reminders;
    setSettings(next);
    saveSettings(next);
    if (session.status === 'authenticated' && navigator.onLine) void api.saveSettings(next).catch(() => undefined);
    if (next.language !== settings.language) track('language_changed', {language: next.language});
    if (next.voiceEnabled !== settings.voiceEnabled) track('voice_changed', {enabled: next.voiceEnabled});
    if (remindersChanged && navigator.onLine) {
      setReminderStatus('saving');
      void configureReminders(next, session, publicConfig)
        .then((status) => {
          setReminderStatus(status);
          track('reminder_permission', {status, channel: session.user?.provider === 'telegram' ? 'telegram' : 'web_push'});
        })
        .catch(() => setReminderStatus('error'));
    }
  };

  const startWorkout = (complex: Complex) => {
    setActivePlan(createWorkoutPlan(complex, settings.language));
    track('workout_started', {complex_id: complex.id, channel: getTelegramWebApp() ? 'telegram' : 'web'});
  };

  const finishWorkout = async (record: WorkoutRecord) => {
    await saveWorkout(record);
    track('workout_completed', {complex_id: record.complexId, duration_seconds: record.durationSeconds});
    if (session.status === 'authenticated' && navigator.onLine) {
      setSyncing(true);
      await synchronize().catch(() => undefined);
      setSyncing(false);
    }
    setActivePlan(null);
    setView('dashboard');
  };

  const changeSession = async (next: SessionState) => {
    if (session.status === 'authenticated' && next.status === 'guest') {
      await clearWorkouts();
      resetSettings();
      setSettings(defaultSettings);
    }
    setSession(next);
  };

  const resetAll = async () => {
    await clearWorkouts();
    if (session.status === 'authenticated' && navigator.onLine) {
      await Promise.all([
        api.deleteWorkouts(),
        api.saveSettings(defaultSettings),
        api.saveReminders([]),
        configureReminders(defaultSettings, session, publicConfig),
      ]).catch(() => undefined);
    }
    resetSettings();
    setSettings(defaultSettings);
    setView('dashboard');
  };

  const activeComplex = activePlan ? COMPLEX_BY_ID.get(activePlan.complexId) ?? null : null;
  const stats = calculateStats(records);

  return (
    <MotionConfig reducedMotion={settings.motion === 'off' ? 'always' : 'user'} transition={settings.motion === 'slow' ? {duration: 0.55} : undefined}>
    <div className="mx-auto min-h-[var(--tg-viewport-stable-height,100dvh)] max-w-5xl text-tg-text">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
            <Dashboard
              historyStatus={historyStatus}
              session={session}
              publicConfig={publicConfig}
              syncing={syncing}
              stats={stats}
              settings={settings}
              onRetryHistory={() => void loadHistory()}
              onSelectComplex={startWorkout}
              onOpenStats={() => setView('stats')}
              onOpenSettings={() => setView('settings')}
            />
          </motion.div>
        )}
        {view === 'stats' && (
          <motion.div key="stats" initial={{opacity: 0, x: 40}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 40}}>
            <StatsView records={records} stats={stats} settings={settings} onClose={() => setView('dashboard')} />
          </motion.div>
        )}
        {view === 'settings' && (
          <motion.div key="settings" initial={{opacity: 0, x: 40}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 40}}>
            <SettingsView settings={settings} session={session} publicConfig={publicConfig} reminderStatus={reminderStatus} onSessionChange={(next) => void changeSession(next)} onUpdate={updateSettings} onClose={() => setView('dashboard')} onReset={() => void resetAll()} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePlan && activeComplex && (
          <WorkoutSession
            plan={activePlan}
            complex={activeComplex}
            settings={settings}
            onComplete={(record) => void finishWorkout(record)}
            onExit={() => {track('workout_exited', {complex_id: activePlan.complexId}); setActivePlan(null)}}
          />
        )}
      </AnimatePresence>
      {!activePlan && settings.analyticsConsent !== 'unknown' ? <PwaUpdatePrompt language={settings.language} /> : null}
      {!activePlan && settings.analyticsConsent !== 'unknown' ? <InstallPrompt language={settings.language} /> : null}
      <ConsentBanner settings={settings} onUpdate={updateSettings} />
    </div>
    </MotionConfig>
  );
}
