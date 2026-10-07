import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getActivityLogs();
        setLogs(res.data || []);
      } catch (error) {
        toast.error('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <AdminLayout title="System Activity">
      <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No activity recorded yet.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800">
                <th className="p-4 text-sm font-semibold text-gray-400">Timestamp</th>
                <th className="p-4 text-sm font-semibold text-gray-400">User / Entity</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Action</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, index: number) => (
                <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mr-2 ${
                        log.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                        log.role === 'participant' ? 'bg-cyan-500/20 text-cyan-400' :
                        log.role === 'voter' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {log.role || 'system'}
                      </span>
                      <span className="font-medium text-gray-300">{log.userName || log.userId || 'System'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-sm font-medium text-white">
                      <Activity className="w-4 h-4 mr-2 text-gray-500" />
                      {log.action}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400 max-w-xs truncate">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
