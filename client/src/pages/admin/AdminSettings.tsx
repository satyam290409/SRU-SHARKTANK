import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        setSettings(res.data);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings({ ...settings, [name]: val });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Settings"><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="System Settings">
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Event Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Event Name</label>
              <input type="text" name="eventName" value={settings.eventName || ''} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Event Date</label>
              <input type="text" name="eventDate" value={settings.eventDate || ''} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Credit Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Voter Credit Pool (Default)</label>
              <input type="number" name="creditPool" value={settings.creditPool || 0} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Virtual Investment Value (₹ per Credit)</label>
              <input type="number" name="virtualInvestmentValue" value={settings.virtualInvestmentValue || 0} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Access Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Participant Global Password</label>
              <input type="text" name="participantPassword" value={settings.participantPassword || ''} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Voter Global Password</label>
              <input type="text" name="voterPassword" value={settings.voterPassword || ''} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Voting Rules</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="preventSelfVoting" checked={settings.preventSelfVoting || false} onChange={handleChange} className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900" />
              <span className="text-gray-300">Prevent participants from voting for their own startup</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="allowVoteEditing" checked={settings.allowVoteEditing || false} onChange={handleChange} className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900" />
              <span className="text-gray-300">Allow voters to edit votes before round closes</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="btn-primary py-3 px-8 rounded-xl font-bold text-lg">
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
