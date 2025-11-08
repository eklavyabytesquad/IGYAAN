'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Search, Filter, Building2, Users, Globe } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../utils/auth_context';

export default function PublicEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [schools, setSchools] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchPublicEvents();
    if (user?.id) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchPublicEvents = async () => {
    // Fetch events
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('is_public', true)
      .order('start_date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      alert('Failed to load events.');
      return;
    }

    if (eventsData && eventsData.length > 0) {
      // Get unique school IDs
      const schoolIds = [...new Set(eventsData.map(event => event.school_id))];
      
      // Fetch school details for all school IDs
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, school_name, city, state, country, contact_email, contact_phone')
        .in('id', schoolIds);

      if (schoolsError) {
        console.warn('Error fetching schools:', schoolsError);
      }

      // Create a map of school data
      const schoolsMap = {};
      if (schoolsData) {
        schoolsData.forEach(school => {
          schoolsMap[school.id] = school;
        });
      }

      // Attach school data to events
      const eventsWithSchools = eventsData.map(event => ({
        ...event,
        schools: schoolsMap[event.school_id] || null
      }));

      setEvents(eventsWithSchools);
      setSchools(schoolsMap);
    } else {
      setEvents([]);
      setSchools({});
    }
  };

  const fetchRegistrations = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('event_registrations')
      .select('event_id, status')
      .eq('user_id', user.id);

    if (!error && data) {
      setRegistrations(data);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user?.id) {
      alert('Please log in to register for events.');
      return;
    }

    const { error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id: eventId,
        user_id: user.id,
        user_name: user.full_name || null,
        user_email: user.email || null,
        user_phone: user.phone || null,
        status: 'registered',
      }]);

    if (error) {
      console.error('Registration error:', error);
      if (error.code === '23505') {
        alert('You are already registered for this event!');
      } else {
        alert(`Error: ${error.message}`);
      }
    } else {
      fetchRegistrations();
      setSelectedEvent(null);
      alert('Successfully registered for the event!');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;

    const { error } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (!error) {
      fetchRegistrations();
      alert('Registration cancelled successfully.');
    }
  };

  const isRegistered = (eventId) => {
    return registrations.some(reg => reg.event_id === eventId && reg.status === 'registered');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.schools?.school_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesSchool = filterSchool === 'all' || event.school_id === filterSchool;
    return matchesSearch && matchesType && matchesSchool;
  });

  return (
    <div className="flex h-screen w-full flex-col gap-6 overflow-hidden p-4 lg:p-8" style={{ backgroundColor: 'var(--dashboard-background)' }}>
      {/* Header */}
      <header className="rounded-3xl dashboard-card p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl p-4 text-white shadow-lg" style={{ background: 'var(--dashboard-primary)' }}>
            <Globe size={28} />
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--dashboard-heading)' }}>
              Public Events
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--dashboard-muted)' }}>
              Discover and explore events from schools across the platform
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search events or schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2">
              <Filter size={20} className="text-zinc-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="all">All Event Types</option>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="competition">Competition</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>

            <div className="flex flex-1 items-center gap-2">
              <Building2 size={20} className="text-zinc-500" />
              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="all">All Schools</option>
                {Object.entries(schools).map(([id, school]) => (
                  <option key={id} value={id}>{school.school_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Total Events</p>
            <p className="mt-1 text-2xl font-bold text-rose-900 dark:text-rose-100">{events.length}</p>
          </div>
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 dark:border-pink-900 dark:bg-pink-950">
            <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">Participating Schools</p>
            <p className="mt-1 text-2xl font-bold text-pink-900 dark:text-pink-100">{Object.keys(schools).length}</p>
          </div>
          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-3 dark:border-fuchsia-900 dark:bg-fuchsia-950">
            <p className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400">Showing Results</p>
            <p className="mt-1 text-2xl font-bold text-fuchsia-900 dark:text-fuchsia-100">{filteredEvents.length}</p>
          </div>
        </div>
      </header>

      {/* Events Grid */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg transition hover:shadow-xl dark:border-white/10 dark:bg-zinc-900"
            >
              {event.banner_image && (
                <div className="h-40 w-full overflow-hidden bg-linear-to-br from-rose-100 to-fuchsia-100 dark:from-rose-950 dark:to-fuchsia-950">
                  <img src={event.banner_image} alt={event.title} className="h-full w-full object-cover" />
                </div>
              )}
              
              <div className="p-5">
                {/* School Badge */}
                <div className="mb-3 space-y-1">
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 dark:bg-rose-950">
                    <Building2 size={14} className="text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                      {event.schools?.school_name || 'School'}
                    </span>
                  </div>
                  {event.schools?.city && event.schools?.state && (
                    <div className="flex items-center gap-2 px-3">
                      <MapPin size={12} className="text-zinc-500" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {event.schools.city}, {event.schools.state}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="mb-2 text-lg font-bold text-zinc-800 dark:text-zinc-100">{event.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-lg bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {event.event_type}
                    </span>
                    {user && isRegistered(event.id) && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        ✓ Registered
                      </span>
                    )}
                  </div>
                </div>

                <p className="mb-4 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{event.description}</p>

                <div className="mb-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
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
                    <span>Up to {event.max_participants} participants</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEvent(event)}
                  className="w-full rounded-xl bg-linear-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-rose-400/40"
                >
                  {user ? (isRegistered(event.id) ? 'View Details & Manage' : 'View Details & Register') : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="flex h-64 items-center justify-center text-zinc-500">
            <p>No public events found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
            <h2 className="mb-4 text-2xl font-bold text-zinc-800 dark:text-zinc-100">{selectedEvent.title}</h2>
            
            {selectedEvent.banner_image && (
              <img 
                src={selectedEvent.banner_image} 
                alt={selectedEvent.title} 
                className="mb-4 w-full rounded-xl object-cover"
              />
            )}

            {/* School Info */}
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950">
              <div className="flex items-center gap-3">
                <Building2 size={24} className="text-rose-600 dark:text-rose-400" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900 dark:text-rose-100">
                    {selectedEvent.schools?.school_name || 'School'}
                  </p>
                  {selectedEvent.schools?.city && selectedEvent.schools?.state && (
                    <p className="text-sm text-rose-700 dark:text-rose-300">
                      {selectedEvent.schools.city}, {selectedEvent.schools.state}
                      {selectedEvent.schools.country && `, ${selectedEvent.schools.country}`}
                    </p>
                  )}
                  {selectedEvent.schools?.contact_email && selectedEvent.schools?.contact_phone && (
                    <div className="mt-2 space-y-1 text-xs text-rose-600 dark:text-rose-400">
                      <p>📧 {selectedEvent.schools.contact_email}</p>
                      <p>📞 {selectedEvent.schools.contact_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock size={18} className="text-rose-600" />
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Event Schedule</p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {new Date(selectedEvent.start_date).toLocaleString()} - {new Date(selectedEvent.end_date).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="text-rose-600" />
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Location</p>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Users size={18} className="text-rose-600" />
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Capacity</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Maximum {selectedEvent.max_participants} participants</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar size={18} className="text-red-600" />
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Registration Deadline</p>
                  <p className="text-zinc-600 dark:text-zinc-400">{new Date(selectedEvent.registration_deadline).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-zinc-700 dark:text-zinc-300">About This Event</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedEvent.description}</p>
            </div>

            {user ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Close
                </button>
                {isRegistered(selectedEvent.id) ? (
                  <button
                    onClick={() => {
                      handleCancelRegistration(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    className="flex-1 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                  >
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleRegister(selectedEvent.id);
                    }}
                    className="flex-1 rounded-xl bg-linear-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-rose-400/40"
                  >
                    Register Now
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    📧 Interested in participating?
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    Please log in to register for this event.
                    {selectedEvent.schools && ` Contact ${selectedEvent.schools.school_name} at ${selectedEvent.schools.contact_email} for more information.`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
