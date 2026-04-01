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
        <div className="rounded-2xl border p-4 shadow-lg" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--dashboard-heading)' }}>School Onboarding Required</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
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
                <div className="h-40 w-full overflow-hidden" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
                  <img src={event.banner_image} alt={event.title} className="h-full w-full object-cover" />
                </div>
              )}
              
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{event.title}</h3>
                    <span
                      className="inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
                        color: 'var(--dashboard-primary)'
                      }}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="rounded-lg p-2 transition"
                      style={{ color: 'var(--dashboard-primary)' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="rounded-lg p-2 transition hover:opacity-80"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>{event.description}</p>

                <div className="space-y-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
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
                  className="mt-3 w-full rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:opacity-90"
                  style={{ background: 'var(--dashboard-primary)' }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users size={14} />
                    <span>View Registrations</span>
                  </div>
                </button>

                {event.is_public && (
                  <div
                    className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
                      color: 'var(--dashboard-primary)'
                    }}
                  >
                    🌐 Public Event
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="flex h-64 items-center justify-center" style={{ color: 'var(--dashboard-muted)' }}>
            <p>No events found. Create your first event!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
            <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                  placeholder="Event description"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
                    style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
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
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
                    style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
                    style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
                    style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Max Participants</label>
                  <input
                    type="number"
                    required
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
                    style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                    placeholder="Max participants"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Registration Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
                    style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Banner Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.banner_image}
                  onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
                  style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'var(--dashboard-primary)' }}
                />
                <label htmlFor="is_public" className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
                  Make this event public (visible to everyone)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border px-6 py-3 text-sm font-semibold transition hover:opacity-80"
                  style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--dashboard-primary)' }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border p-6 shadow-2xl" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                  Event Registrations
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
                  {selectedEventForRegistrations.title}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
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
                className="rounded-lg p-2 transition hover:opacity-70"
                style={{ color: 'var(--dashboard-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Registrations', value: registrations.length },
                { label: 'Registered', value: registrations.filter(r => r.status === 'registered').length },
                { label: 'Cancelled', value: registrations.filter(r => r.status === 'cancelled').length },
                { label: 'Attended', value: registrations.filter(r => r.status === 'attended').length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border p-3" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--dashboard-primary)' }}>{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <div className="mb-4">
              <button
                onClick={downloadExcel}
                disabled={registrations.length === 0}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--dashboard-primary)' }}
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
                    <tr className="border-b" style={{ borderColor: 'var(--dashboard-border)' }}>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--dashboard-text)' }}>Name</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--dashboard-text)' }}>Email</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--dashboard-text)' }}>Phone</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--dashboard-text)' }}>Status</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--dashboard-text)' }}>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr 
                        key={reg.id} 
                        className="border-b transition"
                        style={{ borderColor: 'var(--dashboard-border)' }}
                      >
                        <td className="px-4 py-3" style={{ color: 'var(--dashboard-heading)' }}>
                          {reg.user_name || <span style={{ color: 'var(--dashboard-muted)' }}>N/A</span>}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--dashboard-muted)' }}>
                          {reg.user_email || <span style={{ color: 'var(--dashboard-muted)' }}>N/A</span>}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--dashboard-muted)' }}>
                          {reg.user_phone || <span style={{ color: 'var(--dashboard-muted)' }}>N/A</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
                              color: 'var(--dashboard-primary)'
                            }}
                          >
                            {reg.status === 'registered' && <CheckCircle size={12} />}
                            {reg.status === 'cancelled' && <XCircle size={12} />}
                            {reg.status === 'attended' && <CheckCircle size={12} />}
                            {reg.status === 'waitlisted' && <AlertCircle size={12} />}
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                          {new Date(reg.registered_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--dashboard-border)' }}>
                <div className="text-center">
                  <Users size={48} className="mx-auto mb-3" style={{ color: 'var(--dashboard-muted)' }} />
                  <p className="font-semibold" style={{ color: 'var(--dashboard-text)' }}>No registrations yet</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
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
                className="w-full rounded-xl border px-6 py-3 text-sm font-semibold transition hover:opacity-80"
                style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
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
