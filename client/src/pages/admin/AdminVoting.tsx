import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { Play, Pause, Square, SkipForward, RotateCcw, Lock, Trophy, EyeOff } from 'lucide-react';

const AdminVoting = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [confirmAction, setConfirmAction] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.getAdminVotingStatus();
      setStatus(res.data);
    } catch (error) {
      toast.error('Failed to load voting status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // In a real app, we'd use sockets here to update voter count
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async () => {
    if (!confirmAction) return;
    
    try {
      switch (confirmAction.type) {
        case 'setStatus':
          if (confirmAction.payload === 'open') await api.openVoting();
          else if (confirmAction.payload === 'paused') await api.pauseVoting();
          else if (confirmAction.payload === 'closed') await api.closeVoting();
          toast.success(`Voting ${confirmAction.payload}`);
          break;
        case 'leaderboardVisibility':
          await api.setLeaderboardVisibility(confirmAction.payload);
          toast.success(`Leaderboard set to ${confirmAction.payload}`);
          break;
        case 'revealResults':
          if (confirmAction.payload) await api.revealResults();
          else await api.hideResults();
          toast.success(`Results ${confirmAction.payload ? 'revealed' : 'hidden'}`);
          break;
      }
      fetchStatus();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setConfirmAction(null);
    }
  };

  if (loading) return <AdminLayout title="Voting Control"><div className="p-8 text-center">Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Voting Control">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Main Status */}
        <div className="glass-card p-8 rounded-3xl border border-gray-800 text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 ${
            status?.votingStatus === 'open' ? 'bg-green-500' :
            status?.votingStatus === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          
          <h2 className="text-gray-400 font-bold tracking-widest uppercase mb-2">System Status</h2>
          <div className={`text-6xl font-black mb-6 ${
            status?.votingStatus === 'open' ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' :
            status?.votingStatus === 'paused' ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 
            'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]'
          }`}>
            {status?.votingStatus?.toUpperCase() || 'UNKNOWN'}
          </div>
          
          <div className="inline-block px-6 py-3 bg-gray-900/80 rounded-2xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Total Votes Cast</p>
            <div className="text-3xl font-bold text-white">
              <AnimatedCounter value={status?.votersSubmitted || 0} /> <span className="text-gray-600 text-xl">/ {status?.totalVoters || 0}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="glass-card p-6 rounded-3xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Core Controls</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={() => setConfirmAction({ type: 'setStatus', payload: 'open', title: 'Open Voting', msg: 'This will allow voters to submit their investments.' })}
              disabled={status?.votingStatus === 'open'}
              className="py-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold border border-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
            >
              <Play className="w-6 h-6" /> OPEN VOTING
            </button>
            <button 
              onClick={() => setConfirmAction({ type: 'setStatus', payload: 'paused', title: 'Pause Voting', msg: 'This will temporarily stop new votes from being submitted.' })}
              disabled={status?.votingStatus === 'paused'}
              className="py-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl font-bold border border-yellow-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
            >
              <Pause className="w-6 h-6" /> PAUSE VOTING
            </button>
            <button 
              onClick={() => setConfirmAction({ type: 'setStatus', payload: 'closed', title: 'Close Voting', msg: 'This will permanently end the voting session.' })}
              disabled={status?.votingStatus === 'closed'}
              className="py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
            >
              <Square className="w-6 h-6" /> CLOSE VOTING
            </button>
            <button 
              className="py-4 bg-gray-800/50 text-gray-500 rounded-xl font-bold border border-gray-800 cursor-not-allowed flex flex-col items-center justify-center gap-2"
            >
              <Lock className="w-6 h-6" /> LOCK VOTES
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Visibility */}
        <div className="glass-card p-6 rounded-3xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Projector Leaderboard</h3>
          <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
            {['hidden', 'live', 'frozen', 'final'].map((vis) => (
              <button
                key={vis}
                onClick={() => setConfirmAction({ type: 'leaderboardVisibility', payload: vis, title: `Set Leaderboard ${vis}`, msg: `Change public leaderboard to ${vis}?` })}
                className={`flex-1 py-3 text-sm font-bold uppercase rounded-lg transition-all ${
                  status?.leaderboardVisibility === vis 
                    ? 'bg-cyan-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {vis}
              </button>
            ))}
          </div>
        </div>

        {/* Results Reveal */}
        <div className="glass-card p-6 rounded-3xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Final Results</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => setConfirmAction({ type: 'revealResults', payload: true, title: 'Reveal Results', msg: 'This will trigger the dramatic reveal animation on the public results page!' })}
              disabled={status?.resultsRevealed}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" /> REVEAL RESULTS
            </button>
            <button 
              onClick={() => setConfirmAction({ type: 'revealResults', payload: false, title: 'Hide Results', msg: 'Hide results from the public page?' })}
              disabled={!status?.resultsRevealed}
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-gray-700"
            >
              <EyeOff className="w-5 h-5" /> HIDE
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!confirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.msg || ''}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
        variant={confirmAction?.payload === 'closed' ? 'danger' : 'warning'}
      />
    </AdminLayout>
  );
};

export default AdminVoting;
