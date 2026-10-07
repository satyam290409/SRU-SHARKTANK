import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Rocket, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../components/ui/ParticlesBackground';

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden flex flex-col items-center justify-center pt-10 pb-20 px-4">
      <ParticlesBackground />
      
      <motion.div 
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <span className="px-4 py-1.5 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest backdrop-blur-sm">
            SIC • SR UNIVERSITY
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-2 tracking-tighter">
          SRU
        </motion.h1>

        <motion.h2 variants={itemVariants} className="text-xl md:text-3xl font-bold text-gray-300 tracking-widest mb-6">
          STARTUP & INNOVATION CLUB
        </motion.h2>

        <motion.h3 variants={itemVariants} className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 mb-6 drop-shadow-lg">
          MINI SHARK TANK
        </motion.h3>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-cyan-100/80 font-light tracking-widest mb-10 type-writer-effect">
          PITCH IT. DEFEND IT. WIN IT.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16">
          <div className="px-6 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-300 font-bold tracking-wider backdrop-blur-md relative overflow-hidden">
            7 OCTOBER 2026
            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="px-6 py-2 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 font-bold tracking-wider backdrop-blur-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            LIVE EVENT
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
          <div onClick={() => navigate('/admin/login')} className="glass-card p-8 rounded-2xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 border border-gray-800 hover:border-blue-500/50">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2 text-left">Admin Login</h4>
            <p className="text-gray-400 text-sm mb-6 text-left">Control the event, manage participants, and reveal results.</p>
            <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300">
              Access Portal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div onClick={() => navigate('/participant/login')} className="glass-card p-8 rounded-2xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 border border-gray-800 hover:border-cyan-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Rocket className="w-7 h-7 text-cyan-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2 text-left">Participant Login</h4>
            <p className="text-gray-400 text-sm mb-6 text-left">View your startup profile, rank, and live investment stats.</p>
            <div className="flex items-center text-cyan-400 font-medium group-hover:text-cyan-300">
              Access Portal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div onClick={() => navigate('/voter/login')} className="glass-card p-8 rounded-2xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 border border-gray-800 hover:border-yellow-500/50">
            <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wallet className="w-7 h-7 text-yellow-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2 text-left">Voter Login</h4>
            <p className="text-gray-400 text-sm mb-6 text-left">Invest your virtual credits in your favorite startups.</p>
            <div className="flex items-center text-yellow-400 font-medium group-hover:text-yellow-300">
              Access Portal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-20 text-gray-500 tracking-[0.3em] text-sm font-bold">
          IDEAS &rarr; ACTION &rarr; IMPACT
        </motion.div>
      </motion.div>

      {/* Background waves */}
      <div className="absolute bottom-0 left-0 w-full h-64 overflow-hidden pointer-events-none z-0 opacity-30">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.65,131.25,201.33,121.38,242.49,115.65,282.88,88.75,321.39,56.44Z" fill="url(#grad1)"></path>
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default LandingPage;
