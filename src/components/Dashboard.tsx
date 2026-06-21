import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Brain, HeartPulse, Activity, Sparkles, AlertCircle, BrainCircuit } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<{ trends: any[], topEmotions: any[], distortions: any[] }>({ trends: [], topEmotions: [], distortions: [] });
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(async dashboardData => {
        const formattedTrends = dashboardData.trends.map((t: any) => ({
          ...t,
          date: format(parseISO(t.timestamp), 'MMM dd, HH:mm'),
          mood: t.mood_score || 5,
          stress: t.stress_level || 5
        }));
        setData({ trends: formattedTrends, topEmotions: dashboardData.topEmotions, distortions: dashboardData.distortions || [] });
        setLoading(false);
        
        // Generate insight securely from the backend
        if (dashboardData.trends.length >= 3) {
          try {
            const insightRes = await fetch('/api/dashboard/insight');
            if (insightRes.ok) {
              const insightData = await insightRes.json();
              setInsight(insightData.insight);
            } else {
              setInsight("Unable to generate wellness insight at this time.");
            }
          } catch (e) {
            console.error("Failed to generate insight", e);
            setInsight("Unable to load insights. Please check backend connection.");
          }
        }
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f5f5f0]">
        <div className="animate-pulse text-[#5A5A40] text-xl font-serif">Loading Insights...</div>
      </div>
    );
  }

  const latestMood = data.trends.length > 0 ? data.trends[data.trends.length - 1].mood : 5;
  const latestStress = data.trends.length > 0 ? data.trends[data.trends.length - 1].stress : 5;

  return (
    <div className="flex flex-col h-full bg-[#f5f5f0] overflow-y-auto">
      <header className="bg-white/50 backdrop-blur-md border-b border-[#e5e5e5] px-8 py-6 sticky top-0 z-10">
        <h2 className="font-serif text-2xl text-[#1a1a1a]">Mental Wellness Insights</h2>
        <p className="text-[#5A5A40] text-sm mt-1">Understand your emotional patterns over time.</p>
      </header>

      <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#e5e5e5]/50"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40]">
                <HeartPulse size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#9e9e9e] uppercase tracking-wider">Current Mood</h3>
                <p className="text-3xl font-light text-[#1a1a1a]">{latestMood} <span className="text-lg text-[#9e9e9e]">/ 10</span></p>
              </div>
            </div>
            <div className="h-2 w-full bg-[#f5f5f0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5A5A40] rounded-full transition-all duration-1000" 
                style={{ width: `${(latestMood / 10) * 100}%` }}
              />
            </div>
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
              <div>
                <h3 className="text-sm font-medium text-[#9e9e9e] uppercase tracking-wider">Stress Level</h3>
                <p className="text-3xl font-light text-[#1a1a1a]">{latestStress} <span className="text-lg text-[#9e9e9e]">/ 10</span></p>
              </div>
            </div>
            <div className="h-2 w-full bg-[#f5f5f0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5A5A40] rounded-full transition-all duration-1000"
                style={{ width: `${(latestStress / 10) * 100}%` }}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#5A5A40] text-white rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Dominant Emotion</h3>
                <p className="text-3xl font-light capitalize">
                  {data.topEmotions.length > 0 ? data.topEmotions[0].emotion : 'Neutral'}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Based on your recent conversations with Lumina.
            </p>
          </motion.div>
        </div>

        {/* AI Insight Reflection Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#e5e5e5]/50 flex gap-6 items-start"
        >
          <div className="w-12 h-12 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="font-serif text-xl text-[#1a1a1a] mb-2">Lumina's Wellness Reflection</h3>
            <p className="text-[#5A5A40] leading-relaxed text-base">
              {insight ? insight : "Your digital reflection companion is ready. Share at least three reflective messages in the Companion chat to unlock personalized pattern analysis and deep emotional insights."}
            </p>
          </div>
        </motion.div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#e5e5e5]/50"
          >
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-8">Emotional Fluctuations</h3>
            <div className="h-[300px] w-full">
              {data.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e5e5e5" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#e5e5e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f0" />
                    <XAxis dataKey="date" tick={{ fill: '#9e9e9e', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#9e9e9e', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      labelStyle={{ color: '#9e9e9e', marginBottom: '8px' }}
                    />
                    <Area type="monotone" dataKey="mood" stroke="#5A5A40" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" name="Mood" />
                    <Area type="monotone" dataKey="stress" stroke="#9e9e9e" strokeWidth={2} fillOpacity={1} fill="url(#colorStress)" name="Stress" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#9e9e9e]">
                  Not enough data yet. Chat with Lumina to build your insights.
                </div>
              )}
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#e5e5e5]/50 flex flex-col"
            >
              <h3 className="font-serif text-2xl text-[#1a1a1a] mb-6">Recent Emotions</h3>
              <div className="flex-1 space-y-3">
                {data.topEmotions.length > 0 ? (
                  data.topEmotions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f5f0]">
                      <div className="flex items-center gap-3">
                        <Sparkles size={16} className="text-[#5A5A40]" />
                        <span className="font-medium text-[#1a1a1a] capitalize">{item.emotion}</span>
                      </div>
                      <span className="text-xs font-medium text-[#9e9e9e] bg-white px-2.5 py-1 rounded-full shadow-sm">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-[#9e9e9e] text-center text-sm">
                    Start sharing your feelings to see patterns.
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-amber-50 rounded-[32px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-amber-100 flex flex-col"
            >
              <h3 className="font-serif text-2xl text-[#1a1a1a] mb-2">Thought Patterns</h3>
              <p className="text-sm text-amber-800/70 mb-6">Cognitive distortions detected in your recent chats.</p>
              <div className="flex-1 space-y-3">
                {data.distortions.length > 0 ? (
                  data.distortions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-100">
                      <div className="flex items-center gap-3">
                        <BrainCircuit size={16} className="text-amber-600" />
                        <span className="font-medium text-[#1a1a1a] text-sm">{item.distortion}</span>
                      </div>
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-amber-800/50 text-center text-sm">
                    No significant distortions detected recently. Great job!
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Safety Notice */}
        <div className="bg-[#f5f5f0] border border-[#e5e5e5] rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="text-[#9e9e9e] shrink-0 mt-1" size={20} />
          <p className="text-sm text-[#9e9e9e] leading-relaxed">
            These insights are generated by AI based on your conversations and are intended for personal reflection only. They do not constitute a medical diagnosis. If you are experiencing persistent distress, please consult a qualified mental health professional.
          </p>
        </div>
      </div>
    </div>
  );
}
