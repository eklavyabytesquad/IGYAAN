'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Users, MapPin, Clock, Search, Filter, Download, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../utils/auth_context';

export default function EventsManagement() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'academic',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: '',
    registration_deadline: '',
    is_public: false,
    banner_image: '',
  });

  useEffect(() => {
    console.log('Current user object:', user);
    console.log('User school_id:', user?.school_id);
    console.log('User id:', user?.id);
    console.log('User role:', user?.role);
    
    if (user?.school_id) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user?.school_id) return;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('school_id', user.school_id)
      .order('start_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
  };

  const fetchRegistrations = async (eventId) => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (!error && data) {
      setRegistrations(data);
    } else {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    }
  };

  const handleViewRegistrations = async (event) => {
    setSelectedEventForRegistrations(event);
    await fetchRegistrations(event.id);
    setShowRegistrationsModal(true);
  };

  const downloadExcel = () => {
    if (!selectedEventForRegistrations || registrations.length === 0) {
      alert('No registrations to download!');
      return;
    }

    // Prepare CSV data
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Registered At', 'Cancelled At'];
    const rows = registrations.map(reg => [
      reg.user_name || 'N/A',
      reg.user_email || 'N/A',
      reg.user_phone || 'N/A',
      reg.status,
      new Date(reg.registered_at).toLocaleString(),
      reg.cancelled_at ? new Date(reg.cancelled_at).toLocaleString() : 'N/A'
    ]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEventForRegistrations.title}_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate user has school_id
      if (!user?.school_id) {
        console.error('Missing school_id. User object:', user);
        alert(`⚠️ School ID is missing.\n\nUser ID: ${user?.id || 'N/A'}\nEmail: ${user?.email || 'N/A'}\nRole: ${user?.role || 'N/A'}\nSchool ID: ${user?.school_id || 'NULL'}\n\nPlease complete your school onboarding first or contact admin to set your school_id in the database.`);
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        alert('⚠️ User ID is missing. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Ensure dates are in proper ISO format
      const eventData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        event_type: formData.event_type,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        location: formData.location.trim(),
        max_participants: parseInt(formData.max_participants) || 100,
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        is_public: formData.is_public || false,
        banner_image: formData.banner_image?.trim() || null,
        school_id: user.school_id,
        created_by: user.id,
        status: 'upcoming',
      };

      console.log('Submitting event data:', eventData);

      if (editingEvent) {
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          alert(`Error updating event: ${error.message}`);
        } else {
          console.log('Event updated successfully:', data);
          fetchEvents();
          resetForm();
          alert('Event updated successfully!');
        }
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          alert(`Error creating event: ${error.message}`);
        } else {
          console.log('Event created successfully:', data);
          fetchEvents();
          resetForm();
          alert('Event created successfully!');
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchEvents();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'academic',
      start_date: '',
      end_date: '',
      location: '',
      max_participants: '',
      registration_deadline: '',
      is_public: false,
      banner_image: '',
    });
    setEditingEvent(null);
    setShowModal(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      max_participants: event.max_participants,
      registration_deadline: event.registration_deadline,
      is_public: event.is_public,
      banner_image: event.banner_image || '',
    });
    setShowModal(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen w-full flex-col gap-6 overflow-hidden p-4 lg:p-8" style={{ backgroundColor: 'var(--dashboard-background)' }}>
      {/* Warning Banner if no school_id */}
      {!user?.school_id && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg dark:border-amber-900 dark:bg-amber-950">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100">School Onboarding Required</h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                You need to complete school onboarding before creating events. Please visit the School Profile page or contact your administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="rounded-3xl dashboard-card p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl p-4 text-white shadow-lg" style={{ background: 'var(--dashboard-primary)' }}>
              <Calendar size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--dashboard-heading)' }}>
                Event Management
              </h1>
              <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--dashboard-muted)' }}>
                Create and manage school events, competitions, and activities
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!user?.school_id) {
                alert('Please complete school onboarding first!');
                return;
              }
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition"
            style={{ background: 'var(--dashboard-primary)' }}
          >
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--dashboard-muted)' }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border px-10 py-2.5 text-sm outline-none transition focus:ring-2"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-solid)',
                color: 'var(--dashboard-text)'
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} style={{ color: 'var(--dashboard-muted)' }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border px-4 py-2.5 text-sm outline-none transition"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-solid)',
                color: 'var(--dashboard-text)'
              }}
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </header>

      {/* Events Grid */}
      <div className="flex-1 overflow-y-auto rounded-3xl dashboard-card p-6 shadow-2xl">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-2xl dashboard-card shadow-lg transition hover:shadow-xl"
            >
              {event.banner_image && (
                <div className="h-40 w-full overflow-hidden bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
                  <img src={event.banner_image} alt={event.title} className="h-full w-full object-cover" />
                </div>
              )}
              
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold text-zinc-800 dark:text-zinc-100">{event.title}</h3>
                    <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{event.description}</p>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{new Date(event.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{event.max_participants} participants</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewRegistrations(event)}
                  className="mt-3 w-full rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:shadow-emerald-400/40"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users size={14} />
                    <span>View Registrations</span>
                  </div>
                </button>

                {event.is_public && (
                  <div className="mt-3 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                    🌐 Public Event
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="flex h-64 items-center justify-center text-zinc-500">
            <p>No events found. Create your first event!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
            <h2 className="mb-6 text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="Event description"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="competition">Competition</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Max Participants</label>
                  <input
                    type="number"
                    required
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="Max participants"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Banner Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.banner_image}
                  onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Make this event public (visible to everyone)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-blue-400/40 disabled:opacity-60"
                >
                  {isLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {showRegistrationsModal && selectedEventForRegistrations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                  Event Registrations
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedEventForRegistrations.title}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(selectedEventForRegistrations.start_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {selectedEventForRegistrations.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRegistrationsModal(false);
                  setSelectedEventForRegistrations(null);
                  setRegistrations([]);
                }}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Total Registrations</p>
                <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">{registrations.length}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Registered</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {registrations.filter(r => r.status === 'registered').length}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Cancelled</p>
                <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {registrations.filter(r => r.status === 'cancelled').length}
                </p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Attended</p>
                <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {registrations.filter(r => r.status === 'attended').length}
                </p>
              </div>
            </div>

            {/* Download Button */}
            <div className="mb-4">
              <button
                onClick={downloadExcel}
                disabled={registrations.length === 0}
                className="flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-emerald-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                <span>Download as CSV/Excel</span>
              </button>
            </div>

            {/* Registrations Table */}
            {registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr 
                        key={reg.id} 
                        className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                          {reg.user_name || <span className="text-zinc-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {reg.user_email || <span className="text-zinc-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {reg.user_phone || <span className="text-zinc-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                            reg.status === 'registered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            reg.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            reg.status === 'attended' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {reg.status === 'registered' && <CheckCircle size={12} />}
                            {reg.status === 'cancelled' && <XCircle size={12} />}
                            {reg.status === 'attended' && <CheckCircle size={12} />}
                            {reg.status === 'waitlisted' && <AlertCircle size={12} />}
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-500">
                          {new Date(reg.registered_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <div className="text-center">
                  <Users size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
                  <p className="font-semibold text-zinc-600 dark:text-zinc-400">No registrations yet</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                    Students will appear here once they register for this event
                  </p>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowRegistrationsModal(false);
                  setSelectedEventForRegistrations(null);
                  setRegistrations([]);
                }}
                className="w-full rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
