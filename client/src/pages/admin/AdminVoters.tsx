import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Search, Ban, CheckCircle } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const AdminVoters = () => {
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentVoter, setCurrentVoter] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await api.getVoters();
      setVoters(res.data || []);
    } catch (error) {
      toast.error('Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openStatusConfirm = (voter: any) => {
    setCurrentVoter(voter);
    setIsConfirmOpen(true);
  };

  const handleToggleStatus = async () => {
    try {
      if (currentVoter) {
        const newStatus = currentVoter.status === 'active' ? 'inactive' : 'active';
        await api.updateVoter(currentVoter.id, { status: newStatus });
        toast.success(`Voter ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        setIsConfirmOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update voter status');
    }
  };

  const filteredVoters = voters.filter(v => 
    v.name?.toLowerCase().includes(search.toLowerCase()) || 
    v.enrollmentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: voters.length,
    submitted: voters.filter(v => v.hasVoted).length,
    pending: voters.filter(v => !v.hasVoted).length
  };

  return (
    <AdminLayout title="Voters">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Voters</p>
          <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-green-900/50 bg-green-900/10 text-center">
          <p className="text-green-400/80 text-sm font-medium mb-1">Votes Submitted</p>
          <h3 className="text-2xl font-bold text-green-400">{stats.submitted}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-yellow-900/50 bg-yellow-900/10 text-center">
          <p className="text-yellow-400/80 text-sm font-medium mb-1">Pending Votes</p>
          <h3 className="text-2xl font-bold text-yellow-400">{stats.pending}</h3>
        </div>
      </div>

      <div className="mb-6 relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search by name or enrollment..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800">
                <th className="p-4 text-sm font-semibold text-gray-400">Voter Details</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Credits (Used / Total)</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Voting Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Account</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredVoters.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No voters found.</td></tr>
              ) : (
                filteredVoters.map((v) => (
                  <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{v.name}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">{v.enrollmentNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-cyan-400">{v.creditsUsed || 0}</span>
                      <span className="text-gray-500 text-sm"> / {v.totalCredits || 1000}</span>
                    </td>
                    <td className="p-4">
                      {v.hasVoted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${v.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                        {v.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openStatusConfirm(v)} 
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          v.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {v.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={currentVoter?.status === 'active' ? "Deactivate Voter" : "Activate Voter"}
        message={`Are you sure you want to ${currentVoter?.status === 'active' ? 'deactivate' : 'activate'} ${currentVoter?.name}?`}
        onConfirm={handleToggleStatus}
        onCancel={() => setIsConfirmOpen(false)}
        variant={currentVoter?.status === 'active' ? "warning" : "info"}
      />
    </AdminLayout>
  );
};

export default AdminVoters;
