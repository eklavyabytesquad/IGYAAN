'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../utils/auth_context';

export default function StudentEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
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
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen w-full flex-col gap-6 overflow-hidden bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 p-4 lg:p-8 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 p-4 text-white shadow-lg">
            <Calendar size={28} />
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
              Upcoming Events
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              Browse and register for school events, competitions, and activities
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-zinc-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="all">All Types</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="competition">Competition</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>
        </div>
      </header>

      {/* Events Grid */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => {
            const registered = isRegistered(event.id);
            return (
              <div
                key={event.id}
                className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg transition hover:shadow-xl dark:border-white/10 dark:bg-zinc-900"
              >
                {event.banner_image && (
                  <div className="h-40 w-full overflow-hidden bg-linear-to-br from-green-100 to-teal-100 dark:from-green-950 dark:to-teal-950">
                    <img src={event.banner_image} alt={event.title} className="h-full w-full object-cover" />
                  </div>
                )}
                
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="mb-2 text-lg font-bold text-zinc-800 dark:text-zinc-100">{event.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-lg bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                        {event.event_type}
                      </span>
                      {registered && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          <CheckCircle size={12} />
                          Registered
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{event.description}</p>

                  <div className="mb-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>Starts: {new Date(event.start_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>Max {event.max_participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span className="text-red-600 dark:text-red-400">
                        Register by: {new Date(event.registration_deadline).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 dark:border-green-900 dark:bg-zinc-800 dark:text-green-300 dark:hover:bg-zinc-700"
                    >
                      View Details
                    </button>
                    {registered ? (
                      <button
                        onClick={() => handleCancelRegistration(event.id)}
                        className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        className="flex-1 rounded-xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-green-400/40"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="flex h-64 items-center justify-center text-zinc-500">
            <p>No events available at the moment.</p>
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

            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock size={18} className="text-green-600" />
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Event Schedule</p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {new Date(selectedEvent.start_date).toLocaleString()} - {new Date(selectedEvent.end_date).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="text-green-600" />
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Location</p>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Users size={18} className="text-green-600" />
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

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Close
              </button>
              {!isRegistered(selectedEvent.id) && (
                <button
                  onClick={() => {
                    handleRegister(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 rounded-xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-green-400/40"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
