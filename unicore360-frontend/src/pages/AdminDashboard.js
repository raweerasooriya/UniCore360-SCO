import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  CalendarDays, 
  Ticket, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  UserPlus, 
  Bell, 
  LogOut, 
  Cpu, 
  GraduationCap,
  Search,
  MoreVertical,
  TrendingUp,
  Clock,
  Eye,
  ShieldCheck,
  LayoutDashboard,
  RefreshCw   
} from 'lucide-react';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';

// ---------- Logo Component ----------
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
// ---------- StatCard ----------
const StatCard = ({ label, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm group hover:border-blue-600 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} /> {trend}
        </div>
      )}
    </div>
    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-3xl font-black text-zinc-900">{value}</div>
  </div>
);

// ---------- StatusBadge ----------
const StatusBadge = ({ status }) => {
  const styles = {
    'ACTIVE': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'RESOLVED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-100',
    'MAINTENANCE': 'bg-amber-50 text-amber-700 border-amber-100',
    'IN_PROGRESS': 'bg-amber-50 text-amber-700 border-amber-100',
    'REJECTED': 'bg-red-50 text-red-700 border-red-100',
    'OPEN': 'bg-red-50 text-red-700 border-red-100',
    'INACTIVE': 'bg-zinc-50 text-zinc-500 border-zinc-100',
    'OUT_OF_SERVICE': 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${styles[status] || 'bg-zinc-50 text-zinc-500 border-zinc-100'}`}>
      {status?.replace('_', ' ') || status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    'HIGH': 'bg-red-50 text-red-700 border-red-100',
    'MEDIUM': 'bg-amber-50 text-amber-700 border-amber-100',
    'LOW': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${styles[priority] || ''}`}>
      {priority}
    </span>
  );
};

// ---------- Main AdminDashboard ----------
export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editRoleDialog, setEditRoleDialog] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const navigate = useNavigate();
  const username  = localStorage.getItem('name') || 'Admin';
  const storedUserId = localStorage.getItem('userId');
  const userId = storedUserId !== null ? parseInt(storedUserId) : null;
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ email: '', name: '', role: 'USER' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [topResources, setTopResources] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [openMenuTicketId, setOpenMenuTicketId] = useState(null);

  console.log("Admin userId:", userId);
  console.log("Raw localStorage userId:", localStorage.getItem("userId"));
  // Resources state
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceDialog, setResourceDialog] = useState({ open: false, editing: null }); // editing holds resource object or null
  const [resourceForm, setResourceForm] = useState({ name: '', type: 'ROOM', capacity: '', location: '', status: 'ACTIVE' });
  const [searchFilters, setSearchFilters] = useState({ name: '', type: '', location: '', status: '' });
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState({ open: false, bookingId: null, reason: '' });
  // Add these state variables near the top of AdminDashboard component
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [assignDialog, setAssignDialog] = useState({ open: false, ticketId: null, technicianId: '' });
  const [statusDialog, setStatusDialog] = useState({ open: false, ticketId: null, newStatus: '' });
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  

  // Fetch resources when activeView === 'resources'
  useEffect(() => {
      if (activeView === 'resources') {
          fetchResources();
      }
  }, [activeView]);

  useEffect(() => {
      if (activeView === 'bookings') {
          fetchAllBookings();
      }
  }, [activeView]);

  useEffect(() => {
    if (activeView === 'overview') {
      fetchResources();
      fetchUsers();
      fetchAllBookings();
      fetchTickets();
    }
  }, [activeView]);

  useEffect(() => {
    console.log("USER ID IN ADMIN:", userId);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuTicketId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  const fetchAllBookings = async () => {
      setBookingsLoading(true);
      try {
          const response = await api.get('/api/admin/bookings');
          setBookings(response.data);
      } catch (err) {
          console.error('Failed to fetch bookings', err);
      } finally {
          setBookingsLoading(false);
      }
  };

  const fetchTopResources = async () => {
    try {
      const response = await api.get('/admin/analytics/top-resources');
      setTopResources(response.data);
    } catch (err) {
      console.error('Failed to fetch top resources', err);
    }
  };

  const fetchPeakHours = async () => {
    try {
      const response = await api.get('/admin/analytics/peak-hours');
      setPeakHours(response.data);
    } catch (err) {
      console.error('Failed to fetch peak hours', err);
    }
  };

  // Update these functions in AdminDashboard.js
  const fetchResources = async () => {
      setResourcesLoading(true);
      try {
          // Updated Path
          const response = await api.get('/admin/resources'); 
          setResources(response.data);
      } catch (err) {
          console.error('Failed to fetch resources', err);
      } finally {
          setResourcesLoading(false);
      }
  };

  const createResource = async (resource) => {
      // Updated Path
      const response = await api.post('/admin/resources', resource);
      await fetchResources();
      return response.data;
  };

  const updateResource = async (id, resource) => {
      // Updated Path
      const response = await api.put(`/admin/resources/${id}`, resource);
      await fetchResources();
      return response.data;
  };

  const deleteResource = async (id) => {
      if (window.confirm('Are you sure you want to delete this resource?')) {
          // Updated Path
          await api.delete(`/admin/resources/${id}`);
          await fetchResources();
      }
  };

  // Fetch tickets when activeView === 'tickets'
  useEffect(() => {
    if (activeView === 'tickets') {
      fetchTickets();
      fetchTechnicians();
    }
  }, [activeView]);

  useEffect(() => {
  if (activeView === 'overview') {
      fetchTopResources();
      fetchPeakHours();
    }
  }, [activeView]);
  // ---------- Role Check ----------
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      navigate('/login');
    }
  }, [navigate]);

  // ---------- Fetch Users when activeView changes to 'users' ----------
  const fetchUsers = async () => {
      setUsersLoading(true);
      try {
          const response = await api.get('/admin/users');
          console.log('Users fetched:', response.data);
          setUsers(response.data);
      } catch (err) {
          console.error('Failed to fetch users', err);
      } finally {
          setUsersLoading(false);
      }
  };

  useEffect(() => {
      if (activeView === 'users') {
          fetchUsers();
      }
  }, [activeView]);

  // API calls
  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const response = await api.get('/admin/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
      alert('Could not load tickets');
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await api.get('/admin/technicians');
      setTechnicians(response.data);
    } catch (err) {
      console.error('Failed to fetch technicians', err);
    }
  };

  const assignTechnician = async (ticketId, technicianId) => {
    try {
      const response = await api.put(`/admin/tickets/${ticketId}/assign`, { technicianId });
      console.log('Assignment success:', response.data);
      await fetchTickets();
      setAssignDialog({ open: false, ticketId: null, technicianId: '' });
    } catch (err) {
      console.error('Assignment failed:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      alert(`Assignment failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.put(`/admin/tickets/${ticketId}/status`, { status: newStatus });
      await fetchTickets();
      setStatusDialog({ open: false, ticketId: null, newStatus: '' });
    } catch (err) {
      alert('Status update failed');
    }
  };

  const rejectTicket = async (ticketId, reason) => {
    try {
      await api.put(`/admin/tickets/${ticketId}/reject`, { reason });
      await fetchTickets();
      setRejectReason('');
    } catch (err) {
      alert('Rejection failed');
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.get(`/admin/tickets/${ticketId}`);
      setSelectedTicketDetails(response.data);
      setDetailsDialogOpen(true);
    } catch (err) {
      alert('Could not load ticket details');
    }
  };

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(t =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------- Update User Role ----------
  const updateUserRole = async (email, newRole) => {
    try {
      await api.put(`/admin/users/${email}/role`, { role: newRole });
      await fetchUsers(); // refresh list
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Could not update role. Check backend logs.');
    }
  };

  const deleteUser = async (userId, userName) => {
  if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        await fetchUsers(); // refresh the user list
        alert('User deleted successfully');
      } catch (err) {
        console.error('Failed to delete user', err);
        alert(err.response?.data || 'Could not delete user');
      }
    }
  };

  const createUser = async () => {
    setCreatingUser(true);
    try {
      await api.post('/admin/users', createUserForm);
      await fetchUsers();
      setShowCreateUserModal(false);
      setCreateUserForm({ email: '', name: '', role: 'USER' });
      alert('User created successfully');
    } catch (err) {
      console.error('Failed to create user', err);
      alert(err.response?.data || 'Could not create user');
    } finally {
      setCreatingUser(false);
    }
  };

  // ---------- Handlers for Bookings, etc. ----------
  const handleApproveBooking = async (id) => {
      try {
          await api.put(`/api/admin/bookings/${id}/approve`);
          await fetchAllBookings();
      } catch (err) {
          alert('Approval failed');
      }
  };

  const handleRejectBooking = async (id, reason) => {
      try {
          await api.put(`/api/admin/bookings/${id}/reject`, { reason });
          setRejectDialog({ open: false, bookingId: null, reason: '' });
          await fetchAllBookings();
      } catch (err) {
          alert('Rejection failed');
      }
  };

  const deleteBooking = async (id, resourceName) => {
    if (window.confirm(`Are you sure you want to delete the booking for "${resourceName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/admin/bookings/${id}`);
        await fetchAllBookings(); // refresh the list
        alert('Booking deleted successfully');
      } catch (err) {
        console.error('Failed to delete booking', err);
        alert('Could not delete booking');
      }
    }
  };

  const deleteTicket = async (ticketId, title) => {
    if (window.confirm(`Are you sure you want to delete ticket #${ticketId} - "${title}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/tickets/${ticketId}`);
        await fetchTickets(); // refresh the list
        alert('Ticket deleted successfully');
      } catch (err) {
        console.error('Failed to delete ticket', err);
        alert('Could not delete ticket');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ---------- Filtering (search only in active management views) ----------
  const filteredResources = resources.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
      (u.name || u.email).toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBookings = bookings.filter(b =>
      (b.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.resource?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ---------- Panel Renderers ----------
  const renderResourcesPanel = () => {
      // Client-side filtering based on searchFilters (or call search endpoint)
      const filteredResources = resources.filter(r => {
          const matchName = !searchFilters.name || r.name.toLowerCase().includes(searchFilters.name.toLowerCase());
          const matchType = !searchFilters.type || r.type === searchFilters.type;
          const matchLocation = !searchFilters.location || r.location.toLowerCase().includes(searchFilters.location.toLowerCase());
          const matchStatus = !searchFilters.status || r.status === searchFilters.status;
          return matchName && matchType && matchLocation && matchStatus;
      });

      const openCreateDialog = () => {
          setResourceForm({ name: '', type: 'ROOM', capacity: '', location: '', status: 'ACTIVE' });
          setResourceDialog({ open: true, editing: null });
      };

      const openEditDialog = (resource) => {
          setResourceForm({
              name: resource.name,
              type: resource.type,
              capacity: resource.capacity || '',
              location: resource.location,
              status: resource.status
          });
          setResourceDialog({ open: true, editing: resource });
      };

      const handleSaveResource = async () => {
          try {
              const payload = {
                  ...resourceForm,
                  capacity: resourceForm.capacity ? parseInt(resourceForm.capacity) : null
              };
              if (resourceDialog.editing) {
                  await updateResource(resourceDialog.editing.id, payload);
              } else {
                  await createResource(payload);
              }
              setResourceDialog({ open: false, editing: null });
          } catch (err) {
              alert('Failed to save resource');
          }
      };

      return (
          <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
              {/* Header with search/filter and Add button */}
              <div className="px-8 py-6 border-b border-zinc-100 flex flex-wrap gap-4 items-center justify-between">
                  <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                      <Building2 size={20} className="text-blue-600" />
                      Resources Management
                  </h2>
                  <div className="flex flex-wrap gap-2">
                      <input
                          type="text"
                          placeholder="Name"
                          value={searchFilters.name}
                          onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                          className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs w-32"
                      />
                      <select
                          value={searchFilters.type}
                          onChange={(e) => setSearchFilters({...searchFilters, type: e.target.value})}
                          className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                      >
                          <option value="">All Types</option>
                          <option value="ROOM">Room</option>
                          <option value="LAB">Lab</option>
                          <option value="EQUIPMENT">Equipment</option>
                      </select>
                      <input
                          type="text"
                          placeholder="Location"
                          value={searchFilters.location}
                          onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                          className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs w-32"
                      />
                      <select
                          value={searchFilters.status}
                          onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                          className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                      >
                          <option value="">All Status</option>
                          <option value="ACTIVE">Active</option>
                          <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                      <button
                          onClick={openCreateDialog}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                      >
                          <Plus size={16} /> Add Resource
                      </button>
                  </div>
              </div>
              {resourcesLoading ? (
                  <div className="p-8 text-center">Loading resources...</div>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                              <tr>
                                  <th className="px-8 py-4">Name & Type</th>
                                  <th className="px-8 py-4">Location</th>
                                  <th className="px-8 py-4">Capacity</th>
                                  <th className="px-8 py-4">Status</th>
                                  <th className="px-8 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                              {filteredResources.map((r) => (
                                  <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                                      <td className="px-8 py-5">
                                          <div className="font-bold text-zinc-900">{r.name}</div>
                                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{r.type}</div>
                                      </td>
                                      <td className="px-8 py-5 text-sm text-zinc-500 font-medium">{r.location}</td>
                                      <td className="px-8 py-5 text-sm text-zinc-500 font-medium">{r.capacity || '-'}</td>
                                      <td className="px-8 py-5"><StatusBadge status={r.status} /></td>
                                      <td className="px-8 py-5 text-right">
                                          <div className="flex justify-end gap-2">
                                              <button onClick={() => openEditDialog(r)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                                              <button onClick={() => deleteResource(r.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {filteredResources.length === 0 && (
                                  <tr><td colSpan="5" className="px-8 py-12 text-center text-zinc-400">No resources found</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              )}
              {/* Add/Edit Dialog */}
              <AnimatePresence>
                  {resourceDialog.open && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResourceDialog({ open: false, editing: null })} className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md" />
                          <motion.div
                              initial={{ opacity: 0, scale: 0.96, y: 24 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96, y: 24 }}
                              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                              className="relative w-full max-w-[440px] bg-white rounded-2xl overflow-hidden"
                              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 8px 16px -4px rgba(0,0,0,0.08), 0 32px 64px -16px rgba(0,0,0,0.18)' }}
                          >
                              {/* Top accent line */}
                              <div className="h-[3px] w-full bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400" />

                              {/* Header */}
                              <div className="flex items-start justify-between px-7 pt-6 pb-5">
                                  <div className="flex items-center gap-3.5">
                                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                                          <Building2 size={18} className="text-white" />
                                      </div>
                                      <div>
                                          <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight leading-tight">
                                              {resourceDialog.editing ? 'Edit Resource' : 'New Resource'}
                                          </h3>
                                          <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                              {resourceDialog.editing ? 'Modify the resource details below' : 'Register a new bookable campus asset'}
                                          </p>
                                      </div>
                                  </div>
                                  <button
                                      type="button"
                                      onClick={() => setResourceDialog({ open: false, editing: null })}
                                      className="mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all duration-150"
                                  >
                                      <X size={15} />
                                  </button>
                              </div>

                              {/* Divider */}
                              <div className="mx-7 h-px bg-zinc-100" />

                              {/* Form Body */}
                              <div className="px-7 pt-5 pb-7">
                                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveResource(); }}>

                                      {/* Resource Name */}
                                      <div className="space-y-1.5">
                                          <label className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                                              Resource Name <span className="text-zinc-900 normal-case tracking-normal font-medium">*</span>
                                          </label>
                                          <input
                                              type="text"
                                              value={resourceForm.name}
                                              onChange={(e) => setResourceForm({...resourceForm, name: e.target.value})}
                                              className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13.5px] text-zinc-900 font-medium placeholder-zinc-400 outline-none transition-all duration-150 focus:bg-white focus:border-zinc-900 focus:ring-3 focus:ring-zinc-900/8"
                                              placeholder="e.g. Conference Room A"
                                              required
                                          />
                                      </div>

                                      {/* Type + Capacity */}
                                      <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1.5">
                                              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Type</label>
                                              <select
                                                  value={resourceForm.type}
                                                  onChange={(e) => setResourceForm({...resourceForm, type: e.target.value})}
                                                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13.5px] text-zinc-900 font-medium outline-none transition-all duration-150 focus:bg-white focus:border-zinc-900 focus:ring-3 focus:ring-zinc-900/8 cursor-pointer"
                                              >
                                                  <option value="ROOM">Room</option>
                                                  <option value="LAB">Lab</option>
                                                  <option value="EQUIPMENT">Equipment</option>
                                              </select>
                                          </div>
                                          <div className="space-y-1.5">
                                              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Capacity</label>
                                              <input
                                                  type="number"
                                                  value={resourceForm.capacity}
                                                  onChange={(e) => setResourceForm({...resourceForm, capacity: e.target.value})}
                                                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13.5px] text-zinc-900 font-medium placeholder-zinc-400 outline-none transition-all duration-150 focus:bg-white focus:border-zinc-900 focus:ring-3 focus:ring-zinc-900/8"
                                                  placeholder="—"
                                              />
                                          </div>
                                      </div>

                                      {/* Location */}
                                      <div className="space-y-1.5">
                                          <label className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                                              Location <span className="text-zinc-900 normal-case tracking-normal font-medium">*</span>
                                          </label>
                                          <input
                                              type="text"
                                              value={resourceForm.location}
                                              onChange={(e) => setResourceForm({...resourceForm, location: e.target.value})}
                                              className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13.5px] text-zinc-900 font-medium placeholder-zinc-400 outline-none transition-all duration-150 focus:bg-white focus:border-zinc-900 focus:ring-3 focus:ring-zinc-900/8"
                                              placeholder="e.g. Building 1, Floor 2"
                                              required
                                          />
                                      </div>

                                      {/* Status */}
                                      <div className="space-y-1.5">
                                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Status</label>
                                          <select
                                              value={resourceForm.status}
                                              onChange={(e) => setResourceForm({...resourceForm, status: e.target.value})}
                                              className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13.5px] text-zinc-900 font-medium outline-none transition-all duration-150 focus:bg-white focus:border-zinc-900 focus:ring-3 focus:ring-zinc-900/8 cursor-pointer"
                                          >
                                              <option value="ACTIVE">Active</option>
                                              <option value="OUT_OF_SERVICE">Out of Service</option>
                                          </select>
                                      </div>

                                      {/* Divider before actions */}
                                      <div className="h-px bg-zinc-100 !mt-5" />

                                      {/* Actions */}
                                      <div className="flex gap-2.5 !mt-4">
                                          <button
                                              type="button"
                                              onClick={() => setResourceDialog({ open: false, editing: null })}
                                              className="flex-1 h-10 px-4 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-[13px] font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150"
                                          >
                                              Cancel
                                          </button>
                                          <button
                                              type="submit"
                                              className="flex-[2] h-10 px-4 bg-zinc-900 text-white rounded-lg text-[13px] font-semibold tracking-tight transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98]"
                                              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)' }}
                                          >
                                              {resourceDialog.editing ? 'Update Resource' : 'Save Resource'}
                                          </button>
                                      </div>
                                  </form>
                              </div>
                          </motion.div>
                      </div>
                  )}
              </AnimatePresence>
          </div>
      );
  };

  const renderUsersPanel = () => (
    <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
      <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          <h2 className="text-xl font-black text-zinc-900">Users Management</h2>
        </div>
        <div className="flex gap-3">
          {/* ADD USER BUTTON */}
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} /> Add User
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs outline-none focus:ring-2 focus:ring-blue-600/20 w-64"
            />
          </div>
        </div>
      </div>

      {usersLoading ? (
        <div className="p-8 text-center">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-4">User Details</th><th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Activity</th><th className="px-8 py-4 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-zinc-50/50">
                  <td className="px-8 py-5"><div className="font-bold">{u.name || u.email}</div><div className="text-xs text-zinc-400">{u.email}</div></td>
                  <td className="px-8 py-5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                    u.role === 'ADMIN' ? 'bg-zinc-900 text-white border-zinc-900' :
                    u.role === 'TECHNICIAN' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>{u.role}</span></td>
                  <td className="px-8 py-5"><div className="text-xs text-zinc-500">{u.bookings || 0} Bookings • {u.tickets || 0} Tickets</div></td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditRoleDialog({ user: u, open: true })}
                        className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                      >
                        Edit Role
                      </button>
                      {userId !== u.id && (
                        <button
                          onClick={() => deleteUser(u.id, u.name || u.email)}
                          className="px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          Delete
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

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateUserModal(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">Add User</h3>
                    <p className="text-zinc-500 text-sm">Create a new user manually</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Email *</label>
                    <input
                      type="email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Name</label>
                    <input
                      type="text"
                      value={createUserForm.name}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl"
                      placeholder="Full name (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Role</label>
                    <select
                      value={createUserForm.role}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl"
                    >
                      <option value="USER">USER</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button
                    onClick={() => setShowCreateUserModal(false)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createUser}
                    disabled={creatingUser || !createUserForm.email}
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold disabled:opacity-50"
                  >
                    {creatingUser ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Role Dialog */}
      <AnimatePresence>
        {editRoleDialog?.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditRoleDialog(null)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white"><Users size={24} /></div>
                  <div><h3 className="text-2xl font-black text-zinc-900">Change Role</h3><p className="text-zinc-500 text-sm">{editRoleDialog.user.email}</p></div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest">New Role</label>
                  <select className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl" value={editRoleDialog.user.role} onChange={(e) => setEditRoleDialog({ ...editRoleDialog, user: { ...editRoleDialog.user, role: e.target.value } })}>
                    <option value="USER">USER</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-6">
                  <button onClick={() => setEditRoleDialog(null)} className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold">Cancel</button>
                  <button onClick={async () => { await updateUserRole(editRoleDialog.user.email, editRoleDialog.user.role); setEditRoleDialog(null); }} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderBookingsPanel = () => (
      <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
          <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-100">
              <div className="flex items-center gap-2">
                  <CalendarDays size={20} className="text-blue-600" />
                  <h2 className="text-xl font-black text-zinc-900">Booking Requests</h2>
              </div>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                  <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs w-64"
                  />
              </div>
          </div>
          {bookingsLoading ? (
              <div className="p-8 text-center">Loading bookings...</div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                          <tr>
                              <th className="px-8 py-4">User & Resource</th>
                              <th className="px-8 py-4">Date & Time</th>
                              <th className="px-8 py-4">Status</th>
                              <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                          {bookings
                              .filter(b =>
                                  (b.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  b.resource?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                              )
                              .map((b) => (
                                  <tr key={b.id} className="hover:bg-zinc-50/50">
                                      <td className="px-8 py-5">
                                          <div className="font-bold text-zinc-900">{b.user?.name || b.user?.email}</div>
                                          <div className="text-xs text-zinc-400">{b.resource?.name}</div>
                                      </td>
                                      <td className="px-8 py-5">
                                          <div className="text-sm">{b.bookingDate}</div>
                                          <div className="text-xs text-zinc-400">{b.timeRange}</div>
                                      </td>
                                      <td className="px-8 py-5"><StatusBadge status={b.status} /></td>
                                        <td className="px-8 py-5 text-right">
                                          <div className="flex justify-end gap-2">
                                            {b.status === 'PENDING' && (
                                              <>
                                                <button
                                                  onClick={() => handleApproveBooking(b.id)}
                                                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white"
                                                  title="Approve"
                                                >
                                                  <Check size={16} />
                                                </button>
                                                <button
                                                  onClick={() => setRejectDialog({ open: true, bookingId: b.id, reason: '' })}
                                                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white"
                                                  title="Reject"
                                                >
                                                  <X size={16} />
                                                </button>
                                              </>
                                            )}
                                            {b.status === 'APPROVED' && <span className="text-xs text-emerald-600">Approved</span>}
                                            {b.status === 'REJECTED' && <span className="text-xs text-red-600">Rejected</span>}
                                            {b.status === 'CANCELLED' && <span className="text-xs text-zinc-500">Cancelled</span>}
                                            
                                            {/* Delete button for all bookings */}
                                            <button
                                              onClick={() => deleteBooking(b.id, b.resource?.name || 'this booking')}
                                              className="p-2 bg-zinc-100 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                                              title="Delete"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </td>
                                  </tr>
                              ))}
                      </tbody>
                  </table>
              </div>
          )}

          {/* Reject Dialog */}
          <AnimatePresence>
              {rejectDialog.open && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                      <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setRejectDialog({ open: false, bookingId: null, reason: '' })}
                          className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                      />
                      <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                      >
                          <div className="p-8">
                              <h3 className="text-xl font-black mb-4">Reject Booking</h3>
                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-black mb-1">Reason</label>
                                      <textarea
                                          rows={3}
                                          className="w-full p-3 bg-zinc-50 border rounded-xl"
                                          value={rejectDialog.reason}
                                          onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
                                          placeholder="Provide reason for rejection"
                                      />
                                  </div>
                              </div>
                              <div className="flex gap-3 mt-6">
                                  <button
                                      onClick={() => setRejectDialog({ open: false, bookingId: null, reason: '' })}
                                      className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold"
                                  >
                                      Cancel
                                  </button>
                                  <button
                                      onClick={() => handleRejectBooking(rejectDialog.bookingId, rejectDialog.reason)}
                                      className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold"
                                  >
                                      Confirm Reject
                                  </button>
                              </div>
                          </div>
                      </motion.div>
                  </div>
              )}
          </AnimatePresence>
      </div>
  );

const renderTicketsPanel = () => (
  <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
    <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-100">
      <div className="flex items-center gap-2">
        <Ticket size={20} className="text-blue-600" />
        <h2 className="text-xl font-black text-zinc-900">Incident Tickets</h2>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs w-64"
        />
      </div>
    </div>
    {ticketsLoading ? (
      <div className="p-8 text-center">Loading tickets...</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-[800px]">
          <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4 w-[30%]">ID & Title</th>
              <th className="px-8 py-4 w-[20%]">Reported By</th>
              <th className="px-8 py-4 w-[12%]">Priority</th>
              <th className="px-8 py-4 w-[12%]">Status</th>
              <th className="px-8 py-4 w-[16%]">Assigned To</th>
              <th className="px-8 py-4 w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-zinc-50/50">
                <td className="px-8 py-5">
                  <div className="font-bold text-zinc-900">{ticket.title}</div>
                  <div className="text-[10px] text-zinc-400">#{ticket.id}</div>
                </td>
                <td className="px-8 py-5 text-sm text-zinc-500">
                  {ticket.user?.name || ticket.user?.email}
                </td>
                <td className="px-8 py-5">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-8 py-5">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-8 py-5 text-sm">
                  {ticket.assignedTechnician?.name || 'Unassigned'}
                </td>
                <td className="px-8 py-5 text-right relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuTicketId(openMenuTicketId === ticket.id ? null : ticket.id);
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuTicketId === ticket.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 z-20 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            fetchTicketDetails(ticket.id);
                            setOpenMenuTicketId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                        >
                          <Eye size={14} /> View Details
                        </button>
                        {!ticket.assignedTechnician && (
                          <button
                            onClick={() => {
                              setAssignDialog({ open: true, ticketId: ticket.id, technicianId: '' });
                              setOpenMenuTicketId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                          >
                            <UserPlus size={14} /> Assign Technician
                          </button>
                        )}
                        {ticket.status !== 'REJECTED' && ticket.status !== 'CLOSED' && (
                          <button
                            onClick={() => {
                              setStatusDialog({ open: true, ticketId: ticket.id, newStatus: '' });
                              setOpenMenuTicketId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                          >
                            <RefreshCw size={14} /> Update Status
                          </button>
                        )}
                        {ticket.status === 'OPEN' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) rejectTicket(ticket.id, reason);
                              setOpenMenuTicketId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <X size={14} /> Reject Ticket
                          </button>
                        )}
                        <hr className="my-1 border-zinc-100" />
                        <button
                          onClick={() => {
                            deleteTicket(ticket.id, ticket.title);
                            setOpenMenuTicketId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Delete Ticket
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="6" className="px-8 py-12 text-center text-zinc-400">No tickets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}

    {/* Assign Technician Dialog */}
    <AnimatePresence>
      {assignDialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAssignDialog({ open: false, ticketId: null, technicianId: '' })}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-xl font-black mb-4">Assign Technician</h3>
              <select
                className="w-full p-3 bg-zinc-50 border rounded-xl mb-6"
                value={assignDialog.technicianId}
                onChange={(e) => setAssignDialog({ ...assignDialog, technicianId: e.target.value })}
              >
                <option value="">Select technician</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name} ({tech.email})</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setAssignDialog({ open: false, ticketId: null, technicianId: '' })}
                  className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => assignTechnician(assignDialog.ticketId, assignDialog.technicianId)}
                  disabled={!assignDialog.technicianId}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Update Status Dialog */}
    <AnimatePresence>
      {statusDialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStatusDialog({ open: false, ticketId: null, newStatus: '' })}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-xl font-black mb-4">Update Ticket Status</h3>
              <select
                className="w-full p-3 bg-zinc-50 border rounded-xl mb-6"
                value={statusDialog.newStatus}
                onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value })}
              >
                <option value="">Select status</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setStatusDialog({ open: false, ticketId: null, newStatus: '' })}
                  className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateTicketStatus(statusDialog.ticketId, statusDialog.newStatus)}
                  disabled={!statusDialog.newStatus}
                  className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Ticket Details Dialog */}
    <AnimatePresence>
      {detailsDialogOpen && selectedTicketDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailsDialogOpen(false)}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black">{selectedTicketDetails.title}</h3>
                <button onClick={() => setDetailsDialogOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div><span className="font-bold">Description:</span> {selectedTicketDetails.description}</div>
                <div><span className="font-bold">Priority:</span> <PriorityBadge priority={selectedTicketDetails.priority} /></div>
                <div><span className="font-bold">Status:</span> <StatusBadge status={selectedTicketDetails.status} /></div>
                <div><span className="font-bold">Reported by:</span> {selectedTicketDetails.user?.name} ({selectedTicketDetails.user?.email})</div>
                <div><span className="font-bold">Assigned to:</span> {selectedTicketDetails.assignedTechnician?.name || 'Unassigned'}</div>
                  {selectedTicketDetails.attachments?.length > 0 && (
                    <div>
                      <span className="font-bold">Attachments:</span>
                      <div className="flex gap-2 mt-2">
                        {selectedTicketDetails.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={`http://localhost:8081/api${att.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            {att.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                <div>
                  <span className="font-bold">Comments:</span>
                  {selectedTicketDetails.comments?.length ? (
                    <div className="mt-2 space-y-2">
                      {selectedTicketDetails.comments.map(c => (
                        <div key={c.id} className="bg-zinc-50 p-3 rounded-xl">
                          <div className="text-xs font-bold">{c.user?.name} <span className="text-zinc-400">{new Date(c.createdAt).toLocaleString()}</span></div>
                          <div className="text-sm mt-1">{c.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-zinc-400 text-sm">No comments</div>}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
);

  const renderOverview = () => (
    <div className="space-y-8">
      <section className="bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-zinc-200">
        <div className="relative z-10 max-w-2xl">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black mb-4 tracking-tight">Operations Command, {username} 👑</motion.h1>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed">Oversee campus resources, manage user access, and ensure smooth operational workflows across all departments.</p>
        </div>
        <ShieldCheck className="absolute right-12 bottom-8 text-white/5" size={160} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Resources" value={resources.length} icon={Building2} colorClass="bg-blue-600" trend="+2 new" />
        <StatCard label="Active Users" value={users.length} icon={Users} colorClass="bg-emerald-600" trend="+12%" />
        <StatCard label="Pending Bookings" value={bookings.filter(b => b.status === 'PENDING').length} icon={CalendarDays} colorClass="bg-amber-600" />
        <StatCard label="Open Tickets" value={tickets.filter(t => t.status === 'OPEN').length} icon={Ticket} colorClass="bg-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
          <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> Top Used Resources
          </h2>
          <div className="space-y-4">
            {topResources.length === 0 ? (
              <div className="text-center text-zinc-400 py-8">No booking data yet</div>
            ) : (
              topResources.map((item, idx) => {
                const maxCount = topResources[0]?.bookingCount || 1;
                const percentage = (item.bookingCount / maxCount) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{item.resourceName}</span>
                      <span>{item.bookingCount} bookings</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-amber-600" /> Peak Booking Hours
            </h2>
            <div className="space-y-4">
              {peakHours.length === 0 ? (
                <div className="text-center text-zinc-400 py-8">No booking data yet</div>
              ) : (
                peakHours.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50">
                    <span className="text-sm font-bold text-zinc-700">{item.hourSlot}</span>
                    <span className="text-xs font-bold text-zinc-500">{item.bookingCount} bookings</span>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>
    </div>
  );

  // ---------- Main Return ----------
  console.log('Admin userId:', userId, '| raw:', localStorage.getItem('userId'));
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            {userId ? (
                <NotificationPanel userId={userId} />
              ) : (
                <button className="relative p-2 text-zinc-500 hover:text-blue-600">
                  <Bell size={20} />
                </button>
              )}
            <div className="h-8 w-px bg-zinc-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block"><div className="text-sm font-bold text-zinc-900">{username}</div><div className="text-[10px] font-bold text-zinc-400 uppercase">System Administrator</div></div>
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold">{username.charAt(0).toUpperCase()}</div>
              <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500"><LogOut size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-zinc-200 flex-shrink-0 hidden md:block">
          <div className="sticky top-16 p-4 space-y-2">
            <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Management</div>
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'resources', label: 'Resources', icon: Building2 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bookings', label: 'Bookings', icon: CalendarDays },
              { id: 'tickets', label: 'Tickets', icon: Ticket },
            ].map((item) => (
              <button key={item.id} onClick={() => { setActiveView(item.id); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === item.id ? 'bg-blue-50 text-blue-700' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeView === 'overview' && renderOverview()}
              {activeView === 'resources' && renderResourcesPanel()}
              {activeView === 'users' && renderUsersPanel()}
              {activeView === 'bookings' && renderBookingsPanel()}
              {activeView === 'tickets' && renderTicketsPanel()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Add Resource Dialog (unchanged) */}
      <AnimatePresence>
        {openDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenDialog(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white"><Plus size={24} /></div><div><h3 className="text-2xl font-black text-zinc-900">Add Resource</h3><p className="text-zinc-500 text-sm">Create a new bookable campus asset</p></div></div>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Resource Name</label><input type="text" className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20" placeholder="e.g. Conference Room A" /></div>
                    <div><label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Type</label><select className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl"><option>Room</option><option>Lab</option><option>Equipment</option></select></div>
                    <div><label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Capacity</label><input type="number" className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl" placeholder="0" /></div>
                    <div className="col-span-2"><label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Location</label><input type="text" className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl" placeholder="e.g. Building 1, Floor 2" /></div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setOpenDialog(false)} className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200">Cancel</button>
                    <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100">Create Resource</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-8 text-center text-zinc-400 text-xs font-medium border-t border-zinc-200 mt-8">© 2026 UniCore 360 Operations Hub. Built for PAF IT3030.</footer>
    </div>
  );
}