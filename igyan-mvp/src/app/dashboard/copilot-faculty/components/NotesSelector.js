"use client";

import { useMemo, useState } from "react";
import notesData from "../data/notes.json";
import extraNotes from "../data/notes_extra.json";

export default function NotesSelector({ onNotesSelect, selectedNotes }) {
	const [selectedGrade, setSelectedGrade] = useState(null);
	const [expandedSubject, setExpandedSubject] = useState(null);
	const [expandedChapter, setExpandedChapter] = useState(null);

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

	return (
		<div className="space-y-3">
			<div className="mb-4">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
					Select Study Material
				</h3>
				{selectedNotes && (
					<div className="rounded-lg bg-indigo-50 p-3 mb-3 dark:bg-indigo-900/30">
						<p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
							Currently Selected:
						</p>
						<p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
							{selectedNotes.grade} → {selectedNotes.subject} → {selectedNotes.chapter} → {selectedNotes.topic}
						</p>
						<button
							onClick={() => onNotesSelect(null)}
							className="mt-2 text-xs text-red-500 hover:text-red-600"
						>
							Clear Selection
						</button>
					</div>
				)}

				{/* Grade Selector */}
				<div className="mb-3">
					<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
						Select Grade
					</label>
					<select
						value={selectedGrade || ""}
						onChange={(e) => {
							setSelectedGrade(e.target.value || null);
							setExpandedSubject(null);
							setExpandedChapter(null);
						}}
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					>
						<option value="">Choose a grade...</option>
						{mergedNotes.grades.map((grade) => (
							<option key={grade.grade} value={grade.grade}>
								{grade.grade}
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
					<p className="text-xs text-zinc-600 dark:text-zinc-400">
						Please select a grade to view subjects
					</p>
				</div>
			)}

			{currentGradeData && currentGradeData.subjects.map((subject) => (
				<div key={subject.name} className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50">
					<button
						onClick={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
						className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
					>
						<div className="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-indigo-500">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
							</svg>
							<span className="text-sm font-medium text-zinc-900 dark:text-white">
								{subject.name}
							</span>
						</div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className={`h-4 w-4 text-zinc-500 transition-transform ${
								expandedSubject === subject.name ? "rotate-180" : ""
							}`}
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
						</svg>
					</button>

					{expandedSubject === subject.name && (
						<div className="border-t border-zinc-200 p-2 dark:border-zinc-700">
							{subject.chapters.map((chapter) => (
								<div key={chapter.name} className="mb-2">
									<button
										onClick={() => setExpandedChapter(expandedChapter === chapter.name ? null : chapter.name)}
										className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
									>
										<span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
											{chapter.name}
										</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className={`h-3 w-3 text-zinc-500 transition-transform ${
												expandedChapter === chapter.name ? "rotate-180" : ""
											}`}
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
										</svg>
									</button>

									{expandedChapter === chapter.name && (
										<div className="ml-4 mt-1 space-y-1">
											{chapter.topics.map((topic) => (
												<button
													key={topic}
													onClick={() => handleTopicSelect(selectedGrade, subject.name, chapter.name, topic)}
													className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
														isSelected(selectedGrade, subject.name, chapter.name, topic)
															? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
															: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
													}`}
												>
													{topic}
												</button>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
