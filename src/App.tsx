/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Complex, UserStats, UserSettings } from './types';
import { getStats, getSettings, saveSettings, saveStats, defaultStats, defaultSettings } from './utils';
import Dashboard from './components/Dashboard';
import WorkoutSession from './components/WorkoutSession';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'workout' | 'stats' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [stats, setStats] = useState<UserStats>(getStats());
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [activeComplex, setActiveComplex] = useState<Complex | null>(null);

  useEffect(() => {
    // Initial data load already done in state initialization
  }, []);

  const handleSelectComplex = (complex: Complex) => {
    setActiveComplex(complex);
    setView('workout');
  };

  const handleWorkoutClose = (completed: boolean) => {
    if (completed) {
      setStats(getStats());
    }
    setView('dashboard');
    setActiveComplex(null);
  };

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetData = () => {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие необратимо.')) {
      saveStats(defaultStats);
      saveSettings(defaultSettings);
      setStats(defaultStats);
      setSettings(defaultSettings);
      setView('dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-tg-bg relative">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              stats={stats} 
              settings={settings}
              onSelectComplex={handleSelectComplex}
              onOpenStats={() => setView('stats')}
              onOpenSettings={() => setView('settings')}
            />
          </motion.div>
        )}

        {view === 'stats' && (
          <motion.div
             key="stats"
             initial={{ y: '100%' }}
             animate={{ y: 0 }}
             exit={{ y: '100%' }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <StatsView 
              stats={stats} 
              settings={settings}
              onClose={() => setView('dashboard')} 
            />
          </motion.div>
        )}

        {view === 'settings' && (
          <motion.div
             key="settings"
             initial={{ y: '100%' }}
             animate={{ y: 0 }}
             exit={{ y: '100%' }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <SettingsView 
               settings={settings} 
               onUpdate={updateSettings} 
               onClose={() => setView('dashboard')} 
               onReset={handleResetData}
            />
          </motion.div>
        )}

        {view === 'workout' && activeComplex && (
          <motion.div
             key="workout"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
          >
            <WorkoutSession complex={activeComplex} onClose={handleWorkoutClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
