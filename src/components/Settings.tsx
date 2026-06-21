import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function Settings() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteData = async () => {
    setIsDeleting(true);
    try {
      await fetch('/api/user/data', { method: 'DELETE' });
      setDeleted(true);
      setShowConfirm(false);
      setTimeout(() => setDeleted(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f0] overflow-y-auto relative">
      <header className="bg-white/50 backdrop-blur-md border-b border-[#e5e5e5] px-8 py-6 sticky top-0 z-10">
        <h2 className="font-serif text-2xl text-[#1a1a1a]">Settings</h2>
        <p className="text-[#5A5A40] text-sm mt-1">Manage your data and preferences.</p>
      </header>

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e5e5e5]/50"
        >
          <h3 className="font-serif text-2xl text-[#1a1a1a] mb-6 border-b border-[#e5e5e5] pb-4">Data & Privacy</h3>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="font-medium text-[#1a1a1a] flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                Clear Conversation History
              </h4>
              <p className="text-sm text-[#9e9e9e] mt-2 max-w-md leading-relaxed">
                This will permanently delete all your messages, emotional insights, and dashboard data. Your profile name will remain.
              </p>
            </div>
            
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting || deleted}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all shadow-sm shrink-0 ${
                deleted 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-[#e5d5d5] text-[#d32f2f] hover:bg-[#dcaea3]'
              }`}
            >
              {deleted ? (
                <>
                  <CheckCircle2 size={18} />
                  Data Cleared
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete All Data
                </>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e5e5e5]/50 opacity-60"
        >
          <h3 className="font-serif text-2xl text-[#1a1a1a] mb-6 border-b border-[#e5e5e5] pb-4">Preferences</h3>
          <p className="text-sm text-[#9e9e9e] italic">More settings coming soon...</p>
        </motion.div>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-[#e5e5e5]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <button onClick={() => setShowConfirm(false)} className="text-[#9e9e9e] hover:text-[#1a1a1a] transition-colors">
                  <X size={24} />
                </button>
              </div>
              <h3 className="font-serif text-2xl text-[#1a1a1a] mb-2">Delete all data?</h3>
              <p className="text-[#5A5A40] mb-8 leading-relaxed">
                Are you sure you want to delete all your conversation history and emotional insights? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-full font-medium text-[#5A5A40] bg-[#f5f5f0] hover:bg-[#e5e5e5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 rounded-full font-medium text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
