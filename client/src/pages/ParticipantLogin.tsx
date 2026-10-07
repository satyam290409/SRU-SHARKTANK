import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

const ParticipantLogin = () => {
  const [name, setName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !enrollmentNumber || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await login('participant', { name, enrollmentNumber, password });
      if (result.success) {
        toast.success('Login successful');
        navigate('/participant/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl border border-gray-800 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#0a0e27] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Rocket className="w-10 h-10 text-cyan-400" />
        </div>

        <div className="text-center mt-12 mb-8 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Participant Portal</h2>
          <p className="text-cyan-200/60">Pitch your startup. Track your investment.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Enrollment Number</label>
            <input
              type="text"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              className="input-field uppercase"
              placeholder="e.g. 21X01A0123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Access Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Provided by Admin"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center mt-4"
          >
            {isLoading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Enter Portal'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ParticipantLogin;
