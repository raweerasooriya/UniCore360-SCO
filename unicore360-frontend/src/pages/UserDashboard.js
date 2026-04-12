import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  CalendarDays, 
  Ticket, 
  Bell, 
  LogOut, 
  Search, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  LayoutDashboard,
  GraduationCap,
  Cpu,
  User as UserIcon,
  MapPin,
  Users,
  List,
  Grid3x3
} from 'lucide-react';
import api from '../services/api';

const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]">
        <path d="M 50 10 A 40 40 0 0 1 90 50 L 80 50 A 30 30 0 0 0 50 20 Z" fill="#1e40af" />
        <path d="M 50 90 A 40 40 0 0 1 10 50 L 20 50 A 30 30 0 0 0 50 80 Z" fill="#b45309" />
      </svg>
      <div className="relative z-10 bg-white rounded-full p-1 border-2 border-blue-800">
        <Cpu size={12} className="text-blue-800" />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-lg font-black tracking-tighter text-blue-900">UniCore</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-amber-600">360</span>
        <GraduationCap size={10} className="text-amber-600 -rotate-12" />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'AVAILABLE': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-100',
    'BOOKED': 'bg-amber-50 text-amber-700 border-amber-100',
    'REJECTED': 'bg-red-50 text-red-700 border-red-100',
    'MAINTENANCE': 'bg-red-50 text-red-700 border-red-100',
    'CANCELLED': 'bg-zinc-50 text-zinc-600 border-zinc-100',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || 'bg-zinc-50 text-zinc-600 border-zinc-100'}`}>
      {status}
    </span>
  );
};

const ActionCard = ({ icon: Icon, title, description, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className="group p-6 bg-white border border-zinc-200 rounded-3xl hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left"
  >
    <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-zinc-900 mb-1">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed mb-4">{description}</p>
    <div className="flex items-center text-blue-600 text-sm font-bold group-hover:gap-2 transition-all">
      Get Started <ChevronRight size={16} />
    </div>
  </button>
);

export default function UserDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myBookings, setMyBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const username  = localStorage.getItem('name') || 'User';

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'USER') {
      navigate('/login');
    }
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      // Mock data (replace with real API later)
      setNotifications([
        { id: 1, title: 'Booking Approved', message: 'Your request for Conference Room A has been approved.', createdAt: new Date().toISOString(), read: false },
        { id: 2, title: 'Maintenance Update', message: 'Lab 101 is now under maintenance.', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
      ]);
      setUnreadCount(1);
      
      setMyBookings([
        { id: 1, resource: 'Conference Room A', date: '2026-03-15', time: '10:00-12:00', status: 'APPROVED' },
        { id: 2, resource: 'Lab 101', date: '2026-03-16', time: '14:00-16:00', status: 'PENDING' },
        { id: 3, resource: 'Projector', date: '2026-03-17', time: '09:00-11:00', status: 'APPROVED' },
      ]);
      
      setResources([
        { id: 1, name: 'Conference Room A', type: 'ROOM', capacity: 20, location: 'Building 1', status: 'AVAILABLE' },
        { id: 2, name: 'Lab 101', type: 'LAB', capacity: 30, location: 'Building 2', status: 'AVAILABLE' },
        { id: 3, name: 'Projector', type: 'EQUIPMENT', capacity: null, location: 'AV Room', status: 'AVAILABLE' },
        { id: 4, name: 'Meeting Room B', type: 'ROOM', capacity: 10, location: 'Building 1', status: 'MAINTENANCE' },
      ]);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ---------- Render Overview ----------
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="bg-blue-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-4 tracking-tight"
          >
            Welcome back, {username}! 👋
          </motion.h1>
          <p className="text-blue-100 text-lg font-medium leading-relaxed">
            Your campus operations are at your fingertips. Manage your bookings, browse facilities, and report issues in real-time.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2" />
        <GraduationCap className="absolute right-12 bottom-8 text-white/10" size={120} />
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          icon={Search}
          title="Browse & Book"
          description="Find available rooms, labs, and equipment for your next session."
          colorClass="bg-blue-600"
          onClick={() => {}}
        />
        <ActionCard 
          icon={CalendarDays}
          title="My Bookings"
          description="Track the status of your current and upcoming resource requests."
          colorClass="bg-amber-600"
          onClick={() => {}}
        />
        <ActionCard 
          icon={PlusCircle}
          title="Report Issue"
          description="Submit incident tickets for maintenance with image attachments."
          colorClass="bg-zinc-900"
          onClick={() => {}}
        />
      </div>

      {/* Notifications & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Bell size={20} className="text-blue-600" />
              Notifications
            </h2>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-zinc-300" />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      notif.read ? 'bg-white border-zinc-100' : 'bg-blue-50/50 border-blue-100 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-zinc-900">{notif.title}</h4>
                      {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2">{notif.message}</p>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-6 py-3 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors">
              Mark all as read
            </button>
          </div>
        </div>

        {/* Support Widget */}
        <div>
          <div className="bg-zinc-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-zinc-400 text-sm mb-6">Our support team is available 24/7 for any campus issues.</p>
              <button className="w-full py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all">
                Contact Support
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 blur-[20px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- Render Resources & Bookings ----------
  const renderResourcesBookings = () => (
    <div className="space-y-8">
      {/* Recent Bookings Table */}
      <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            My Bookings
          </h2>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Resource</th>
                <th className="px-8 py-4">Date & Time</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {myBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-zinc-900">{booking.resource}</div>
                   </td>
                  <td className="px-8 py-5">
                    <div className="text-sm text-zinc-500 font-medium">{booking.date}</div>
                    <div className="text-xs text-zinc-400">{booking.time}</div>
                   </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={booking.status} />
                   </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Resources Table */}
      <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            Available Resources
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs outline-none focus:ring-2 focus:ring-blue-600/10"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Name & Type</th>
                <th className="px-8 py-4">Details</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-zinc-900">{resource.name}</div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{resource.type}</div>
                   </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {resource.location}</span>
                      {resource.capacity && <span className="flex items-center gap-1"><Users size={14} /> {resource.capacity}</span>}
                    </div>
                   </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={resource.status} />
                   </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      disabled={resource.status !== 'AVAILABLE'}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        resource.status === 'AVAILABLE' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' 
                          : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      Book Now
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-500 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="h-8 w-px bg-zinc-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-zinc-900">{username}</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">User Dashboard</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                {username.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-zinc-200 flex-shrink-0 hidden md:block">
          <div className="sticky top-16 p-4 space-y-2">
            <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Menu</div>
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'resources-bookings', label: 'Resources & Bookings', icon: Grid3x3 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'overview' && renderOverview()}
              {activeView === 'resources-bookings' && renderResourcesBookings()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <footer className="py-8 text-center text-zinc-400 text-xs font-medium">
        © 2026 UniCore 360 Operations Hub. Built for PAF IT3030.
      </footer>
    </div>
  );
}