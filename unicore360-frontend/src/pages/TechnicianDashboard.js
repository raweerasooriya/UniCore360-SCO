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
  ListTodo,
  Eye,
  X,
  MessageSquare
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
    'REJECTED': 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || ''}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default function TechnicianDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [unreadCount, setUnreadCount] = useState(0);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Ticket details modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Status update (inline without modal)
  const [updatingStatus, setUpdatingStatus] = useState(null);
  
  const navigate = useNavigate();
  const username = localStorage.getItem('name') || 'Technician';

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'TECHNICIAN') {
      navigate('/login');
    }
    fetchAssignedTickets();
  }, [navigate]);

  // Fetch assigned tickets from backend
  const fetchAssignedTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/technician/tickets');
      setAssignedTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch assigned tickets', err);
      setError('Could not load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status (OPEN -> IN_PROGRESS -> RESOLVED)
  const updateTicketStatus = async (ticketId, newStatus) => {
    setUpdatingStatus(ticketId);
    try {
      await api.put(`/technician/tickets/${ticketId}/status`, { status: newStatus });
      // Refresh list
      await fetchAssignedTickets();
    } catch (err) {
      console.error('Status update failed', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Fetch single ticket details (for modal)
  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.get(`/technician/tickets/${ticketId}`);
      setSelectedTicket(response.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error('Failed to fetch ticket details', err);
      alert('Could not load ticket details.');
    }
  };

  // Add comment to ticket
  const addComment = async (ticketId, text) => {
    if (!text.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/tickets/${ticketId}/comments`, { text });
      // Refresh details
      await fetchTicketDetails(ticketId);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Could not add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Computed stats
  const openTickets = assignedTickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = assignedTickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = assignedTickets.filter(t => t.status === 'RESOLVED').length;
  const totalAssigned = assignedTickets.length;

  // ---------- Panel Renderers ----------
  const renderOverview = () => (
    <div className="space-y-8">
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
        <StatCard label="In Progress" value={inProgressTickets} icon={Activity} colorClass="bg-amber-500" subtext="Active" />
        <StatCard label="Resolved" value={resolvedTickets} icon={CheckCircle2} colorClass="bg-emerald-500" subtext="Completed" />
        <StatCard label="Assigned" value={totalAssigned} icon={Ticket} colorClass="bg-zinc-900" subtext="Total Workload" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
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

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <History size={20} className="text-amber-600" />
              Recent Tickets
            </h2>
            <div className="space-y-4">
              {assignedTickets.slice(0, 3).map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <div>
                    <div className="text-sm font-bold">#{ticket.id} - {ticket.title}</div>
                    <div className="text-xs text-zinc-500">{ticket.location}</div>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              ))}
              {assignedTickets.length === 0 && <div className="text-center text-zinc-400">No tickets assigned yet.</div>}
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
        </div>
        {loading ? (
          <div className="p-12 text-center">Loading tickets...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : assignedTickets.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">No tickets assigned to you.</div>
        ) : (
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
                    <td className="px-8 py-5"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
                        <MapPin size={14} className="text-zinc-400" />
                        {ticket.location}
                      </div>
                    </td>
                    <td className="px-8 py-5"><StatusBadge status={ticket.status} /></td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => fetchTicketDetails(ticket.id)}
                          className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {ticket.status === 'OPEN' && (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                            disabled={updatingStatus === ticket.id}
                            className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                            title="Start Work"
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                        )}
                        {ticket.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, 'RESOLVED')}
                            disabled={updatingStatus === ticket.id}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                            title="Resolve Ticket"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {detailsOpen && selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailsOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black">#{selectedTicket.id} - {selectedTicket.title}</h3>
                  <button onClick={() => setDetailsOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div><span className="font-bold">Description:</span> {selectedTicket.description}</div>
                  <div><span className="font-bold">Location:</span> {selectedTicket.location}</div>
                  <div><span className="font-bold">Category:</span> {selectedTicket.category}</div>
                  <div><span className="font-bold">Priority:</span> <PriorityBadge priority={selectedTicket.priority} /></div>
                  <div><span className="font-bold">Status:</span> <StatusBadge status={selectedTicket.status} /></div>
                  {selectedTicket.user && <div><span className="font-bold">Reported by:</span> {selectedTicket.user.name} ({selectedTicket.user.email})</div>}
                  {selectedTicket.attachments?.length > 0 && (
                    <div>
                      <span className="font-bold">Attachments:</span>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {selectedTicket.attachments.map((att, idx) => (
                          <a key={idx} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                            📎 {att.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="font-bold">Comments</span>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {selectedTicket.comments?.length ? selectedTicket.comments.map(c => (
                        <div key={c.id} className="bg-zinc-50 p-3 rounded-xl">
                          <div className="text-xs font-bold">{c.user?.name} <span className="text-zinc-400">{new Date(c.createdAt).toLocaleString()}</span></div>
                          <div className="text-sm mt-1">{c.text}</div>
                        </div>
                      )) : <div className="text-zinc-400 text-sm">No comments yet.</div>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 p-3 bg-zinc-50 border rounded-xl text-sm"
                        rows={2}
                        placeholder="Add a comment..."
                      />
                      <button
                        onClick={() => addComment(selectedTicket.id, commentText)}
                        disabled={submittingComment || !commentText.trim()}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
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

      <div className="flex flex-1">
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

      <footer className="py-8 text-center text-zinc-400 text-xs font-medium">
        © 2026 UniCore 360 Operations Hub. Built for PAF IT3030.
      </footer>
    </div>
  );
}