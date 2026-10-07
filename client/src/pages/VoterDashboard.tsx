import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Wallet, LogOut, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const VoterDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [votesRes, statusRes] = await Promise.all([
          api.getMyVotes(),
          api.getVotingStatus()
        ]);
        setData({ votes: votesRes.data, status: statusRes.data });
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-[#05081c] flex items-center justify-center"><div className="text-yellow-500">Loading Wallet...</div></div>;

  const totalCredits = data?.votes?.totalCredits || 1000;
  const creditsUsed = data?.votes?.creditsUsed || 0;
  const remaining = totalCredits - creditsUsed;
  const hasVoted = data?.votes?.hasVoted;
  const votingOpen = data?.status?.votingStatus === 'open';

  return (
    <div className="min-h-screen bg-[#05081c] text-white p-4 md:p-8 pb-24">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Investor {user?.name}</h1>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-white p-2">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Wallet Card */}
        <div className="glass-card p-8 rounded-3xl border border-yellow-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center text-yellow-500 mb-6">
            <Wallet className="w-6 h-6 mr-2" />
            <span className="font-bold tracking-widest uppercase text-sm">Your Investment Wallet</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-2">Available Balance</p>
              <div className="text-5xl font-black text-white flex items-baseline">
                <AnimatedCounter value={remaining} /> <span className="text-lg text-yellow-500 ml-2">CR</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Invested: {creditsUsed}</span>
                <span className="text-gray-400">Total: {totalCredits}</span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-1000"
                  style={{ width: `${(creditsUsed / totalCredits) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {votingOpen && !hasVoted ? (
            <button 
              onClick={() => navigate('/voter/invest')}
              className="w-full btn-gold py-4 rounded-xl font-bold text-lg flex items-center justify-center group"
            >
              Enter Investment Arena <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : hasVoted ? (
            <div className="w-full bg-green-500/20 text-green-400 py-4 rounded-xl font-bold text-center border border-green-500/30">
              Investment Submitted Successfully
            </div>
          ) : (
            <div className="w-full bg-gray-800/50 text-gray-400 py-4 rounded-xl font-bold text-center border border-gray-700">
              Voting is currently {data?.status?.votingStatus}
            </div>
          )}
        </div>

        {/* Portfolio */}
        {hasVoted && data?.votes?.allocations?.length > 0 && (
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-gray-800">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-5 h-5 text-cyan-400 mr-2" />
              <h2 className="text-xl font-bold text-white">Your Portfolio</h2>
            </div>
            
            <div className="space-y-4">
              {data.votes.allocations.map((alloc: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                  <div className="font-bold text-lg">{alloc.startupName}</div>
                  <div className="text-yellow-400 font-bold">{alloc.credits} CR</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full glass-card border-t border-gray-800 p-4 flex justify-around md:hidden">
        <button onClick={() => navigate('/voter/dashboard')} className="flex flex-col items-center text-yellow-500">
          <Wallet className="w-6 h-6 mb-1" /> <span className="text-[10px] font-bold">Wallet</span>
        </button>
        <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center text-gray-500 hover:text-white">
          <Trophy className="w-6 h-6 mb-1" /> <span className="text-[10px] font-bold">Leaderboard</span>
        </button>
      </div>
    </div>
  );
};

export default VoterDashboard;
