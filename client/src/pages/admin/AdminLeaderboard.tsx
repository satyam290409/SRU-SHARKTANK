import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { getSocket } from '../../lib/socket';

const AdminLeaderboard = () => {
  const [data, setData] = useState<any>({ leaderboard: [], visibility: 'hidden' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.getAdminLeaderboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
    
    // Auto-update via socket.io
    const socket = getSocket();
    socket.on('leaderboard-update', fetchLeaderboard);
    
    const interval = setInterval(fetchLeaderboard, 10000); // Poll every 10s fallback
    return () => {
      clearInterval(interval);
      socket.off('leaderboard-update', fetchLeaderboard);
    };
  }, []);

  return (
    <AdminLayout title="Leaderboard">
      <div className="mb-6 flex justify-between items-center glass-card p-4 rounded-xl border border-gray-800">
        <div>
          <p className="text-gray-400 text-sm">Visibility Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-3 h-3 rounded-full ${data.visibility === 'live' ? 'bg-green-500 animate-pulse' : data.visibility === 'frozen' ? 'bg-blue-500' : data.visibility === 'final' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
            <span className="font-bold text-white uppercase tracking-wider">{data.visibility}</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800">
                <th className="p-4 w-20 text-center">Rank</th>
                <th className="p-4">Startup</th>
                <th className="p-4 text-right">Total Credits</th>
                <th className="p-4 w-1/3">Share</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-800/30">
                  <td className="p-4 text-center font-bold text-xl text-gray-500">#{index + 1}</td>
                  <td className="p-4 font-bold text-white">{item.startupName}</td>
                  <td className="p-4 text-right font-bold text-cyan-400">{item.totalCredits.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {data.leaderboard?.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No data available</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeaderboard;
