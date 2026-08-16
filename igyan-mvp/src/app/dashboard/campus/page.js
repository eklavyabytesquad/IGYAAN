"use client";

import { CalendarDays, MapPin, Users, Clock3, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./campus.module.css";

const REGISTRATIONS_STORAGE_KEY = "igyaan-campus-registered-events";

const events = [
	{ title: "Annual Science Fair 2024", date: "12 January, 2018 · 12:00 am", location: "B/6, New Delhi, India", attendees: "2,350 attendees", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85" },
	{ title: "Inter-house Cultural Evening", date: "18 January, 2018 · 6:30 pm", location: "School Auditorium", attendees: "860 attendees", image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=85" },
	{ title: "Hands-on Discovery Workshop", date: "26 January, 2018 · 10:00 am", location: "Innovation Lab", attendees: "120 attendees", image: "https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=85" },
];

export default function CampusPage() {
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [registeredEvents, setRegisteredEvents] = useState([]);
	const [hasLoadedRegistrations, setHasLoadedRegistrations] = useState(false);

	useEffect(() => {
		const loadRegistrations = window.setTimeout(() => {
			try {
				const savedRegistrations = window.localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
				if (savedRegistrations) {
					const parsedRegistrations = JSON.parse(savedRegistrations);
					if (Array.isArray(parsedRegistrations)) {
						setRegisteredEvents(parsedRegistrations.filter((title) => events.some((event) => event.title === title)));
					}
				}
			} catch {
				// Ignore unavailable or malformed browser storage and use an empty state.
			} finally {
				setHasLoadedRegistrations(true);
			}
		}, 0);

		return () => window.clearTimeout(loadRegistrations);
	}, []);

	useEffect(() => {
		if (!hasLoadedRegistrations) return;

		try {
			window.localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registeredEvents));
		} catch {
			// Registration still works for the current session if storage is unavailable.
		}
	}, [registeredEvents, hasLoadedRegistrations]);

	const toggleRegistration = (event) => {
		setRegisteredEvents((current) => current.includes(event.title)
			? current.filter((title) => title !== event.title)
			: [...current, event.title]);
	};

	return <main className={styles.workspace}>
		<section className={styles.panel}>
			<header className={styles.header}><div><p>Campus</p><h1>Upcoming Events</h1><span>Discover, join, and celebrate what&apos;s happening across your school.</span></div></header>
			<div className={styles.grid}>{events.map((event) => <article className={styles.card} key={event.title}>
				<img src={event.image} alt="" className={styles.cover} />
				<div className={styles.body}><h2>{event.title}</h2><div className={styles.meta}><p><Clock3 size={17} />{event.date}</p><p><MapPin size={17} />{event.location}</p><p><Users size={17} />{event.attendees}</p></div><footer><button type="button" onClick={() => setSelectedEvent(event)}>View details</button><button type="button" onClick={() => toggleRegistration(event)} className={`${styles.register} ${registeredEvents.includes(event.title) ? styles.registered : ""}`}>{registeredEvents.includes(event.title) ? <><CheckCircle2 size={16} /> Registered</> : <>Register <CalendarDays size={16} /></>}</button></footer></div>
			</article>)}</div>
		</section>
		{selectedEvent && <div className={styles.modalLayer} role="dialog" aria-modal="true" aria-labelledby="event-title"><button className={styles.backdrop} aria-label="Close event details" onClick={() => setSelectedEvent(null)} /><section className={styles.modal}><button className={styles.close} aria-label="Close" onClick={() => setSelectedEvent(null)}><X size={20} /></button><img src={selectedEvent.image} alt="" className={styles.modalImage} /><div className={styles.modalBody}><p className={styles.modalEyebrow}>Campus event</p><h2 id="event-title">{selectedEvent.title}</h2><p className={styles.description}>Join your school community for this campus event. Registration helps the organisers plan a great experience for everyone.</p><div className={styles.modalMeta}><span><Clock3 size={17} />{selectedEvent.date}</span><span><MapPin size={17} />{selectedEvent.location}</span><span><Users size={17} />{selectedEvent.attendees}</span></div><button type="button" onClick={() => { toggleRegistration(selectedEvent); setSelectedEvent(null); }} className={styles.modalRegister}>{registeredEvents.includes(selectedEvent.title) ? <><CheckCircle2 size={17} /> Unregister</> : <><CalendarDays size={17} /> Register for event</>}</button></div></section></div>}
	</main>;
}
