"use client";

import { useMemo, useState } from "react";
// Reuse the faculty multi-class curriculum dataset (grades 1-12)
import notesData from "../../copilot-faculty/data/notes.json";
import extraNotes from "../../copilot-faculty/data/notes_extra.json";

export default function NotesSelector({ onNotesSelect, selectedNotes }) {
	const [selectedGrade, setSelectedGrade] = useState(null);
	const [selectedSubject, setSelectedSubject] = useState(null);
	const [selectedChapter, setSelectedChapter] = useState(null);

	const handleTopicSelect = (grade, subject, chapter, topic) => {
		onNotesSelect({ grade, subject, chapter, topic });
	};

	const isSelected = (grade, subject, chapter, topic) => {
		return (
			selectedNotes?.grade === grade &&
			selectedNotes?.subject === subject &&
			selectedNotes?.chapter === chapter &&
			selectedNotes?.topic === topic
		);
	};

	// Merge base notes with extra notes by grade name
	const mergedNotes = useMemo(() => {
		const baseByGrade = new Map((notesData.grades || []).map(g => [g.grade, g]));
		for (const eg of (extraNotes.grades || [])) {
			if (baseByGrade.has(eg.grade)) {
				const existing = baseByGrade.get(eg.grade);
				const existingSubjects = existing.subjects || [];
				const extraSubjects = eg.subjects || [];
				// Avoid duplicate subject names when merging
				const existingNames = new Set(existingSubjects.map(s => s.name));
				const mergedSubjects = [
					...existingSubjects,
					...extraSubjects.filter(s => !existingNames.has(s.name))
				];
				baseByGrade.set(eg.grade, { ...existing, subjects: mergedSubjects });
			} else {
				baseByGrade.set(eg.grade, eg);
			}
		}
		return { grades: Array.from(baseByGrade.values()) };
	}, []);

	const currentGradeData = selectedGrade
		? mergedNotes.grades.find(g => g.grade === selectedGrade)
		: null;

	const currentSubjectData = currentGradeData && selectedSubject
		? currentGradeData.subjects.find(s => s.name === selectedSubject)
		: null;

	return (
		<div className="space-y-3">
			<div className="mb-4">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
					Select Study Material
				</h3>
				{selectedNotes && (
					<div className="rounded-lg bg-indigo-50 p-3 mb-3 dark:bg-indigo-900/40">
						<p className="text-xs font-semibold text-indigo-700 dark:text-indigo-200">
							Currently Selected:
						</p>
						<p className="mt-1 text-xs font-medium text-indigo-800 dark:text-indigo-100">
							{selectedNotes.grade?.replace(/^Grade\b/i, "Class")} → {selectedNotes.subject} → {selectedNotes.chapter} → {selectedNotes.topic}
						</p>
						<button
							onClick={() => onNotesSelect(null)}
							className="mt-2 text-xs font-medium text-red-500 hover:text-red-600"
						>
							Clear Selection
						</button>
					</div>
				)}

				{/* Grade Selector */}
				<div className="mb-3">
					<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
						Select Class
					</label>
					<select
						value={selectedGrade || ""}
						onChange={(e) => {
							setSelectedGrade(e.target.value || null);
							setSelectedSubject(null);
							setSelectedChapter(null);
						}}
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					>
						<option value="">Choose a class...</option>
						{mergedNotes.grades.map((grade) => (
							<option key={grade.grade} value={grade.grade}>
								{grade.grade.replace(/^Grade\b/i, "Class")}
							</option>
						))}
					</select>
				</div>

				{/* Subject Selector */}
				<div className="mb-3">
					<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
						Select Subject
					</label>
					<select
						value={selectedSubject || ""}
						disabled={!selectedGrade}
						onChange={(e) => {
							setSelectedSubject(e.target.value || null);
							setSelectedChapter(null);
						}}
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					>
						<option value="">
							{selectedGrade ? "Choose a subject..." : "Select a class first"}
						</option>
						{(currentGradeData?.subjects || []).map((subject) => (
							<option key={subject.name} value={subject.name}>
								{subject.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{!selectedGrade && (
				<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto h-8 w-8 text-zinc-400 mb-2">
						<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
					</svg>
					<p className="text-xs text-zinc-600 dark:text-zinc-300">
						Please select a class to view subjects
					</p>
				</div>
			)}

			{selectedGrade && !selectedSubject && (
				<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
					<p className="text-xs text-zinc-600 dark:text-zinc-300">
						Please select a subject to view study material
					</p>
				</div>
			)}

			{currentSubjectData && (
				<div className="mt-4">
					<label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Chapter</label>
					<select
						value={selectedChapter || ""}
						onChange={(e) => setSelectedChapter(e.target.value || null)}
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm font-medium text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					>
						<option value="">Choose a chapter...</option>
						{currentSubjectData.chapters.map((chapter) => <option key={chapter.name} value={chapter.name}>{chapter.name}</option>)}
					</select>
					{selectedChapter && (
						<div className="mt-3 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800/50">
							<p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Topics</p>
							<div className="space-y-1">
								{currentSubjectData.chapters.find((chapter) => chapter.name === selectedChapter)?.topics.map((topic) => (
									<button key={topic} onClick={() => handleTopicSelect(selectedGrade, selectedSubject, selectedChapter, topic)} className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${isSelected(selectedGrade, selectedSubject, selectedChapter, topic) ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"}`}>{topic}</button>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
