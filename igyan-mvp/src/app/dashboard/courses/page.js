"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Lock, X } from "lucide-react";
import styles from "./learn.module.css";

const subjects = [
	{ id: "base-layer", name: "English", tone: "english", image: "/learn-english-cover.png" },
	{ id: "mathematics", name: "Mathematics", tone: "math", label: "MATHS\nMODE" },
	{ id: "science", name: "Science", tone: "science", label: "Social\nStudies" },
	{ id: "hindi", name: "Hindi", tone: "hindi", label: "अभिव्यक्ति" },
	{ id: "environmental-studies", name: "Environmental Studies", tone: "environment", label: "MY BOOK OF\nGRAMMAR" },
	{ id: "computer-science", name: "Computer Science", tone: "computer", label: "Computer\nStudies" },
	{ id: "art-and-craft", name: "Art & Craft", tone: "art", label: "ART &\nCRAFT" },
	{ id: "physical-education", name: "Physical Education", tone: "physical", label: "PHYSICAL\nEDUCATION" },
	{ id: "social-studies", name: "Social Studies", tone: "social" },
];

const chapters = [
	"Exploring figurative language and imagery",
	"Exploring past continuous",
	"Understanding conditional sentences",
	"Diving into adjectives and adverbs",
	"The art of storytelling",
	"Crafting persuasive essays",
	"Analyzing poetry and rhythm",
	"Introduction to narrative techniques",
	"Techniques in character development",
	"Writing compelling dialogues",
];

export default function CoursesPage() {
	const router = useRouter();
	const [selectedSubject, setSelectedSubject] = useState(null);
	const [chapterError, setChapterError] = useState("");

	const openChapter = (chapterIndex) => {
		if (chapterIndex > 5) {
			setChapterError("Complete the previous chapter first.");
			return;
		}
		if (!selectedSubject) return;
		setChapterError("");
		router.push(`/dashboard/courses/${selectedSubject.id}?chapter=${chapterIndex + 1}`);
	};

	return (
		<main className={styles.workspace}>
			<section className={styles.catalogue} aria-labelledby="subjects-heading">
				<h1 id="subjects-heading">Subjects</h1>
				<div className={styles.grid}>
					{subjects.map((subject) => (
						<button
							key={subject.id}
							type="button"
							className={styles.subject}
							onClick={() => { setSelectedSubject(subject); setChapterError(""); }}
							aria-label={`Open ${subject.name}`}
						>
							<div className={`${styles.cover} ${styles[subject.tone]}`}>
								{subject.image ? (
									<Image src={subject.image} alt={`${subject.name} Class 4 textbook`} fill sizes="(max-width: 640px) 40vw, 194px" priority className={styles.coverImage} />
								) : subject.label ? (
									<span>{subject.label.split("\n").map((line) => <span key={line}>{line}</span>)}</span>
								) : null}
							</div>
							<span className={styles.title}>{subject.name}</span>
							<span className={styles.meta}>CBSE <i>•</i> Class 4</span>
						</button>
					))}
				</div>
			</section>

			{selectedSubject && (
				<div className={styles.chapterLayer} role="dialog" aria-modal="true" aria-labelledby="chapter-heading">
					<button className={styles.backdrop} type="button" aria-label="Close chapter list" onClick={() => setSelectedSubject(null)} />
					<aside className={styles.chapterPanel}>
						<div className={styles.panelHeader}>
							<h2 id="chapter-heading">Chapter</h2>
							<button type="button" onClick={() => setSelectedSubject(null)} aria-label="Close chapter list"><X size={20} /></button>
						</div>
						<div className={styles.chapterList}>
							{chapterError && <p className={styles.chapterError} role="alert">{chapterError}</p>}
							{chapters.map((chapter, index) => {
								const locked = index > 5;
								return <button key={chapter} type="button" aria-disabled={locked} onClick={() => openChapter(index)} className={`${styles.chapter} ${index === 0 ? styles.activeChapter : ""} ${locked ? styles.lockedChapter : ""}`}>
									<span><small>CHAPTER {index + 1}</small><strong>{chapter}</strong></span>
									{locked ? <Lock size={19} /> : <ChevronRight size={20} />}
								</button>;
							})}
						</div>
					</aside>
				</div>
			)}
		</main>
	);
}
