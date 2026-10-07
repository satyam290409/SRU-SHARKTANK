import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { LogOut, Rocket, Trophy, TrendingUp, Users } from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const ParticipantDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getParticipantDashboard();
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-[#05081c] flex items-center justify-center"><div className="text-cyan-500">Loading...</div></div>;

  const hasStartup = !!data?.startup;

  return (
    <div className="min-h-screen bg-[#05081c] text-white p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Welcome, {user?.name || 'Participant'}</h1>
          <p className="text-gray-400 text-sm">{user?.enrollmentNumber}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 font-bold bg-red-500/10 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {hasStartup ? (
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 mr-6">
                  <Rocket className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">{data.startup.category}</span>
                  <h2 className="text-3xl font-bold">{data.startup.name}</h2>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {data.startup.fullDescription || data.startup.shortDescription}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-800">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1">Pitch Order</p>
                  <p className="text-xl font-bold">#{data.startup.pitchOrder}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1">Status</p>
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold uppercase">{data.startup.status}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-10 rounded-3xl border border-gray-800 text-center">
              <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No Startup Assigned</h2>
              <p className="text-gray-400">You haven't been assigned to a startup yet. Please contact the administrator.</p>
            </div>
          )}

          {/* If leaderboard visible to participants, show rank here */}
          {data?.performance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6 rounded-2xl border border-gray-800 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-1">Current Rank</p>
                <h3 className="text-3xl font-black text-white">#{data.performance.rank}</h3>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-gray-800 text-center">
                <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-1">Total Valuation</p>
                <h3 className="text-3xl font-black text-cyan-400"><AnimatedCounter value={data.performance.totalCredits} /></h3>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-gray-800 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-1">Investors</p>
                <h3 className="text-3xl font-black text-blue-400"><AnimatedCounter value={data.performance.investorCount} /></h3>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-gray-800 text-center">
            <h3 className="font-bold text-gray-300 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/leaderboard')} className="w-full py-3 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800 text-gray-300 font-medium flex items-center justify-center">
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" /> View Live Leaderboard
              </button>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-3xl border border-gray-800">
            <h3 className="font-bold text-gray-300 mb-4">Event Info</h3>
            <p className="text-sm text-gray-400 mb-2">Be prepared for your pitch. The voting round opens right after.</p>
            <p className="text-sm text-gray-400">Remember, you cannot vote for your own startup!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParticipantDashboard;
