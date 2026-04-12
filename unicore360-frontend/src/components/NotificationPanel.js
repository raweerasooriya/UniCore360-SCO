import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Settings, X, Mail, AlertCircle, MessageSquare, Calendar } from 'lucide-react';
import api from '../services/api';

const getIcon = (type) => {
  switch(type) {
    case 'BOOKING_UPDATE': return <Calendar size={14} className="text-blue-500" />;
    case 'TICKET_UPDATE': return <AlertCircle size={14} className="text-amber-500" />;
    case 'COMMENT': return <MessageSquare size={14} className="text-emerald-500" />;
    default: return <Bell size={14} className="text-zinc-500" />;
  }
};

export default function NotificationPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`notifications/user/${userId}`);
      setNotifications(res.data);
      const unreadRes = await api.get(`notifications/unread-count?userId=${userId}`);
      setUnreadCount(unreadRes.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await api.get(`notifications/preferences?userId=${userId}`);
      setPreferences(res.data);
    } catch (err) {
      console.error('Failed to fetch preferences', err);
    }
  };

  const markAsRead = async (id) => {
    await api.put(`notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.put(`notifications/read-all?userId=${userId}`);
    fetchNotifications();
  };

  const updatePreference = async (key, value) => {
    const updated = { ...preferences, [key]: value };
    await api.put(`notifications/preferences?userId=${userId}`, updated);
    setPreferences(updated);
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setPreferencesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-zinc-500 hover:text-blue-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200 z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-zinc-100">
            <h3 className="font-black text-zinc-900">Notifications</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPreferencesOpen(!preferencesOpen)}
                className="p-1 text-zinc-400 hover:text-blue-600"
              >
                <Settings size={16} />
              </button>
              {notifications.filter(n => !n.read).length > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-blue-600 font-bold">Mark all read</button>
              )}
            </div>
          </div>

          {preferencesOpen ? (
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-bold mb-2">Notification Preferences</h4>
              <label className="flex items-center justify-between text-sm">
                <span>Booking updates</span>
                <input type="checkbox" checked={preferences?.bookingUpdates} onChange={(e) => updatePreference('bookingUpdates', e.target.checked)} />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Ticket updates</span>
                <input type="checkbox" checked={preferences?.ticketUpdates} onChange={(e) => updatePreference('ticketUpdates', e.target.checked)} />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Comments</span>
                <input type="checkbox" checked={preferences?.comments} onChange={(e) => updatePreference('comments', e.target.checked)} />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>System messages</span>
                <input type="checkbox" checked={preferences?.systemNotifications} onChange={(e) => updatePreference('systemNotifications', e.target.checked)} />
              </label>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-sm">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-zinc-100 hover:bg-zinc-50 transition ${!n.read ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-zinc-900">{n.title}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-zinc-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="text-xs text-blue-600">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}