import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, Rocket, Vote, Play, BarChart3, 
  Trophy, Settings, FileText, LogOut, Menu, X, CheckCircle 
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Participants', path: '/admin/participants', icon: Users },
    { name: 'Startups', path: '/admin/startups', icon: Rocket },
    { name: 'Voters', path: '/admin/voters', icon: Vote },
    { name: 'Voting Control', path: '/admin/voting', icon: Play },
    { name: 'Leaderboard', path: '/admin/leaderboard', icon: BarChart3 },
    { name: 'Results', path: '/admin/results', icon: Trophy },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Activity Logs', path: '/admin/activity-logs', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#05081c] text-white overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: isMobileMenuOpen ? 0 : (window.innerWidth >= 1024 ? 0 : -280) }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:relative z-50 w-[280px] h-full glass-card border-r border-gray-800 flex flex-col"
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SRU</h2>
            <p className="text-xs text-gray-400 tracking-widest font-bold">MINI SHARK TANK</p>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  isActive ? "nav-link-active" : "nav-link"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-0">
        {/* Top Header */}
        <header className="h-20 glass-card border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-bold">
              <CheckCircle className="w-3 h-3 mr-1" /> SYSTEM ONLINE
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <span className="font-bold text-blue-400 text-sm">
                {user?.id ? 'A' : '?'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] to-[#05081c] pointer-events-none -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
