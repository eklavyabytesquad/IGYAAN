"use client";

import { useState } from "react";
import notesData from "../data/notes.json";

export default function NotesSelector({ onNotesSelect, selectedNotes }) {
	const [expandedSubject, setExpandedSubject] = useState(null);
	const [expandedChapter, setExpandedChapter] = useState(null);

	const handleTopicSelect = (subject, chapter, topic) => {
		onNotesSelect({ subject, chapter, topic });
	};

	const isSelected = (subject, chapter, topic) => {
		return (
			selectedNotes?.subject === subject &&
			selectedNotes?.chapter === chapter &&
			selectedNotes?.topic === topic
		);
	};

	return (
		<div className="space-y-3">
			<div className="mb-4">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
					Select Study Material
				</h3>
				{selectedNotes && (
					<div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/30">
						<p className="text-xs font-medium text-purple-700 dark:text-purple-300">
							Currently Selected:
						</p>
						<p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
							{selectedNotes.subject} → {selectedNotes.chapter} → {selectedNotes.topic}
						</p>
						<button
							onClick={() => onNotesSelect(null)}
							className="mt-2 text-xs text-red-500 hover:text-red-600"
						>
							Clear Selection
						</button>
					</div>
				)}
			</div>

			{notesData.subjects.map((subject) => (
				<div key={subject.name} className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50">
					<button
						onClick={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
						className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
					>
						<div className="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-500">
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
													onClick={() => handleTopicSelect(subject.name, chapter.name, topic)}
													className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
														isSelected(subject.name, chapter.name, topic)
															? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
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
