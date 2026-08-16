"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BarChart3, BookOpen, ChevronLeft, ChevronRight, Clock3, FileText, Gamepad2, Lightbulb, MoreVertical, Sparkles } from "lucide-react";
import styles from "./premium-student-dashboard.module.css";

const courses = [
	{ subject: "Mathematics", title: "Chapter 5: Understanding Algebra", progress: 75, cover: "/learn-english-cover.png" },
	{ subject: "History", title: "Chapter 3: The Rise of Ancient Cultures", progress: 50, cover: "/king-midas-chapter.png" },
];

const updates = [
	[FileText, "English Chapter 3 Notes", "Rahul Mishra · Today", "pdf"],
	[BookOpen, "Maths Homework Assigned", "Sandra Lee · 2 hours ago", "homework"],
	[FileText, "Science Study Material", "Rahul Mishra · Yesterday", "material"],
];

const games = [
	["Math Quest", "/games/math-quest.png"],
	["Mystery of Shapes", "/games/mystery-of-shapes.png"],
	["History Heroes", "/games/history-heroes.png"],
	["Biology Battles", "/games/biology-battles.png"],
];

export default function PremiumStudentDashboard({ firstName }) {
	return <div className={styles.page}>
		<div className={styles.contentGrid}>
			<div className={styles.mainColumn}>
				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<h1>Good Morning, {firstName} <span>👋</span></h1>
						<p>You have <b>1 class</b> and <b>2 tasks</b> waiting for you today.</p>
					</div>
					<Image src="/figma-dashboard/hero.png" width={330} height={193} priority alt="Student learning" className={styles.heroArt}/>
				</section>

				<section className={styles.metrics}>
					<Metric icon={BookOpen} label="Courses" value="23" tone="blue" />
					<Metric icon={BarChart3} label="Overall performance" value="23%" tone="violet" />
					<Metric icon={Clock3} label="Learning time" value="2 hr" tone="green" />
				</section>

				<SectionTitle title="Continue Learning" />
				<section className={styles.courseGrid}>{courses.map((course) => <article key={course.title} className={styles.course}>
					<Image src={course.cover} width={206} height={272} alt="" className={styles.courseCover}/>
					<div className={styles.courseInfo}>
						<span className={styles.subject}>{course.subject}</span>
						<h3>{course.title}</h3>
						<p>Last studied yesterday</p>
						<span className={styles.progressLabel}>Progress: {course.progress}%</span>
						<div className={styles.progress}><i style={{ width: `${course.progress}%` }}/></div>
					</div>
					<Link className={styles.continueButton} href="/dashboard/courses">Continue</Link>
				</article>)}</section>

				<section className={styles.updates}><SectionTitle title="Recent from your teachers" action="View all" actionHref="/dashboard/academics" />
					{updates.map(([Icon, title, meta, tone]) => <article key={title} className={styles.update}>
						<span className={`${styles.document} ${styles[tone]}`}><Icon size={20}/></span><div><h3>{title}</h3><p>{meta}</p></div><button aria-label={`More options for ${title}`}><MoreVertical size={19}/></button>
					</article>)}
				</section>

				<section className={styles.games}><SectionTitle title="Recommended Games" action="View all" actionHref="/dashboard/games" />
					<div className={styles.gameGrid}>{games.map(([title, image]) => <Link href="/dashboard/games" className={styles.game} key={title}><Image src={image} alt={title} fill sizes="(max-width: 700px) 50vw, 200px"/></Link>)}</div>
				</section>
			</div>
			<aside className={styles.utility}><AttendanceCalendar /><section className={styles.upcomingPanel}><SectionTitle title="Upcoming" />
				<article className={styles.upcomingTask}><h3>Vocabulary Test</h3><p className={styles.due}>Due Today · 12:00 PM</p></article>
				<article className={styles.upcomingTask}><h3>Vocabulary Wizard</h3><p>Due Friday</p></article>
			</section></aside>
		</div>
	</div>;
}

function Metric({ icon: Icon, label, value, tone }) { return <article className={styles.metric}><span className={styles[tone]}><Icon size={22}/></span><div><p>{label}</p><strong>{value}</strong></div></article>; }
function SectionTitle({ title, action, actionHref }) { return <div className={styles.sectionTitle}><h2>{title}</h2>{action && <Link href={actionHref}>{action}</Link>}</div>; }

function AttendanceCalendar() {
	const currentDate = new Date();
	const [month, setMonth] = useState(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
	const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
	const year = month.getFullYear();
	const monthIndex = month.getMonth();
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
	const calendar = [...Array(month.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
	const isCurrentMonth = year === currentDate.getFullYear() && monthIndex === currentDate.getMonth();
	const present = new Set(isCurrentMonth ? Array.from({ length: Math.max(currentDate.getDate() - 1, 0) }, (_, index) => index + 1).filter((day) => ![2, 3].includes(day)) : []);
	const absent = new Set(isCurrentMonth ? [2, 3].filter((day) => day < currentDate.getDate()) : []);
	const changeMonth = (offset) => {
		setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
		setSelectedDate(null);
	};

	return <section className={styles.calendar}><div className={styles.calendarTitle}><button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={18}/></button><h2>{month.toLocaleString("en-US", { month: "long" })} Attendance</h2><button type="button" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={18}/></button></div><div className={styles.week}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => <span key={day}>{day}</span>)}</div><div className={styles.days}>{calendar.map((day, index) => !day ? <span key={`blank-${index}`} /> : <button key={day} type="button" onClick={() => setSelectedDate(day)} className={isCurrentMonth && day === currentDate.getDate() ? styles.today : selectedDate === day ? styles.today : present.has(day) ? styles.present : absent.has(day) ? styles.missed : styles.future}>{day}</button>)}</div></section>;
}
