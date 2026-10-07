import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const AdminParticipants = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', enrollmentNumber: '', email: '', phone: '', startupId: '', status: 'active' });

  const fetchData = async () => {
    try {
      const [partsRes, startsRes] = await Promise.all([
        api.getParticipants(),
        api.getAdminStartups()
      ]);
      setParticipants(partsRes.data);
      setStartups(startsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setCurrentParticipant(null);
    setFormData({ name: '', enrollmentNumber: '', email: '', phone: '', startupId: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (participant: any) => {
    setCurrentParticipant(participant);
    setFormData({
      name: participant.name || '',
      enrollmentNumber: participant.enrollmentNumber || '',
      email: participant.email || '',
      phone: participant.phone || '',
      startupId: participant.startupId || '',
      status: participant.status || 'active'
    });
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (participant: any) => {
    setCurrentParticipant(participant);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentParticipant) {
        await api.updateParticipant(currentParticipant.id, formData);
        toast.success('Participant updated');
      } else {
        await api.createParticipant(formData);
        toast.success('Participant created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    try {
      if (currentParticipant) {
        await api.deleteParticipant(currentParticipant.id);
        toast.success('Participant deleted');
        setIsConfirmOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete participant');
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.enrollmentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Participants">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search participants..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <button onClick={openAddModal} className="btn-primary py-2 px-4 rounded-lg flex items-center whitespace-nowrap w-full md:w-auto">
          <Plus className="w-5 h-5 mr-2" /> Add Participant
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800">
                <th className="p-4 text-sm font-semibold text-gray-400">Name & Enrollment</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Startup</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredParticipants.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No participants found.</td></tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">{p.enrollmentNumber}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {startups.find(s => s.id === p.startupId)?.name || <span className="text-gray-600 italic">None</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEditModal(p)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteConfirm(p)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentParticipant ? "Edit Participant" : "Add Participant"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Enrollment Number</label>
            <input type="text" value={formData.enrollmentNumber} onChange={(e) => setFormData({...formData, enrollmentNumber: e.target.value})} className="input-field uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Startup Assignment (Optional)</label>
            <select value={formData.startupId} onChange={(e) => setFormData({...formData, startupId: e.target.value})} className="input-field">
              <option value="">-- None --</option>
              {startups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input-field">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="w-full btn-primary py-2 rounded-lg font-bold mt-4">
            {currentParticipant ? 'Update' : 'Create'} Participant
          </button>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Participant"
        message={`Are you sure you want to delete ${currentParticipant?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        variant="danger"
      />
    </AdminLayout>
  );
};

export default AdminParticipants;
