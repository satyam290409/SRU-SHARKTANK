import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Wallet, Minus, Plus, ArrowLeft, AlertTriangle } from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Modal from '../components/ui/Modal';

const VoterInvest = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [voterInfo, setVoterInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [startupsRes, statusRes, votesRes] = await Promise.all([
          api.getStartups(),
          api.getVotingStatus(),
          api.getMyVotes()
        ]);
        setStartups(startupsRes.data);
        setStatus(statusRes.data);
        setVoterInfo(votesRes.data);
        
        // Initialize allocations if user already voted (though they shouldn't edit usually)
        if (votesRes.data.hasVoted && votesRes.data.allocations) {
          const initialAlloc: Record<string, number> = {};
          votesRes.data.allocations.forEach((a: any) => {
            initialAlloc[a.startupId] = a.credits;
          });
          setAllocations(initialAlloc);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCredits = voterInfo?.totalCredits || 1000;
  const currentInvested = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const remaining = totalCredits - currentInvested;

  const handleAllocate = (startupId: string, amount: number) => {
    if (voterInfo?.hasVoted) return;
    if (status?.votingStatus !== 'open') return;

    setAllocations(prev => {
      const currentVal = prev[startupId] || 0;
      const newVal = Math.max(0, currentVal + amount);
      
      // Check if we have enough remaining for this increment
      if (amount > 0 && newVal - currentVal > remaining) {
        toast.error('Not enough credits!');
        return prev;
      }
      
      return { ...prev, [startupId]: newVal };
    });
  };

  const handleDirectInput = (startupId: string, val: string) => {
    if (voterInfo?.hasVoted || status?.votingStatus !== 'open') return;
    
    let num = parseInt(val) || 0;
    if (num < 0) num = 0;
    
    setAllocations(prev => {
      const currentVal = prev[startupId] || 0;
      const maxPossible = currentVal + remaining;
      if (num > maxPossible) num = maxPossible;
      
      return { ...prev, [startupId]: num };
    });
  };

  const submitVotes = async () => {
    setSubmitting(true);
    try {
      const formattedAllocations = Object.entries(allocations)
        .filter(([_, credits]) => credits > 0)
        .map(([startupId, credits]) => ({ startupId, credits }));

      await api.submitVote({ allocations: formattedAllocations });
      toast.success('Investments submitted successfully!', { duration: 5000 });
      setIsReviewOpen(false);
      navigate('/voter/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#05081c] text-yellow-500 flex justify-center items-center">Loading Arena...</div>;

  const isReadOnly = voterInfo?.hasVoted || status?.votingStatus !== 'open';

  return (
    <div className="min-h-screen bg-[#05081c] pb-32">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 glass-card border-b border-gray-800 p-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/voter/dashboard')} className="text-gray-400 hover:text-white p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex gap-4 md:gap-12">
            <div className="text-center">
              <p className="text-[10px] uppercase text-gray-500 font-bold">Invested</p>
              <p className="font-bold text-gray-300"><AnimatedCounter value={currentInvested} /> CR</p>
            </div>
            <div className="text-center px-4 py-1 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-[10px] uppercase text-yellow-500 font-bold">Available</p>
              <p className="font-black text-yellow-400 text-xl"><AnimatedCounter value={remaining} /> CR</p>
            </div>
          </div>
        </div>
      </div>

      {!isReadOnly && remaining === 0 && (
        <div className="bg-green-500/20 text-green-400 text-center py-2 text-sm font-bold border-b border-green-500/30">
          All credits allocated! Review and submit your investments.
        </div>
      )}
      {status?.votingStatus !== 'open' && (
        <div className="bg-red-500/20 text-red-400 text-center py-2 text-sm font-bold border-b border-red-500/30">
          Voting is currently {status?.votingStatus}. You cannot make changes.
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.map((s) => {
          const val = allocations[s.id] || 0;
          const isSelected = val > 0;
          // In a real app, we'd check if this startup belongs to this voter's enrollment
          const isOwnStartup = false; 

          return (
            <div key={s.id} className={`glass-card rounded-3xl overflow-hidden border transition-all duration-300 ${isSelected ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-gray-800'} ${isOwnStartup ? 'opacity-50 grayscale' : ''}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white line-clamp-1">{s.name}</h3>
                  <span className="text-xs px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded-md font-bold uppercase">{s.category}</span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-3 mb-6 h-12">{s.shortDescription}</p>

                {isOwnStartup ? (
                  <div className="w-full py-3 text-center bg-gray-800 text-gray-500 rounded-xl font-bold text-sm">
                    Your Startup (Cannot Invest)
                  </div>
                ) : (
                  <div className={`p-2 rounded-2xl flex items-center justify-between ${isSelected ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-gray-900 border border-gray-800'}`}>
                    <button 
                      onClick={() => handleAllocate(s.id, -5)}
                      disabled={isReadOnly || val === 0}
                      className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 text-gray-400"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <div className="flex-1 px-2 flex items-center justify-center gap-1">
                      <input 
                        type="text" 
                        value={val || ''} 
                        onChange={(e) => handleDirectInput(s.id, e.target.value)}
                        placeholder="0"
                        disabled={isReadOnly}
                        className={`w-16 text-center bg-transparent outline-none font-black text-2xl ${isSelected ? 'text-yellow-400' : 'text-gray-500'}`}
                      />
                      <span className={`text-sm font-bold ${isSelected ? 'text-yellow-500/50' : 'text-gray-600'}`}>CR</span>
                    </div>

                    <button 
                      onClick={() => handleAllocate(s.id, 5)}
                      disabled={isReadOnly || remaining === 0}
                      className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 text-gray-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Review Button */}
      {!isReadOnly && (
        <div className="fixed bottom-0 left-0 w-full glass-card border-t border-gray-800 p-4 z-40">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => setIsReviewOpen(true)}
              disabled={currentInvested === 0}
              className="w-full btn-gold py-4 rounded-xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all"
            >
              Review & Submit Investments
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Investment Summary">
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200/80 font-medium">Please review carefully. Once submitted, investments cannot be changed.</p>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {Object.entries(allocations).filter(([_, val]) => val > 0).map(([id, val]) => {
              const startup = startups.find(s => s.id === id);
              return (
                <div key={id} className="flex justify-between items-center p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="font-bold text-white">{startup?.name}</span>
                  <span className="font-black text-yellow-400">{val} CR</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl mt-4">
            <span className="text-gray-400 font-medium">Total Invested</span>
            <span className="font-black text-xl text-white">{currentInvested} CR</span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-900 rounded-xl mt-2 border border-gray-800">
            <span className="text-gray-500 font-medium">Remaining Wallet</span>
            <span className="font-bold text-gray-400">{remaining} CR</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setIsReviewOpen(false)} disabled={submitting} className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">
              Go Back
            </button>
            <button onClick={submitVotes} disabled={submitting} className="flex-1 btn-gold py-3 rounded-xl font-black">
              {submitting ? 'Submitting...' : 'Confirm & Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VoterInvest;
