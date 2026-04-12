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
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import api from '../services/api';

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

// ---------- Main AdminDashboard ----------
export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editRoleDialog, setEditRoleDialog] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const navigate = useNavigate();
  const username  = localStorage.getItem('name') || 'Admin';
  // Resources state
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceDialog, setResourceDialog] = useState({ open: false, editing: null }); // editing holds resource object or null
  const [resourceForm, setResourceForm] = useState({ name: '', type: 'ROOM', capacity: '', location: '', status: 'ACTIVE' });
  const [searchFilters, setSearchFilters] = useState({ name: '', type: '', location: '', status: '' });

  // Fetch resources when activeView === 'resources'
  useEffect(() => {
      if (activeView === 'resources') {
          fetchResources();
      }
  }, [activeView]);

  const fetchResources = async () => {
      setResourcesLoading(true);
      try {
          const response = await api.get('/admin/resources');
          setResources(response.data);
      } catch (err) {
          console.error('Failed to fetch resources', err);
      } finally {
          setResourcesLoading(false);
      }
  };

  const createResource = async (resource) => {
      try {
          const response = await api.post('/admin/resources', resource);
          await fetchResources();
          return response.data;
      } catch (err) {
          console.error('Failed to create resource', err);
          throw err;
      }
  };

  const updateResource = async (id, resource) => {
      try {
          const response = await api.put(`/admin/resources/${id}`, resource);
          await fetchResources();
          return response.data;
      } catch (err) {
          console.error('Failed to update resource', err);
          throw err;
      }
  };

  const deleteResource = async (id) => {
      if (window.confirm('Are you sure you want to delete this resource?')) {
          try {
              await api.delete(`/admin/resources/${id}`);
              await fetchResources();
          } catch (err) {
              console.error('Failed to delete resource', err);
          }
      }
  };

  // ---------- Mock Data (Resources, Bookings, Tickets - keep as before) ----------

  const [bookings, setBookings] = useState([
    { id: 1, user: 'John Student', resource: 'Conference Room A', date: '2026-03-15', time: '10:00-12:00', status: 'PENDING' },
    { id: 2, user: 'John Student', resource: 'Lab 101', date: '2026-03-16', time: '14:00-16:00', status: 'APPROVED' },
    { id: 3, user: 'Jane Smith', resource: 'Projector', date: '2026-03-17', time: '09:00-11:00', status: 'PENDING' },
  ]);

  const [tickets, setTickets] = useState([
    { id: 1, title: 'Projector not working', user: 'John Student', priority: 'HIGH', status: 'OPEN', assignedTo: null },
    { id: 2, title: 'AC not cooling', user: 'Jane Smith', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 'Jane Tech' },
    { id: 3, title: 'Network issue', user: 'Bob Wilson', priority: 'HIGH', status: 'OPEN', assignedTo: null },
  ]);

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

  // ---------- Handlers for Bookings, etc. ----------
  const handleApproveBooking = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'APPROVED' } : b));
  };

  const handleRejectBooking = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED' } : b));
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
    b.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.date.includes(searchQuery)
  );
  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
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
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResourceDialog({ open: false, editing: null })} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
                          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                              <div className="p-8 md:p-10">
                                  <div className="flex items-center gap-4 mb-8">
                                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white"><Building2 size={24} /></div>
                                      <div><h3 className="text-2xl font-black text-zinc-900">{resourceDialog.editing ? 'Edit Resource' : 'Add Resource'}</h3><p className="text-zinc-500 text-sm">{resourceDialog.editing ? 'Update resource details' : 'Create a new bookable campus asset'}</p></div>
                                  </div>
                                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveResource(); }}>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="col-span-2">
                                              <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Resource Name</label>
                                              <input type="text" value={resourceForm.name} onChange={(e) => setResourceForm({...resourceForm, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20" placeholder="e.g. Conference Room A" required />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Type</label>
                                              <select value={resourceForm.type} onChange={(e) => setResourceForm({...resourceForm, type: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                                                  <option value="ROOM">Room</option>
                                                  <option value="LAB">Lab</option>
                                                  <option value="EQUIPMENT">Equipment</option>
                                              </select>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Capacity</label>
                                              <input type="number" value={resourceForm.capacity} onChange={(e) => setResourceForm({...resourceForm, capacity: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl" placeholder="0 (for equipment leave blank)" />
                                          </div>
                                          <div className="col-span-2">
                                              <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Location</label>
                                              <input type="text" value={resourceForm.location} onChange={(e) => setResourceForm({...resourceForm, location: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl" placeholder="e.g. Building 1, Floor 2" required />
                                          </div>
                                          <div className="col-span-2">
                                              <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Status</label>
                                              <select value={resourceForm.status} onChange={(e) => setResourceForm({...resourceForm, status: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                                                  <option value="ACTIVE">Active</option>
                                                  <option value="OUT_OF_SERVICE">Out of Service</option>
                                              </select>
                                          </div>
                                      </div>
                                      <div className="flex gap-3 pt-4">
                                          <button type="button" onClick={() => setResourceDialog({ open: false, editing: null })} className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold">Cancel</button>
                                          <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700">Save Resource</button>
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
                    <button onClick={() => setEditRoleDialog({ user: u, open: true })} className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl">Edit Role</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
        <div className="flex items-center gap-2"><CalendarDays size={20} className="text-blue-600" /><h2 className="text-xl font-black text-zinc-900">Booking Requests</h2></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input type="text" placeholder="Search bookings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs w-64" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            <th className="px-8 py-4">User & Resource</th><th className="px-8 py-4">Date & Time</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredBookings.map(b => (
              <tr key={b.id} className="hover:bg-zinc-50/50">
                <td className="px-8 py-5"><div className="font-bold">{b.user}</div><div className="text-xs text-zinc-400">{b.resource}</div></td>
                <td className="px-8 py-5"><div className="text-sm">{b.date}</div><div className="text-xs text-zinc-400">{b.time}</div></td>
                <td className="px-8 py-5"><StatusBadge status={b.status} /></td>
                <td className="px-8 py-5 text-right">{b.status === 'PENDING' ? (
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleApproveBooking(b.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white"><Check size={16} /></button>
                    <button onClick={() => handleRejectBooking(b.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white"><X size={16} /></button>
                  </div>
                ) : <button className="p-2 text-zinc-400 hover:text-blue-600"><MoreVertical size={16} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTicketsPanel = () => (
    <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
      <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-100">
        <div className="flex items-center gap-2"><Ticket size={20} className="text-blue-600" /><h2 className="text-xl font-black text-zinc-900">Incident Tickets</h2></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs w-64" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            <th className="px-8 py-4">Ticket Details</th><th className="px-8 py-4">Priority</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Assigned To</th><th className="px-8 py-4 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredTickets.map(t => (
              <tr key={t.id} className="hover:bg-zinc-50/50">
                <td className="px-8 py-5"><div className="font-bold">{t.title}</div><div className="text-xs text-zinc-400">Reported by {t.user}</div></td>
                <td className="px-8 py-5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${t.priority === 'HIGH' ? 'bg-red-50 text-red-700' : t.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{t.priority}</span></td>
                <td className="px-8 py-5"><StatusBadge status={t.status} /></td>
                <td className="px-8 py-5 text-sm">{t.assignedTo || 'Unassigned'}</td>
                <td className="px-8 py-5 text-right">{!t.assignedTo ? <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">Assign</button> : <button className="p-2 text-zinc-400 hover:text-blue-600"><MoreVertical size={16} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600" /> Top Used Resources</h2>
          <div className="space-y-4">{[
            { name: 'Conference Room A', count: 45, color: 'bg-blue-600' },
            { name: 'Lab 101', count: 32, color: 'bg-emerald-600' },
            { name: 'Projector', count: 28, color: 'bg-amber-600' },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm font-bold"><span>{item.name}</span><span>{item.count} bookings</span></div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / 50) * 100}%` }} className={`h-full ${item.color}`} /></div>
            </div>
          ))}</div>
        </div>
        <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
          <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><Clock size={20} className="text-amber-600" /> Peak Booking Hours</h2>
          <div className="grid grid-cols-3 gap-4">{[
            { time: '10:00 - 12:00', label: 'Most Popular', color: 'text-blue-600 bg-blue-50' },
            { time: '14:00 - 16:00', label: 'High Demand', color: 'text-amber-600 bg-amber-50' },
            { time: '09:00 - 11:00', label: 'Morning Peak', color: 'text-emerald-600 bg-emerald-50' },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl border border-transparent ${item.color} text-center`}>
              <div className="text-sm font-black mb-1">{item.time}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{item.label}</div>
            </div>
          ))}</div>
        </div>
      </div>
    </div>
  );

  // ---------- Main Return ----------
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-500 hover:text-blue-600"><Bell size={20} /><span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span></button>
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