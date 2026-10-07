import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit, Trash2, Rocket } from 'lucide-react';

const AdminStartups = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentStartup, setCurrentStartup] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', category: '', shortDescription: '', fullDescription: '', pitchOrder: 0, status: 'active', imageUrl: '' 
  });

  const fetchData = async () => {
    try {
      const res = await api.getAdminStartups();
      setStartups(res.data || []);
    } catch (error) {
      toast.error('Failed to load startups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setCurrentStartup(null);
    setFormData({ name: '', category: '', shortDescription: '', fullDescription: '', pitchOrder: startups.length + 1, status: 'active', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (startup: any) => {
    setCurrentStartup(startup);
    setFormData({
      name: startup.name || '',
      category: startup.category || '',
      shortDescription: startup.shortDescription || '',
      fullDescription: startup.fullDescription || '',
      pitchOrder: startup.pitchOrder || 0,
      status: startup.status || 'active',
      imageUrl: startup.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (startup: any) => {
    setCurrentStartup(startup);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentStartup) {
        await api.updateStartup(currentStartup.id, formData);
        toast.success('Startup updated');
      } else {
        await api.createStartup(formData);
        toast.success('Startup created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    try {
      if (currentStartup) {
        await api.deleteStartup(currentStartup.id);
        toast.success('Startup deleted');
        setIsConfirmOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete startup');
    }
  };

  return (
    <AdminLayout title="Startups">
      <div className="flex justify-end mb-6">
        <button onClick={openAddModal} className="btn-primary py-2 px-4 rounded-lg flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add Startup
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : startups.length === 0 ? (
        <div className="text-center py-10 text-gray-500 glass-card rounded-2xl">No startups found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {startups.sort((a, b) => (a.pitchOrder || 0) - (b.pitchOrder || 0)).map((s) => (
            <div key={s.id} className="glass-card rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
              <div className="h-40 bg-gray-900 relative">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-cyan-900/20">
                    <Rocket className="w-12 h-12 text-cyan-500/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold border border-gray-700">
                  Order: #{s.pitchOrder}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white line-clamp-1">{s.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {s.status}
                  </span>
                </div>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-3 block">{s.category}</span>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">{s.shortDescription}</p>
                
                <div className="flex space-x-2 pt-4 border-t border-gray-800 mt-auto">
                  <button onClick={() => openEditModal(s)} className="flex-1 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center font-medium text-sm">
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </button>
                  <button onClick={() => openDeleteConfirm(s)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentStartup ? "Edit Startup" : "Add Startup"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Startup Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Short Description</label>
            <textarea value={formData.shortDescription} onChange={(e) => setFormData({...formData, shortDescription: e.target.value})} className="input-field h-20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Description (Optional)</label>
            <textarea value={formData.fullDescription} onChange={(e) => setFormData({...formData, fullDescription: e.target.value})} className="input-field h-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Pitch Order</label>
              <input type="number" value={formData.pitchOrder} onChange={(e) => setFormData({...formData, pitchOrder: Number(e.target.value)})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
              <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="input-field" placeholder="https://..." />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary py-3 rounded-lg font-bold mt-6">
            {currentStartup ? 'Update' : 'Create'} Startup
          </button>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Startup"
        message={`Are you sure you want to delete ${currentStartup?.name}? This action cannot be undone and will affect any existing votes.`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        variant="danger"
      />
    </AdminLayout>
  );
};

export default AdminStartups;
