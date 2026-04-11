import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Wrench, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap,
  Cpu,
  AlertCircle
} from 'lucide-react';

const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]">
        <path d="M 50 10 A 40 40 0 0 1 90 50 L 80 50 A 30 30 0 0 0 50 20 Z" fill="#1e40af" />
        <path d="M 50 90 A 40 40 0 0 1 10 50 L 20 50 A 30 30 0 0 0 50 80 Z" fill="#b45309" />
      </svg>
      <div className="relative z-10 bg-white rounded-full p-1 border-2 border-blue-800">
        <Cpu size={16} className="text-blue-800" />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl font-black tracking-tighter text-blue-900">UniCore</span>
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold text-amber-600">360</span>
        <GraduationCap size={14} className="text-amber-600 -rotate-12" />
      </div>
    </div>
  </div>
);

const RoleOption = ({ role, active, onClick, icon: Icon, colorClass }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
      active 
        ? `${colorClass} border-transparent text-white shadow-lg scale-105` 
        : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:bg-zinc-50'
    }`}
  >
    <Icon size={24} />
    <span className="text-xs font-bold uppercase tracking-wider">{role}</span>
  </button>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  const roleCredentials = {
    'USER': { username: 'user', password: 'user123', path: '/user-dashboard', color: 'bg-blue-700', icon: GraduationCap },
    'TECHNICIAN': { username: 'tech', password: 'tech123', path: '/technician-dashboard', color: 'bg-amber-600', icon: Wrench },
    'ADMIN': { username: 'admin', password: 'admin123', path: '/admin-dashboard', color: 'bg-zinc-900', icon: ShieldCheck }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const creds = roleCredentials[role];
    
    if (username === creds.username && password === creds.password) {
      const token = btoa(`${username}:${password}`);
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);
      
      // Navigate to the appropriate dashboard
      navigate(creds.path);
    } else {
      setError(`Invalid credentials for ${role}. Try ${creds.username}/${creds.password}`);
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/api/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-50/50 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl grid lg:grid-cols-1 gap-0 bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <Logo className="mb-6" />
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-zinc-500 font-medium">Smart Campus Operations Hub</p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98] mb-8 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-zinc-400">
              <span className="bg-white px-4">Or use demo account</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="flex gap-3">
              <RoleOption 
                role="User" 
                active={role === 'USER'} 
                onClick={() => { setRole('USER'); setUsername('user'); setPassword('user123'); setError(''); }}
                icon={GraduationCap}
                colorClass="bg-blue-700"
              />
              <RoleOption 
                role="Tech" 
                active={role === 'TECHNICIAN'} 
                onClick={() => { setRole('TECHNICIAN'); setUsername('tech'); setPassword('tech123'); setError(''); }}
                icon={Wrench}
                colorClass="bg-amber-600"
              />
              <RoleOption 
                role="Admin" 
                active={role === 'ADMIN'} 
                onClick={() => { setRole('ADMIN'); setUsername('admin'); setPassword('admin123'); setError(''); }}
                icon={ShieldCheck}
                colorClass="bg-zinc-900"
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-zinc-900"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-zinc-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${roleCredentials[role].color} hover:brightness-110 shadow-zinc-200`}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in as {role}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
          
          {/* Demo Credentials Toggle Button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-xs font-medium text-zinc-500 hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
            >
              {showDemo ? "▼ Hide Demo Login" : "▶ Quick Demo Login"}
            </button>
          </div>

          {/* Demo Credentials - Shown only when showDemo is true */}
          {showDemo && (
            <div className="mt-3 text-center animate-in fade-in duration-200">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setRole('USER');
                    setUsername('user');
                    setPassword('user123');
                    setError('');
                    setShowDemo(false); // optional: auto-close after selection
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline-offset-2 hover:underline transition"
                >
                  User (user / user123)
                </button>
                <span className="text-zinc-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setRole('TECHNICIAN');
                    setUsername('tech');
                    setPassword('tech123');
                    setError('');
                    setShowDemo(false);
                  }}
                  className="text-amber-600 hover:text-amber-800 font-semibold underline-offset-2 hover:underline transition"
                >
                  Technician (tech / tech123)
                </button>
                <span className="text-zinc-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setRole('ADMIN');
                    setUsername('admin');
                    setPassword('admin123');
                    setError('');
                    setShowDemo(false);
                  }}
                  className="text-zinc-700 hover:text-zinc-900 font-semibold underline-offset-2 hover:underline transition"
                >
                  Admin (admin / admin123)
                </button>
              </div>
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/" className="text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
              <ArrowRight size={16} className="rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}