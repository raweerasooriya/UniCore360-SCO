import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  GraduationCap, 
  Cpu, 
  LogOut, 
  Bell, 
  ChevronRight, 
  MapPin, 
  Activity, 
  BarChart3,
  History,
  Play,
  CheckCircle,
  LayoutDashboard,
  ListTodo
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

const StatCard = ({ label, value, icon: Icon, colorClass, subtext }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex items-start justify-between group hover:border-amber-500 transition-all">
    <div>
      <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-black text-zinc-900 mb-1">{value}</div>
      <div className="text-[10px] font-bold text-zinc-500">{subtext}</div>
    </div>
    <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
  </div>
);

const PriorityBadge = ({ priority }) => {
  const styles = {
    'HIGH': 'bg-red-50 text-red-700 border-red-100',
    'MEDIUM': 'bg-amber-50 text-amber-700 border-amber-100',
    'LOW': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${styles[priority] || ''}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'OPEN': 'bg-red-50 text-red-600 border-red-100',
    'IN_PROGRESS': 'bg-amber-50 text-amber-600 border-amber-100',
    'RESOLVED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'CLOSED': 'bg-zinc-50 text-zinc-400 border-zinc-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || ''}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function TechnicianDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [unreadCount, setUnreadCount] = useState(1);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const navigate = useNavigate();

  const username  = localStorage.getItem('name') || 'Technician';

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'TECHNICIAN') {
      navigate('/login');
    }
    fetchTechnicianData();
  }, [navigate]);

  const fetchTechnicianData = async () => {
    try {
      // Mock data (replace with API call later)
      setAssignedTickets([
        { id: 101, title: 'Projector not working', category: 'EQUIPMENT', priority: 'HIGH', location: 'Room 201', status: 'OPEN', created: '2026-03-02' },
        { id: 102, title: 'AC not cooling', category: 'FACILITY', priority: 'MEDIUM', location: 'Lab 101', status: 'IN_PROGRESS', created: '2026-03-01' },
        { id: 103, title: 'Network issue', category: 'NETWORK', priority: 'HIGH', location: 'Library', status: 'OPEN', created: '2026-03-02' },
        { id: 104, title: 'Broken chair', category: 'FACILITY', priority: 'LOW', location: 'Room 105', status: 'RESOLVED', created: '2026-02-28' },
        { id: 105, title: 'Computer not booting', category: 'EQUIPMENT', priority: 'HIGH', location: 'Lab 102', status: 'OPEN', created: '2026-03-02' },
        { id: 106, title: 'Light flickering', category: 'FACILITY', priority: 'LOW', location: 'Hallway', status: 'IN_PROGRESS', created: '2026-03-01' },
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

  const handleStatusUpdate = (ticketId, newStatus) => {
    setAssignedTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
  };

  const handleOpenDialog = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionNotes('');
    setOpenDialog(true);
  };

  const handleResolveTicket = () => {
    if (selectedTicket) {
      handleStatusUpdate(selectedTicket.id, 'RESOLVED');
      setOpenDialog(false);
    }
  };

  const openTickets = assignedTickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = assignedTickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedToday = assignedTickets.filter(t => t.status === 'RESOLVED').length;
  const totalAssigned = assignedTickets.length;

  // ---------- Panel Renderers ----------
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 bg-amber-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-amber-200">
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black mb-2 tracking-tight"
            >
              Ready for work, {username}? 🔧
            </motion.h1>
            <p className="text-amber-100 text-lg font-medium">
              You have <span className="text-white font-black underline decoration-2 underline-offset-4">{openTickets} open tickets</span> that need your attention today.
            </p>
          </div>
          <Wrench className="absolute right-12 bottom-4 text-white/10" size={140} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        <StatCard label="Open" value={openTickets} icon={AlertCircle} colorClass="bg-red-500" subtext="Requires Action" />
        <StatCard label="Active" value={inProgressTickets} icon={Activity} colorClass="bg-amber-500" subtext="In Progress" />
        <StatCard label="Resolved" value={resolvedToday} icon={CheckCircle2} colorClass="bg-emerald-500" subtext="Completed Today" />
        <StatCard label="Assigned" value={totalAssigned} icon={Ticket} colorClass="bg-zinc-900" subtext="Total Workload" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-amber-600" />
              Workload by Priority
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="text-sm font-bold text-red-700">High Priority</div>
                <div className="text-xl font-black text-red-700">{assignedTickets.filter(t => t.priority === 'HIGH').length}</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="text-sm font-bold text-amber-700">Medium Priority</div>
                <div className="text-xl font-black text-amber-700">{assignedTickets.filter(t => t.priority === 'MEDIUM').length}</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="text-sm font-bold text-emerald-700">Low Priority</div>
                <div className="text-xl font-black text-emerald-700">{assignedTickets.filter(t => t.priority === 'LOW').length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <History size={20} className="text-amber-600" />
              Recent Activity
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                  <Play size={14} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Started Ticket #103</p>
                  <p className="text-[10px] text-zinc-400">10 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Resolved Ticket #101</p>
                  <p className="text-[10px] text-zinc-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <Ticket size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Assigned Ticket #107</p>
                  <p className="text-[10px] text-zinc-400">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTicketsPanel = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Ticket size={20} className="text-amber-600" />
            My Assigned Tickets
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-zinc-50 text-zinc-500 rounded-full text-xs font-bold hover:bg-zinc-100 transition-colors">Filter</button>
            <button className="px-4 py-2 bg-zinc-900 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">ID & Title</th>
                <th className="px-8 py-4">Priority</th>
                <th className="px-8 py-4">Location</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {assignedTickets.map((ticket) => (
                <tr key={ticket.id} className={`hover:bg-zinc-50/50 transition-colors group ${ticket.priority === 'HIGH' && ticket.status === 'OPEN' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="text-[10px] font-black text-zinc-400 mb-1">#{ticket.id}</div>
                    <div className="font-bold text-zinc-900">{ticket.title}</div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{ticket.category}</div>
                  </td>
                  <td className="px-8 py-5">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
                      <MapPin size={14} className="text-zinc-400" />
                      {ticket.location}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ticket.status === 'OPEN' && (
                        <button 
                          onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                          className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                          title="Start Work"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                      )}
                      {ticket.status === 'IN_PROGRESS' && (
                        <button 
                          onClick={() => handleOpenDialog(ticket)}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Resolve Ticket"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-500 hover:text-amber-600 transition-colors">
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
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Field Technician</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200">
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
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-zinc-200 flex-shrink-0 hidden md:block">
          <div className="sticky top-16 p-4 space-y-2">
            <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Navigation</div>
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'tickets', label: 'My Tickets', icon: ListTodo },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeView === item.id
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
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
              {activeView === 'tickets' && renderTicketsPanel()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Resolution Dialog */}
      <AnimatePresence>
        {openDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenDialog(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">Resolve Ticket</h3>
                    <p className="text-zinc-500 text-sm font-medium">#{selectedTicket?.id} — {selectedTicket?.title}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Resolution Notes</label>
                    <textarea 
                      autoFocus
                      rows={4}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe the fix in detail..."
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium text-zinc-900 resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setOpenDialog(false)}
                      className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleResolveTicket}
                      className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-8 text-center text-zinc-400 text-xs font-medium">
        © 2026 UniCore 360 Operations Hub. Built for PAF IT3030.
      </footer>
    </div>
  );
}