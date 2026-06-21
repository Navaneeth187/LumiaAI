/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, LayoutDashboard, User, Settings as SettingsIcon, Wind } from 'lucide-react';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Breathing from './components/Breathing';
import Profile from './components/Profile';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'exercises' | 'profile' | 'settings'>('chat');
  const [user, setUser] = useState<{ id: number; name: string; onboarding_completed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center font-serif">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A5A40] flex items-center justify-center text-white font-serif italic text-2xl">L</div>
          <div className="text-[#5A5A40] text-xl tracking-wider">Waking Lumina...</div>
        </div>
      </div>
    );
  }

  if (user && !user.onboarding_completed) {
    return <Onboarding onComplete={() => setUser({ ...user, onboarding_completed: true })} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="md:w-64 bg-white border-r border-[#e5e5e5] p-6 flex flex-col justify-between shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-20">
        <div>
          <div className="flex items-center gap-3 mb-12 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#5A5A40] flex items-center justify-center text-white font-serif italic text-xl shadow-md group-hover:scale-105 transition-transform">
              L
            </div>
            <h1 className="font-serif text-2xl tracking-tight text-[#5A5A40]">Lumina</h1>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'chat'
                  ? 'bg-[#5A5A40] text-white shadow-md translate-x-1'
                  : 'text-[#5A5A40] hover:bg-[#f5f5f0] hover:translate-x-1'
              }`}
            >
              <MessageCircle size={20} />
              <span className="font-medium">Companion</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-[#5A5A40] text-white shadow-md translate-x-1'
                  : 'text-[#5A5A40] hover:bg-[#f5f5f0] hover:translate-x-1'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'exercises'
                  ? 'bg-[#5A5A40] text-white shadow-md translate-x-1'
                  : 'text-[#5A5A40] hover:bg-[#f5f5f0] hover:translate-x-1'
              }`}
            >
              <Wind size={20} />
              <span className="font-medium">Exercises</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-[#5A5A40] text-white shadow-md translate-x-1'
                : 'text-[#5A5A40] hover:bg-[#f5f5f0] hover:translate-x-1'
            }`}
          >
            <User size={20} />
            <span className="font-medium">Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-[#5A5A40] text-white shadow-md translate-x-1'
                : 'text-[#5A5A40] hover:bg-[#f5f5f0] hover:translate-x-1'
            }`}
          >
            <SettingsIcon size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-[#f5f5f0]">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Chat />
            </motion.div>
          )}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-y-auto"
            >
              <Dashboard />
            </motion.div>
          )}
          {activeTab === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-y-auto"
            >
              <Breathing />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-y-auto"
            >
              <Profile userName={user?.name || 'User'} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-y-auto"
            >
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
