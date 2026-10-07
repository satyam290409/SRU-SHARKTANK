import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import ParticlesBackground from '../components/ui/ParticlesBackground';
import { Trophy, Award, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../lib/socket';

const PublicResults = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealStep, setRevealStep] = useState(0); // 0: init, 1: text, 2: #3, 3: #2, 4: #1, 5: all

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.getResults();
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
    
    // Auto-update via socket.io
    const socket = getSocket();
    socket.on('leaderboard-update', fetchResults);
    
    const interval = setInterval(fetchResults, 10000);
    return () => {
      clearInterval(interval);
      socket.off('leaderboard-update', fetchResults);
    };
  }, []);

  // Handle reveal animation sequence
  useEffect(() => {
    if (data?.revealed && revealStep === 0) {
      setRevealStep(1);
      setTimeout(() => setRevealStep(2), 2000); // Show #3
      setTimeout(() => setRevealStep(3), 4000); // Show #2
      setTimeout(() => setRevealStep(4), 7000); // Show #1 (longer pause for tension)
      setTimeout(() => setRevealStep(5), 10000); // Show rest
    }
  }, [data?.revealed, revealStep]);

  if (loading) return <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div></div>;

  if (!data?.revealed) {
    return (
      <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden flex flex-col items-center justify-center p-4">
        <ParticlesBackground />
        <div className="relative z-10 text-center glass-card p-12 rounded-3xl max-w-2xl border border-gray-800 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Trophy className="w-12 h-12 text-gray-600" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Results Not Yet Announced</h1>
          <p className="text-gray-400 text-lg">The final results are being calculated. Please wait for the admins to reveal.</p>
        </div>
      </div>
    );
  }

  const results = data.results || [];
  const winner = results[0];
  const second = results[1];
  const third = results[2];

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden flex flex-col pt-10 pb-20 px-4 md:px-8">
      <ParticlesBackground />
      
      {/* Confetti effect when winner revealed */}
      {revealStep >= 4 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-3 h-3 bg-yellow-400 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animation: `confetti-fall ${Math.random() * 3 + 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#facc15', '#38bdf8', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)],
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        <AnimatePresence>
          {revealStep >= 1 && (
            <motion.h1 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] mb-16 text-center tracking-tighter"
            >
              THE RESULTS ARE IN
            </motion.h1>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col md:flex-row items-end justify-center gap-6 mb-16 h-[400px]">
          {/* Second Place */}
          <AnimatePresence>
            {revealStep >= 3 && second && (
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1"
              >
                <div className="glass-card w-full p-6 rounded-t-3xl border-t border-l border-r border-gray-400/50 bg-gradient-to-b from-gray-800/80 to-[#0a0e27] text-center shadow-[0_0_30px_rgba(156,163,175,0.2)] h-[250px] flex flex-col justify-end relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gray-300 border-4 border-[#0a0e27] flex items-center justify-center z-10 shadow-lg">
                    <span className="text-2xl font-black text-gray-800">2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">{second.startupName}</h3>
                  <p className="text-xl font-black text-gray-300 mb-1">{second.totalCredits.toLocaleString()} CR</p>
                  <p className="text-sm text-gray-500">{second.investorCount} Investors</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* First Place */}
          <AnimatePresence>
            {revealStep >= 4 && winner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 150 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="w-full md:w-2/5 flex flex-col items-center order-1 md:order-2 z-20"
              >
                <div className="absolute -top-20">
                  <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                </div>
                <div className="glass-card w-full p-8 rounded-t-3xl border border-yellow-500/50 bg-gradient-to-b from-yellow-900/60 to-[#0a0e27] text-center shadow-[0_0_50px_rgba(234,179,8,0.3)] h-[320px] flex flex-col justify-end relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-yellow-400 border-4 border-[#0a0e27] flex items-center justify-center z-10 shadow-lg">
                    <span className="text-4xl font-black text-yellow-900">1</span>
                  </div>
                  <Star className="absolute top-4 right-4 w-6 h-6 text-yellow-500 opacity-50" />
                  <Star className="absolute top-8 left-4 w-4 h-4 text-yellow-500 opacity-30" />
                  <h2 className="text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">Grand Winner</h2>
                  <h3 className="text-3xl font-black text-white mb-4 line-clamp-2 leading-tight">{winner.startupName}</h3>
                  <div className="inline-block bg-black/40 py-2 px-6 rounded-xl border border-yellow-500/30 mb-2">
                    <p className="text-3xl font-black text-yellow-400">{winner.totalCredits.toLocaleString()} CR</p>
                  </div>
                  <p className="text-gray-400 font-medium">{winner.investorCount} Investors Backed</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Third Place */}
          <AnimatePresence>
            {revealStep >= 2 && third && (
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full md:w-1/3 flex flex-col items-center order-3"
              >
                <div className="glass-card w-full p-6 rounded-t-3xl border-t border-l border-r border-amber-700/50 bg-gradient-to-b from-amber-900/50 to-[#0a0e27] text-center shadow-[0_0_30px_rgba(217,119,6,0.15)] h-[210px] flex flex-col justify-end relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-amber-600 border-4 border-[#0a0e27] flex items-center justify-center z-10 shadow-lg">
                    <span className="text-2xl font-black text-amber-100">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{third.startupName}</h3>
                  <p className="text-xl font-black text-amber-500 mb-1">{third.totalCredits.toLocaleString()} CR</p>
                  <p className="text-sm text-gray-500">{third.investorCount} Investors</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Full Table */}
        <AnimatePresence>
          {revealStep >= 5 && results.length > 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-12 glass-card rounded-3xl border border-gray-800 p-6 md:p-8"
            >
              <h3 className="text-xl font-bold text-gray-300 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2" /> Complete Rankings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.slice(3).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                    <div className="flex items-center">
                      <span className="w-8 text-gray-500 font-bold">#{idx + 4}</span>
                      <span className="font-bold text-gray-200">{item.startupName}</span>
                    </div>
                    <span className="font-bold text-cyan-400">{item.totalCredits.toLocaleString()} CR</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PublicResults;
