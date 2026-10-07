import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Trophy } from 'lucide-react';

const AdminResults = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.getAdminResults();
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <AdminLayout title="Results"><div className="p-8 text-center">Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Final Results">
      <div className="glass-card p-6 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Public Reveal Status</h3>
          <p className="text-gray-400 text-sm">Are results currently visible on the public /results page?</p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-bold ${data?.revealed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {data?.revealed ? 'REVEALED TO PUBLIC' : 'HIDDEN FROM PUBLIC'}
        </div>
      </div>

      {data?.results?.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((item: any, index: number) => (
            <div key={index} className={`glass-card p-6 rounded-2xl border ${index === 0 ? 'border-yellow-500/50 bg-yellow-900/10' : index === 1 ? 'border-gray-400/50 bg-gray-800/30' : index === 2 ? 'border-amber-700/50 bg-amber-900/10' : 'border-gray-800'} flex items-center`}>
              <div className="w-16 h-16 shrink-0 flex items-center justify-center mr-6">
                {index === 0 ? <Trophy className="w-12 h-12 text-yellow-400" /> : 
                 index === 1 ? <Trophy className="w-10 h-10 text-gray-400" /> :
                 index === 2 ? <Trophy className="w-8 h-8 text-amber-600" /> : 
                 <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>}
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>{item.startupName}</h3>
                <p className="text-gray-400">Total Valuation Raised</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-black ${index === 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {item.totalCredits.toLocaleString()} <span className="text-sm font-normal text-gray-500">CR</span>
                </div>
                <div className="text-sm text-gray-400">{item.investorCount} Investors</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 rounded-2xl border border-gray-800 text-center text-gray-500">
          No results data available.
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminResults;
