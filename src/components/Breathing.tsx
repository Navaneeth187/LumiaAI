import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Square, Info } from 'lucide-react';

export default function Breathing() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setTimeLeft(0);
      return;
    }

    let reqId: number;
    let currentPhase = 'inhale';
    let phaseStart = Date.now();
    let duration = 4000; // 4 seconds inhale
    
    setPhase('inhale');
    setTimeLeft(4);

    const tick = () => {
      const now = Date.now();
      const elapsed = now - phaseStart;
      
      if (elapsed >= duration) {
        // Switch phase based on 4-7-8 technique
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          duration = 7000;
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          duration = 8000;
        } else {
          currentPhase = 'inhale';
          duration = 4000;
        }
        phaseStart = now;
        setPhase(currentPhase as any);
        setTimeLeft(Math.ceil(duration / 1000));
      } else {
        setTimeLeft(Math.ceil((duration - elapsed) / 1000));
      }
      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(reqId);
  }, [isActive]);

  const getCircleAnimation = () => {
    switch (phase) {
      case 'inhale':
        return { scale: 2.5, background: 'radial-gradient(circle, #a3a38f 0%, #8b8b6e 100%)', transition: { duration: 4, ease: "linear" as const } };
      case 'hold':
        return { scale: 2.5, background: 'radial-gradient(circle, #7a7a5c 0%, #5A5A40 100%)', transition: { duration: 7, ease: "linear" as const } };
      case 'exhale':
        return { scale: 1, background: 'radial-gradient(circle, #c4c4b8 0%, #a3a38f 100%)', transition: { duration: 8, ease: "linear" as const } };
      default:
        return { scale: 1, background: 'radial-gradient(circle, #e8e8e0 0%, #c4c4b8 100%)', transition: { duration: 1 } };
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      default: return 'Ready to relax?';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f0] overflow-y-auto">
      <header className="bg-white/50 backdrop-blur-md border-b border-[#e5e5e5] px-8 py-6 sticky top-0 z-10">
        <h2 className="font-serif text-2xl text-[#1a1a1a]">Interactive Exercises</h2>
        <p className="text-[#5A5A40] text-sm mt-1">Guided tools to help you center yourself in the moment.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-12 shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-[#e5e5e5]/50 w-full max-w-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#f5f5f0]/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40] mb-6 shadow-sm">
              <Wind size={28} strokeWidth={2.5} />
            </div>
            <h3 className="font-serif text-3xl text-[#1a1a1a] mb-4">4-7-8 Breathing</h3>
            <p className="text-[#5A5A40] text-lg mb-16 max-w-md">
              A proven technique to reduce anxiety and help you sleep. Follow the circle as it expands and contracts.
            </p>

            {/* Interactive Breathing Circle */}
            <div className="relative w-96 h-96 flex items-center justify-center mb-8">
              {/* Outer boundary ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#d1d1d1]" />
              
              {/* Animated breathing circle */}
              <motion.div
                className="absolute w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.15)]"
                animate={getCircleAnimation()}
              />
              
              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`font-serif text-xl ${phase === 'idle' ? 'text-[#1a1a1a]' : 'text-white drop-shadow-md'}`}
                  >
                    {getInstruction()}
                  </motion.span>
                </AnimatePresence>
                {isActive && (
                  <span className="text-white/80 font-mono text-xl mt-2 drop-shadow-md">
                    {timeLeft}s
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="absolute -bottom-7 flex justify-center w-full z-20">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg ${
                    isActive 
                      ? 'bg-white text-[#1a1a1a] border border-[#e5e5e5] hover:bg-gray-50' 
                      : 'bg-[#5A5A40] text-white hover:bg-[#4a4a30]'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Square size={20} className="fill-current" />
                      Stop Exercise
                    </>
                  ) : (
                    <>
                      <Play size={20} className="fill-current" />
                      Start Breathing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-[#f5f5f0] border border-[#e5e5e5] rounded-3xl p-6 flex items-start gap-4 w-full max-w-2xl"
        >
          <Info className="text-[#5A5A40] shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-medium text-[#1a1a1a] mb-2">How it works</h4>
            <p className="text-sm text-[#5A5A40] leading-relaxed">
              Inhale quietly through your nose for <strong>4 seconds</strong>. Hold your breath for <strong>7 seconds</strong>. Exhale completely through your mouth, making a whoosh sound, for <strong>8 seconds</strong>. This acts as a natural tranquilizer for the nervous system.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
