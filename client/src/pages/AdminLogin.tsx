import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      const result = await login('admin', { email, password });
      if (result.success) {
        toast.success('Login successful');
        navigate('/admin/dashboard');
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl border border-gray-800 shadow-2xl relative"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#0a0e27] border border-gray-800 flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-blue-500" />
        </div>

        <div className="text-center mt-12 mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-gray-400">Sign in to manage the Shark Tank event</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@sru.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 rounded-lg font-bold text-lg flex items-center justify-center"
          >
            {isLoading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Login to Admin Panel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
