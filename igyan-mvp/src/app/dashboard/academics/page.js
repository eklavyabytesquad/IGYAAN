"use client";

import { BookOpen, CalendarDays, ChevronRight, Clock3, FileText, MoreVertical, Search, Sparkles, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./academics.module.css";

const notes = [
	{ title: "English Chapter 3 (Introduction to Articles)", teacher: "Rahul Mishra", date: "Uploaded Jul 20, 2025", subject: "English" },
	{ title: "English Chapter 4 (Introduction to Articles)", teacher: "Sandra Lee", date: "Uploaded Oct 5, 2025", subject: "English" },
	{ title: "English Chapter 3 (Introduction to Articles)", teacher: "Michael Chen", date: "Uploaded Dec 15, 2025", subject: "English" },
];
const homework = [{ title: "English Chapter 3 (Introduction to Articles)", teacher: "Rahul Mishra", due: "Due Jul 20, 2025", subject: "English" }];
const tests = [{ title: "Fractions Test", teacher: "Rahul Mishra", date: "Today · 10:00 AM", duration: "30 min", questions: "25 questions", marks: "50 marks" }, { title: "Decimals Test", teacher: "Rahul Mishra", date: "Tomorrow · 11:30 AM", duration: "25 min", questions: "20 questions", marks: "40 marks" }];

export default function AcademicsPage() {
	const [tab, setTab] = useState("tests");
	const [query, setQuery] = useState("");
	const [subject, setSubject] = useState("All subjects");
	const [startedTest, setStartedTest] = useState(null);
	const filtered = useMemo(() => {
		const data = tab === "notes" ? notes : tab === "homework" ? homework : tests;
		return data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) && (subject === "All subjects" || item.subject === subject));
	}, [query, subject, tab]);

	const openAssessment = () => {
		setStartedTest(null);
		const title = encodeURIComponent(startedTest || "Fractions Test");
		const assessmentWindow = window.open(`/dashboard/assessment?title=${title}`, "igyaan-assessment", "noopener,noreferrer");
		if (!assessmentWindow) alert("Please allow pop-ups to open the assessment window.");
	};

	return <main className={styles.workspace}>
		<section className={styles.panel}>
			<nav className={styles.tabs}>{[["notes", "Notes"], ["homework", "Homework"], ["tests", "Tests", "2"]].map(([id, label, count]) => <button key={id} type="button" onClick={() => { setTab(id); setQuery(""); }} className={tab === id ? styles.activeTab : ""}>{label}{count && <span>{count}</span>}</button>)}</nav>
			<div className={styles.content}>
				{tab === "tests" ? <TestsView tests={filtered} onStart={setStartedTest} /> : <ListView tab={tab} items={filtered} query={query} setQuery={setQuery} subject={subject} setSubject={setSubject} />}
			</div>
		</section>
		{startedTest && <div className={styles.testModal}><div><Sparkles size={28} /><h2>{startedTest} is ready</h2><p>Your test will begin when you&apos;re ready. You&apos;ll have 30 minutes to complete it.</p><button type="button" onClick={openAssessment}>Start test</button><button type="button" className={styles.closeModal} onClick={() => setStartedTest(null)}>Not now</button></div></div>}
	</main>;
}

function Filters({ query, setQuery, subject, setSubject, placeholder }) { return <div className={styles.filters}><select value={subject} onChange={(event) => setSubject(event.target.value)}><option>All subjects</option><option>English</option><option>Mathematics</option></select><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /></label></div>; }
function ListView({ tab, items, query, setQuery, subject, setSubject }) { const isNotes = tab === "notes"; return <><header className={styles.sectionHeader}><h1>{isNotes ? "Recent notes" : "Recent homework"}</h1><Filters query={query} setQuery={setQuery} subject={subject} setSubject={setSubject} placeholder={isNotes ? "Search notes" : "Search homework"} /></header><div className={styles.fileList}>{items.length ? items.map((item, index) => <article key={`${item.title}-${index}`} className={styles.fileItem}><span className={isNotes ? styles.pdfIcon : styles.homeworkIcon}>{isNotes ? "PDF" : <BookOpen size={20} />}</span><div><h2>{item.title}</h2><p>{item.due || item.date} <i>•</i> {item.teacher}</p></div><button aria-label={`More actions for ${item.title}`}><MoreVertical size={18} /></button></article>) : <p className={styles.empty}>No {tab} match this search.</p>}</div></>; }
function TestsView({ tests, onStart }) { return <><section className={styles.stats}><Stat icon={BookOpen} label="Upcoming Test" value="1" tone="blue" /><Stat icon={FileText} label="Completed" value="24" tone="purple" /><Stat icon={Sparkles} label="Average Score" value="72%" tone="green" /></section><h1 className={styles.testHeading}>Upcoming tests</h1><div className={styles.testList}>{tests.map((test) => <article className={styles.testCard} key={test.title}><span className={styles.available}>Available now</span><small>MATHEMATICS</small><h2>{test.title}</h2><p>{test.teacher}</p><div className={styles.testMeta}><span><CalendarDays size={14} />{test.date}</span><span><Clock3 size={14} />{test.duration}</span><span><Timer size={14} />{test.questions}</span><span><FileText size={14} />{test.marks}</span></div><button type="button" onClick={() => onStart(test.title)}>Start Test <ChevronRight size={16} /></button></article>)}</div><header className={styles.sectionHeader}><h1>Recent</h1><Filters query="" setQuery={() => {}} subject="All subjects" setSubject={() => {}} placeholder="Search test" /></header><div className={styles.results}>{[["32/50 (70%)", "rose"], ["32/50 (70%)", "green"], ["0/50 (Missed)", "amber"]].map(([score, tone], index) => <article key={index}><small>MATHEMATICS</small><h2>Fractions Test</h2><p>Rahul Mishra</p><span className={styles[tone]}>{score}</span></article>)}</div></>; }
function Stat({ icon: Icon, label, value, tone }) { return <article className={styles.stat}><span className={styles[tone]}><Icon size={20} /></span><div><small>{label}</small><strong>{value}</strong></div></article>; }
