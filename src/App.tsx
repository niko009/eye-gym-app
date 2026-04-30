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
import { Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'workout' | 'stats' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [stats, setStats] = useState<UserStats>(getStats());
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [activeComplex, setActiveComplex] = useState<Complex | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    // Initial data load already done in state initialization
  }, []);

  const handleSelectComplex = (complex: Complex) => {
    if (complex.isPro && !settings.isPro) {
      setShowUpgradeModal(true);
      return;
    }
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

  const handleUpgrade = () => {
    const newSettings = { ...settings, isPro: true };
    updateSettings(newSettings);
    setShowUpgradeModal(false);
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
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative">
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
              onUpgrade={() => setShowUpgradeModal(true)}
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
            <StatsView stats={stats} onClose={() => setView('dashboard')} />
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

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center relative overflow-hidden"
            >
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-yellow-100 rounded-3xl flex items-center justify-center text-yellow-600 mx-auto mb-6">
                <Crown size={32} />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-3">Продвинутый уровень</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Откройте доступ ко всем упражнениям для снятия напряжения и улучшения зрения.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-left">
                   <div className="w-2 h-2 bg-green-500 rounded-full" />
                   <span className="text-sm font-bold text-gray-700">12 профессиональных упражнений</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                   <div className="w-2 h-2 bg-green-500 rounded-full" />
                   <span className="text-sm font-bold text-gray-700">Все премиум-комплексы</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                   <div className="w-2 h-2 bg-green-500 rounded-full" />
                   <span className="text-sm font-bold text-gray-700">Умные уведомления</span>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-colors"
              >
                Купить Pro за 299₽
              </button>
              <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Единоразовая покупка</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
