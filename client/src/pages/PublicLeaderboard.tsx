import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ParticlesBackground from '../components/ui/ParticlesBackground';
import { Trophy } from 'lucide-react';
import { getSocket } from '../lib/socket';

const PublicLeaderboard = () => {
  const [data, setData] = useState<any>({ leaderboard: [], visibility: 'hidden' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.getLeaderboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    // Auto-update via socket.io
    const socket = getSocket();
    socket.on('leaderboard-update', fetchLeaderboard);
    
    const interval = setInterval(fetchLeaderboard, 5000); // Poll every 5s fallback
    return () => {
      clearInterval(interval);
      socket.off('leaderboard-update', fetchLeaderboard);
    };
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div></div>;

  if (data.visibility === 'hidden') {
    return (
      <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden flex flex-col items-center justify-center p-4">
        <ParticlesBackground />
        <div className="relative z-10 text-center glass-card p-12 rounded-3xl max-w-2xl border border-gray-800">
          <Trophy className="w-24 h-24 text-gray-700 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white mb-4">Leaderboard Hidden</h1>
          <p className="text-gray-400 text-lg">The live leaderboard will be revealed shortly. Stay tuned!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden flex flex-col pt-10 pb-20 px-8">
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-xl text-cyan-400 font-bold tracking-widest">SRU MINI SHARK TANK</h2>
            <h1 className="text-5xl font-black text-white drop-shadow-lg">INVESTMENT LEADERBOARD</h1>
          </div>
          
          <div className={`px-6 py-3 rounded-full border flex items-center font-bold text-lg backdrop-blur-sm shadow-xl ${
            data.visibility === 'frozen' 
              ? 'bg-blue-900/30 border-blue-500/50 text-blue-400' 
              : 'bg-green-900/30 border-green-500/50 text-green-400'
          }`}>
            {data.visibility === 'frozen' ? (
              '❄️ FROZEN'
            ) : (
              <><span className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3"></span> LIVE</>
            )}
          </div>
        </header>

        <div className="space-y-4">
          {data.leaderboard?.slice(0, 10).map((item: any, index: number) => {
            const isTop3 = index < 3;
            return (
              <div 
                key={item.startupId}
                className={`flex items-center p-4 md:p-6 rounded-2xl border backdrop-blur-md transition-all duration-500 ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-900/40 to-transparent border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' :
                  index === 1 ? 'bg-gradient-to-r from-gray-800/60 to-transparent border-gray-400/50' :
                  index === 2 ? 'bg-gradient-to-r from-amber-900/40 to-transparent border-amber-700/50' :
                  'bg-gray-900/40 border-gray-800 hover:bg-gray-800/60'
                }`}
              >
                <div className="w-16 md:w-20 shrink-0 flex justify-center">
                  {index === 0 ? <Trophy className="w-10 h-10 text-yellow-400" /> :
                   index === 1 ? <Trophy className="w-8 h-8 text-gray-400" /> :
                   index === 2 ? <Trophy className="w-8 h-8 text-amber-600" /> :
                   <span className="text-3xl font-black text-gray-600">#{index + 1}</span>}
                </div>
                
                <div className="flex-1 px-4">
                  <h3 className={`text-2xl md:text-3xl font-bold ${isTop3 ? 'text-white' : 'text-gray-300'}`}>{item.startupName}</h3>
                  
                  <div className="mt-3 flex items-center">
                    <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                          'bg-gradient-to-r from-cyan-600 to-cyan-400'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="text-right w-40 md:w-56 shrink-0 flex flex-col justify-center">
                  <div className={`text-3xl md:text-5xl font-black ${
                    index === 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-amber-500' :
                    'text-cyan-400'
                  }`}>
                    <AnimatedCounter value={item.totalCredits} duration={0.5} />
                  </div>
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm mt-1">Credits</span>
                </div>
              </div>
            );
          })}
          
          {data.leaderboard?.length === 0 && (
            <div className="p-12 text-center text-xl text-gray-500 glass-card rounded-3xl border border-gray-800">
              No investment data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicLeaderboard;
