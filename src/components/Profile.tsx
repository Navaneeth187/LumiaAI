import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MessageCircle, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Profile({ userName }: { userName: string }) {
  const [stats, setStats] = useState<{ totalMessages: number; totalSessions: number; memberSince: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f5f5f0] overflow-y-auto">
      <header className="bg-white/50 backdrop-blur-md border-b border-[#e5e5e5] px-8 py-6 sticky top-0 z-10">
        <h2 className="font-serif text-2xl text-[#1a1a1a]">Your Profile</h2>
        <p className="text-[#5A5A40] text-sm mt-1">A summary of your journey with Lumina.</p>
      </header>

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e5e5e5]/50 flex items-center gap-8"
        >
          <div className="w-24 h-24 rounded-full bg-[#5A5A40] flex items-center justify-center text-white text-4xl font-serif italic shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-serif text-3xl text-[#1a1a1a] mb-2">{userName}</h3>
            {stats && (
              <p className="text-[#9e9e9e] flex items-center gap-2">
                <Calendar size={16} />
                Joined {format(parseISO(stats.memberSince), 'MMMM yyyy')}
              </p>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#e5e5e5]/50"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40]">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-sm font-medium text-[#9e9e9e] uppercase tracking-wider">Total Reflections</h3>
            </div>
            <p className="text-4xl font-light text-[#1a1a1a]">
              {stats ? stats.totalMessages : '...'}
            </p>
            <p className="text-sm text-[#9e9e9e] mt-2">Messages shared with Lumina</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#e5e5e5]/50"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40]">
                <Activity size={24} />
              </div>
              <h3 className="text-sm font-medium text-[#9e9e9e] uppercase tracking-wider">Sessions</h3>
            </div>
            <p className="text-4xl font-light text-[#1a1a1a]">
              {stats ? stats.totalSessions : '...'}
            </p>
            <p className="text-sm text-[#9e9e9e] mt-2">Conversations started</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
