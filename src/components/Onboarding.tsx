import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step === 0 && name.trim()) {
      setStep(1);
    } else if (step === 1) {
      setLoading(true);
      await fetch('/api/user/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      setLoading(false);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6">
      <motion.div 
        className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step === 0 ? (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="w-12 h-12 rounded-full bg-[#5A5A40] flex items-center justify-center text-white font-serif italic text-2xl mb-8">
              L
            </div>
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-4">Hello, I'm Lumina.</h2>
            <p className="text-[#5A5A40] text-lg mb-8 leading-relaxed">
              I'm your personal mental health companion. I'm here to listen, support you, and help you understand your emotional patterns.
            </p>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#5A5A40] uppercase tracking-wider">What should I call you?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#f5f5f0] border-none rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                placeholder="Your name"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="mt-10 w-full bg-[#5A5A40] text-white rounded-full py-4 px-6 flex items-center justify-center gap-2 hover:bg-[#4a4a30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ArrowRight size={20} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-4">Nice to meet you, {name}.</h2>
            <p className="text-[#5A5A40] text-lg mb-8 leading-relaxed">
              Before we begin, please remember that while I am designed to support you, I am an AI and not a replacement for professional therapy or medical advice.
            </p>
            <p className="text-[#5A5A40] text-lg mb-10 leading-relaxed">
              If you ever feel overwhelmed or in crisis, please reach out to a human professional or a crisis hotline.
            </p>
            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full bg-[#5A5A40] text-white rounded-full py-4 px-6 flex items-center justify-center gap-2 hover:bg-[#4a4a30] transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Setting up...' : 'I understand'}</span>
              {!loading && <ArrowRight size={20} />}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
