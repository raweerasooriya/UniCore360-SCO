import React, { useState, useEffect, useRef } from 'react';
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
  MapPin,
  Users,
  Grid3x3,
  X,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';

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
      'ACTIVE': 'bg-emerald-50 text-emerald-700 border-emerald-100',
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

const PriorityBadge = ({ priority }) => {
  const styles = { 'HIGH': 'bg-red-50 text-red-700', 'MEDIUM': 'bg-amber-50 text-amber-700', 'LOW': 'bg-emerald-50 text-emerald-700' };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[priority] || ''}`}>{priority}</span>;
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
  const [bookingDialog, setBookingDialog] = useState({ open: false, resource: null });
  const [bookingForm, setBookingForm] = useState({ date: '', purpose: '', attendees: '' });
  const [bookingTime, setBookingTime] = useState({ start: '09:00', end: '10:00' }); // new
  const [reportDialog, setReportDialog] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const navigate = useNavigate();
  const notificationPanelRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Ticket related state
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  // Report issue form state
  const [reportForm, setReportForm] = useState({
    title: '', category: '', description: '', priority: 'MEDIUM', contactEmail: '', location: ''
  });
  const [reportImages, setReportImages] = useState([]);
  const [submittingReport, setSubmittingReport] = useState(false);

  const name = localStorage.getItem('name') || 'User';
  const userId = parseInt(localStorage.getItem('userId')) || null;

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'USER') {
      navigate('/login');
    }
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
  if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const resourcesRes = await api.get('/resources');
      setResources(resourcesRes.data);
      const bookingsRes = await api.get('/bookings/my');
      setMyBookings(bookingsRes.data);
      await fetchMyTickets();   // <-- ADD THIS LINE
      await fetchUserNotifications();
      // ... rest (notifications, etc.)
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  

  // Fetch user's tickets
  const fetchMyTickets = async () => {
    setTicketsLoading(true);
    try {
      const response = await api.get('/tickets/my');
      setMyTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Fetch user's notifications
  const fetchUserNotifications = async () => {
    try {
      const response = await api.get(`/notifications/user/${userId}`);
      setNotifications(response.data);
      const unreadRes = await api.get(`/notifications/unread-count?userId=${userId}`);
      setUnreadCount(unreadRes.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };
  

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await api.put(`/notifications/read-all?userId=${userId}`);
      await fetchUserNotifications();
      if (notificationPanelRef.current) {
        notificationPanelRef.current.refresh();
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  // Create a new ticket (with attachments)
  const createTicket = async (formData) => {
    try {
      const response = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchMyTickets(); // refresh list
      return response.data;
    } catch (err) {
      console.error('Ticket creation failed', err);
      throw err;
    }
  };

  // Fetch single ticket details
  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      setSelectedTicket(response.data);
      setTicketDetailsOpen(true);
    } catch (err) {
      console.error('Failed to fetch ticket details', err);
      alert('Could not load ticket details');
    }
  };

  // Add comment to ticket
  const addComment = async (ticketId, text) => {
    setSubmittingComment(true);
    try {
      await api.post(`/tickets/${ticketId}/comments`, { text });
      // refresh ticket details
      await fetchTicketDetails(ticketId);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Could not add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCancelBooking = async (id) => {
      if (window.confirm('Are you sure you want to cancel this booking?')) {
          try {
              await api.put(`/bookings/${id}/cancel`);
              await fetchUserData();
          } catch (err) {
              console.error('Cancel failed', err);
              alert('Could not cancel booking. Please try again.');
          }
      }
  };

  const handleRequestBooking = async () => {
      try {
          const timeRange = `${bookingTime.start}-${bookingTime.end}`;
          const payload = {
              resourceId: bookingDialog.resource.id,
              date: bookingForm.date,
              timeRange: timeRange,
              purpose: bookingForm.purpose,
              attendees: bookingForm.attendees ? parseInt(bookingForm.attendees) : null
          };
          // To this (Ensure it matches the route defined in your Spring Boot/Express controller):
          await api.post('/bookings', payload);
          await fetchUserData();
          setBookingDialog({ open: false, resource: null });
          setBookingForm({ date: '', purpose: '', attendees: '' });
          setBookingTime({ start: '09:00', end: '10:00' });
      } catch (err) {
          console.error('Booking failed', err);
          alert(err.response?.data?.message || 'Booking failed. Please try again.');
      }
  };

  const handleReportIssue = async () => {
    alert('Issue reported successfully! (Mock)');
    setReportDialog(false);
    setReportForm({ category: '', description: '', priority: 'MEDIUM', contactEmail: '' });
    setImageFiles([]);
  };

  // ---------- Render Overview ----------
  const renderOverview = () => (
    <div className="space-y-8">
      <section className="bg-blue-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 max-w-2xl">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black mb-4 tracking-tight">
            Welcome back, {name}! 👋
          </motion.h1>
          <p className="text-blue-100 text-lg font-medium leading-relaxed">
            Your campus operations are at your fingertips. Manage your bookings, browse facilities, and report issues in real-time.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2" />
        <GraduationCap className="absolute right-12 bottom-8 text-white/10" size={120} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard icon={Search} title="Browse & Book" description="Find available rooms, labs, and equipment for your next session." colorClass="bg-blue-600" onClick={() => setActiveView('browse-book')} />
        <ActionCard icon={CalendarDays} title="My Bookings" description="Track the status of your current and upcoming resource requests." colorClass="bg-amber-600" onClick={() => setActiveView('my-bookings')} />
        <ActionCard icon={PlusCircle} title="Report Issue" description="Submit incident tickets for maintenance with image attachments." colorClass="bg-zinc-900" onClick={() => setActiveView('report-issue')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Bell size={20} className="text-blue-600" /> Notifications
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-zinc-300" />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className={`p-4 rounded-2xl border transition-all ${!notif.read ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-white border-zinc-100'}`}>
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
            {notifications.filter(n => !n.read).length > 0 && (
              <button 
                onClick={markAllNotificationsAsRead} 
                className="w-full mt-6 py-3 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="bg-zinc-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10"><h3 className="text-lg font-bold mb-2">Need Help?</h3><p className="text-zinc-400 text-sm mb-6">Our support team is available 24/7 for any campus issues.</p>
              <button 
                onClick={() => setActiveView('report-issue')} 
                className="w-full py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all"
              >
                Contact Support
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 blur-[20px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- Browse & Book View ----------
  const renderBrowseBook = () => (
    <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2"><Building2 size={20} className="text-blue-600" /> Available Resources</h2>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} /><input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs outline-none focus:ring-2 focus:ring-blue-600/10" /></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest"><tr><th className="px-8 py-4">Name & Type</th><th className="px-8 py-4">Details</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {resources.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50/50">
                <td className="px-8 py-5"><div className="font-bold">{r.name}</div><div className="text-[10px] text-zinc-400 uppercase">{r.type}</div></td>
                <td className="px-8 py-5"><div className="flex items-center gap-4 text-sm"><MapPin size={14} /> {r.location} {r.capacity && <><Users size={14} /> {r.capacity}</>}</div></td>
                <td className="px-8 py-5"><StatusBadge status={r.status} /></td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => setBookingDialog({ open: true, resource: r })} disabled={r.status !== 'ACTIVE'} className={`px-4 py-2 rounded-xl text-xs font-bold ${r.status === 'ACTIVE' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}>Book Now</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Booking Dialog with time dropdowns */}
      <AnimatePresence>
        {bookingDialog.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBookingDialog({ open: false, resource: null })} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-black mb-4">Book {bookingDialog.resource?.name}</h3>
                <div className="space-y-4">
                  <div><label className="block text-xs font-black mb-1">Date</label><input type="date" className="w-full p-3 bg-zinc-50 border rounded-xl" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-black mb-1">Start</label>
                      <select value={bookingTime.start} onChange={e => setBookingTime({...bookingTime, start: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl">
                        {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black mb-1">End</label>
                      <select value={bookingTime.end} onChange={e => setBookingTime({...bookingTime, end: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl">
                        {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="block text-xs font-black mb-1">Purpose</label><textarea rows={2} className="w-full p-3 bg-zinc-50 border rounded-xl" value={bookingForm.purpose} onChange={e => setBookingForm({...bookingForm, purpose: e.target.value})} /></div>
                  <div><label className="block text-xs font-black mb-1">Expected Attendees</label><input type="number" className="w-full p-3 bg-zinc-50 border rounded-xl" value={bookingForm.attendees} onChange={e => setBookingForm({...bookingForm, attendees: e.target.value})} /></div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setBookingDialog({ open: false, resource: null })} className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold">Cancel</button>
                  <button onClick={handleRequestBooking} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Submit Request</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  // ---------- My Bookings View ----------
  const renderMyBookings = () => (
    <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-zinc-100">
        <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2"><CalendarDays size={20} className="text-amber-600" /> My Bookings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest"><tr><th className="px-8 py-4">Resource</th><th className="px-8 py-4">Date & Time</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {myBookings.map(b => (
              <tr key={b.id} className="hover:bg-zinc-50/50">
                <td className="px-8 py-5"><div className="font-bold">{b.resource?.name || 'Unknown'}</div></td>
                <td className="px-8 py-5"><div className="text-sm">{b.bookingDate}</div><div className="text-xs text-zinc-400">{b.timeRange}</div></td>
                <td className="px-8 py-5"><StatusBadge status={b.status} /></td>
                <td className="px-8 py-5 text-right">{b.status === 'APPROVED' && (<button onClick={() => handleCancelBooking(b.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-xl text-xs font-bold">Cancel</button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ---------- Report Issue View ----------
  const renderReportIssue = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmittingReport(true);
      const formData = new FormData();
      formData.append('title', reportForm.title);
      formData.append('description', reportForm.description);
      formData.append('priority', reportForm.priority);
      formData.append('category', reportForm.category);
      formData.append('location', reportForm.location);
      formData.append('contactEmail', reportForm.contactEmail);
      reportImages.forEach(file => formData.append('attachments', file));

      try {
        await createTicket(formData);
        setSuccessMessage('✅ Ticket created successfully!');
        setReportForm({ title: '', category: '', description: '', priority: 'MEDIUM', contactEmail: '', location: '' });
        setReportImages([]);
        setActiveView('my-reports');   // switch to My Reports tab
      } catch (err) {
        setSuccessMessage('❌ Failed to create ticket. Please try again.');
      } finally {
        setSubmittingReport(false);
      }
    };

    
    return (
      <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-zinc-100">
          <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <PlusCircle size={20} className="text-zinc-900" /> Report an Issue
          </h2>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black mb-1">Title *</label>
              <input type="text" required value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black mb-1">Category *</label>
                <select required value={reportForm.category} onChange={e => setReportForm({...reportForm, category: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl">
                  <option value="">Select</option>
                  <option>EQUIPMENT</option><option>FACILITY</option><option>NETWORK</option><option>OTHER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black mb-1">Priority *</label>
                <select value={reportForm.priority} onChange={e => setReportForm({...reportForm, priority: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl">
                  <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black mb-1">Location *</label>
              <input type="text" required value={reportForm.location} onChange={e => setReportForm({...reportForm, location: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-black mb-1">Description *</label>
              <textarea rows={3} required value={reportForm.description} onChange={e => setReportForm({...reportForm, description: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-black mb-1">Contact Email *</label>
              <input type="email" required value={reportForm.contactEmail} onChange={e => setReportForm({...reportForm, contactEmail: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-black mb-1">Images (max 3)</label>
              <input type="file" multiple accept="image/*" onChange={e => setReportImages(Array.from(e.target.files).slice(0,3))} className="w-full" />
            </div>
            <button type="submit" disabled={submittingReport} className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-50">
              {submittingReport ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderMyReports = () => (
    <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-zinc-100">
        <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
          <Ticket size={20} className="text-blue-600" /> My Reports
        </h2>
      </div>
      {ticketsLoading ? (
        <div className="p-8 text-center">Loading reports...</div>
      ) : myTickets.length === 0 ? (
        <div className="p-12 text-center text-zinc-400">No reports submitted yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">ID</th>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Priority</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Created</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {myTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-zinc-50/50">
                  <td className="px-8 py-5 text-sm font-mono">#{ticket.id}</td>
                  <td className="px-8 py-5 font-medium">{ticket.title}</td>
                  <td className="px-8 py-5"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="px-8 py-5"><StatusBadge status={ticket.status} /></td>
                  <td className="px-8 py-5 text-sm text-zinc-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => fetchTicketDetails(ticket.id)}   // ✅ Now calls the same function
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Reuse the same modal – it's already defined in renderMyTickets but we must move it to the main component */}
      {/* For now, we duplicate the modal here (quick fix). But better to move it out. */}
      {ticketDetailsOpen && selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setTicketDetailsOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black">#{selectedTicket.id} - {selectedTicket.title}</h3>
                <button onClick={() => setTicketDetailsOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><span className="font-bold">Description:</span> {selectedTicket.description}</div>
                <div><span className="font-bold">Location:</span> {selectedTicket.location}</div>
                <div><span className="font-bold">Category:</span> {selectedTicket.category}</div>
                <div><span className="font-bold">Priority:</span> <PriorityBadge priority={selectedTicket.priority} /></div>
                <div><span className="font-bold">Status:</span> <StatusBadge status={selectedTicket.status} /></div>
                {selectedTicket.assignedTechnician && <div><span className="font-bold">Assigned To:</span> {selectedTicket.assignedTechnician.name}</div>}
                {selectedTicket.attachments?.length > 0 && (
                  <div><span className="font-bold">Attachments:</span> 
                  {selectedTicket.attachments.map((att, i) => <a key={i} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline">📎 {att.fileName}</a>)}</div>
                  )}
                <div className="mt-6">
                  <h4 className="font-bold mb-2">Comments</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {selectedTicket.comments?.length ? selectedTicket.comments.map(c => (
                      <div key={c.id} className="bg-zinc-50 p-3 rounded-xl">
                        <div className="text-xs font-bold">{c.user.name} <span className="text-zinc-400">{new Date(c.createdAt).toLocaleString()}</span></div>
                        <div className="text-sm mt-1">{c.text}</div>
                      </div>
                    )) : <div className="text-zinc-400 text-sm">No comments yet.</div>}
                  </div>
                  <div className="flex gap-2">
                    <textarea value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 p-3 bg-zinc-50 border rounded-xl text-sm" rows={2} placeholder="Add a comment..." />
                    <button onClick={() => addComment(selectedTicket.id, commentText)} disabled={submittingComment || !commentText.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50">Post</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyTickets = () => (
  <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-zinc-100">
        <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
          <Ticket size={20} className="text-blue-600" /> My Tickets
        </h2>
      </div>
      {ticketsLoading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : myTickets.length === 0 ? (
        <div className="p-12 text-center text-zinc-400">No tickets reported yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              <tr><th className="px-8 py-4">ID</th><th className="px-8 py-4">Title</th><th className="px-8 py-4">Priority</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Created</th><th className="px-8 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {myTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-zinc-50/50">
                  <td className="px-8 py-5 text-sm font-mono">#{ticket.id}</td>
                  <td className="px-8 py-5 font-medium">{ticket.title}</td>
                  <td className="px-8 py-5"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="px-8 py-5"><StatusBadge status={ticket.status} /></td>
                  <td className="px-8 py-5 text-sm text-zinc-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => fetchTicketDetails(ticket.id)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Details Modal */}
      {ticketDetailsOpen && selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setTicketDetailsOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black">#{selectedTicket.id} - {selectedTicket.title}</h3>
                <button onClick={() => setTicketDetailsOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><span className="font-bold">Description:</span> {selectedTicket.description}</div>
                <div><span className="font-bold">Location:</span> {selectedTicket.location}</div>
                <div><span className="font-bold">Category:</span> {selectedTicket.category}</div>
                <div><span className="font-bold">Priority:</span> <PriorityBadge priority={selectedTicket.priority} /></div>
                <div><span className="font-bold">Status:</span> <StatusBadge status={selectedTicket.status} /></div>
                {selectedTicket.assignedTechnician && <div><span className="font-bold">Assigned To:</span> {selectedTicket.assignedTechnician.name}</div>}
                {selectedTicket.attachments?.length > 0 && (
                  <div><span className="font-bold">Attachments:</span> {selectedTicket.attachments.map((att, i) => <a key={i} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline">📎 {att.fileName}</a>)}</div>
                )}
                <div className="mt-6">
                  <h4 className="font-bold mb-2">Comments</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {selectedTicket.comments?.length ? selectedTicket.comments.map(c => (
                      <div key={c.id} className="bg-zinc-50 p-3 rounded-xl">
                        <div className="text-xs font-bold">{c.user.name} <span className="text-zinc-400">{new Date(c.createdAt).toLocaleString()}</span></div>
                        <div className="text-sm mt-1">{c.text}</div>
                      </div>
                    )) : <div className="text-zinc-400 text-sm">No comments yet.</div>}
                  </div>
                  <div className="flex gap-2">
                    <textarea value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 p-3 bg-zinc-50 border rounded-xl text-sm" rows={2} placeholder="Add a comment..." />
                    <button onClick={() => addComment(selectedTicket.id, commentText)} disabled={submittingComment || !commentText.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50">Post</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            {userId ? (
              <NotificationPanel ref={notificationPanelRef} userId={userId} />
            ) : (
              <button className="relative p-2 text-zinc-500 hover:text-blue-600">
                <Bell size={20} />
              </button>
            )}
            <div className="h-8 w-px bg-zinc-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block"><div className="text-sm font-bold text-zinc-900">{name}</div><div className="text-[10px] font-bold text-blue-600 uppercase">User Dashboard</div></div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">{name.charAt(0).toUpperCase()}</div>
              <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500"><LogOut size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ TOAST MESSAGE - ADD THIS RIGHT HERE */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg font-bold text-sm flex items-center gap-2">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-zinc-200 flex-shrink-0 hidden md:block">
          <div className="sticky top-16 p-4 space-y-2">
            <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Menu</div>
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'browse-book', label: 'Browse & Book', icon: Search },
              { id: 'my-bookings', label: 'My Bookings', icon: CalendarDays },
              { id: 'report-issue', label: 'Report Issue', icon: PlusCircle },
              { id: 'my-reports', label: 'My Reports', icon: Ticket },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === item.id ? 'bg-blue-50 text-blue-700' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeView === 'overview' && renderOverview()}
              {activeView === 'browse-book' && renderBrowseBook()}
              {activeView === 'my-bookings' && renderMyBookings()}
              {activeView === 'report-issue' && renderReportIssue()}
              {activeView === 'my-reports' && renderMyReports()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <footer className="py-8 text-center text-zinc-400 text-xs font-medium">© 2026 UniCore 360 Operations Hub. Built for PAF IT3030.</footer>
    </div>
  );
}