import React, { useEffect, useState } from 'react';
import { Rocket, Users, Vote, TrendingUp, Play, Pause, Square, Trophy } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: 'Total Startups', value: stats?.totalStartups || 0, icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'Total Participants', value: stats?.totalParticipants || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Total Voters', value: stats?.totalVoters || 0, icon: Vote, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Credits Invested', value: stats?.totalCreditsInvested || 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-white">
                <AnimatedCounter value={stat.value} duration={2} />
              </h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Status Section */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-6">Event Status</h3>
          <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 rounded-xl border border-gray-800 mb-6">
            <span className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">Current Phase</span>
            <div className={`text-4xl font-black ${
              stats?.votingStatus === 'open' ? 'text-green-400' :
              stats?.votingStatus === 'paused' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {stats?.votingStatus?.toUpperCase() || 'CLOSED'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/admin/voting')} className="btn-primary py-3 rounded-xl font-bold flex items-center justify-center">
              <Play className="w-4 h-4 mr-2" /> Manage Voting
            </button>
            <button onClick={() => navigate('/admin/results')} className="btn-gold py-3 rounded-xl font-bold flex items-center justify-center">
              <Trophy className="w-4 h-4 mr-2" /> View Results
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((log: any, index: number) => (
                <div key={index} className="flex items-start pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mr-3">
                    <Rocket className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
