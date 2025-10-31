"use client";

import { useState } from "react";
import studentProfile from "../data/student-profile.json";

export default function StudentProfile({ aiName, onAiNameChange }) {
	const [isEditingName, setIsEditingName] = useState(false);
	const [tempName, setTempName] = useState(aiName || "");

	const handleSaveName = () => {
		if (tempName.trim()) {
			onAiNameChange(tempName.trim());
			setIsEditingName(false);
		}
	};

	const handleCancelEdit = () => {
		setTempName(aiName || "");
		setIsEditingName(false);
	};

	return (
		<div className="space-y-4">
			<div className="text-center">
				<div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
					{studentProfile.name.split(" ").map((n) => n[0]).join("")}
				</div>
				<h3 className="text-lg font-bold text-zinc-900 dark:text-white">
					{studentProfile.name}
				</h3>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Class {studentProfile.class} Student
				</p>
			</div>

			{/* AI Companion Name Section */}
			<div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/30">
				<div className="flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
					</svg>
					<p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
						AI Companion Name
					</p>
				</div>
				
				{isEditingName ? (
					<div className="space-y-2">
						<input
							type="text"
							value={tempName}
							onChange={(e) => setTempName(e.target.value)}
							placeholder="Enter AI companion name"
							className="w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-purple-700 dark:bg-zinc-800 dark:text-white"
							autoFocus
						/>
						<div className="flex gap-2">
							<button
								onClick={handleSaveName}
								className="flex-1 rounded-lg bg-purple-500 px-3 py-2 text-xs font-medium text-white hover:bg-purple-600"
							>
								Save
							</button>
							<button
								onClick={handleCancelEdit}
								className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-purple-900 dark:text-purple-100">
							{aiName || "AI Companion"}
						</p>
						<button
							onClick={() => {
								setTempName(aiName || "");
								setIsEditingName(true);
							}}
							className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/50"
							title="Edit AI name"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
							</svg>
						</button>
					</div>
				)}
				<p className="text-xs text-purple-600 dark:text-purple-400">
					Customize your AI assistant's name
				</p>
			</div>

			<div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="flex items-start gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-500 shrink-0">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
						</svg>
						<div className="flex-1 text-left">
							<p className="text-xs text-zinc-500 dark:text-zinc-400">School</p>
							<p className="text-sm font-medium text-zinc-900 dark:text-white">
								{studentProfile.school.name}
							</p>
							<p className="text-xs text-zinc-600 dark:text-zinc-400">
								{studentProfile.school.location} · {studentProfile.school.board}
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-500 shrink-0">
							<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25v-1.5a4.5 4.5 0 10-9 0v1.5m-.75 4.5c0 3.727 2.85 6.75 6.375 6.75S19.5 16.477 19.5 12.75v-1.5a.75.75 0 01.75-.75h.75a.75.75 0 000-1.5h-.847a3.001 3.001 0 01-2.903-2.403l-.122-.733a3.75 3.75 0 00-7.458 0l-.122.733A3.001 3.001 0 016.847 8.25H6a.75.75 0 000 1.5h.75a.75.75 0 01.75.75v1.5z" />
						</svg>
						<div className="flex-1 text-left">
							<p className="text-xs text-zinc-500 dark:text-zinc-400">Mentor Circle</p>
							<ul className="space-y-1">
								{studentProfile.mentors?.map((mentor) => (
									<li key={mentor.name} className="text-xs text-zinc-600 dark:text-zinc-400">
										<span className="font-medium text-zinc-900 dark:text-white">{mentor.name}</span> · {mentor.role}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					<div className="flex items-start gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-500 shrink-0">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75h.008v.008H12V6.75zm0 0C9.541 6.75 6.75 6.04 6.75 3.75c0 2.29-2.791 3-5.25 3 .33 5.985 4.687 10.5 10.5 10.5S21.42 12.735 21.75 6.75c-2.459 0-5.25-.71-5.25-3 0 2.29-2.791 3-5.25 3z" />
						</svg>
						<div className="flex-1 text-left">
							<p className="text-xs text-zinc-500 dark:text-zinc-400">Class Snapshot</p>
							<p className="text-sm font-medium text-zinc-900 dark:text-white">
								Grade {studentProfile.class} · Section {studentProfile.section} · House {studentProfile.house}
							</p>
							<p className="text-xs text-zinc-600 dark:text-zinc-400">Age {studentProfile.age} · Class Teacher {studentProfile.classTeacher}</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-500 shrink-0">
							<path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
						</svg>
						<div className="flex-1 text-left">
							<p className="text-xs text-zinc-500 dark:text-zinc-400">Daily Rhythm</p>
							<p className="text-sm font-medium text-zinc-900 dark:text-white">Sleeps by {studentProfile.sleepTime}</p>
							<p className="text-xs text-zinc-600 dark:text-zinc-400">
								Weekdays: {studentProfile.studySchedule?.weekday} · Weekends: {studentProfile.studySchedule?.weekend}
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-start gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
				</svg>
				<div className="flex-1">
					<p className="text-xs text-zinc-500 dark:text-zinc-400">Interests</p>
					<div className="mt-1 flex flex-wrap gap-1">
						{studentProfile.interests.map((interest) => (
							<span key={interest} className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
								{interest}
							</span>
						))}
					</div>
				</div>
			</div>
			</div>

			{studentProfile.strengths && (
				<div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
					<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Signature Strengths</p>
					<ul className="mt-2 space-y-2">
						{studentProfile.strengths.map((item) => (
							<li key={item} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
								<span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{studentProfile.growthAreas && (
				<div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/30">
					<p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">Next Focus Moves</p>
					<ul className="mt-2 space-y-2">
						{studentProfile.growthAreas.map((item) => (
							<li key={item} className="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-200">
								<span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{studentProfile.academicGoals && (
				<div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
					<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mission Log</p>
					<ol className="mt-2 list-decimal space-y-2 pl-4 text-sm text-zinc-700 dark:text-zinc-300">
						{studentProfile.academicGoals.map((goal) => (
							<li key={goal}>{goal}</li>
						))}
					</ol>
				</div>
			)}

			{studentProfile.recentWins && (
				<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
					<p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Recent High-fives</p>
					<ul className="mt-2 space-y-2">
						{studentProfile.recentWins.map((win) => (
							<li key={win} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-100">
								<span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
								<span>{win}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{studentProfile.favoriteSubjects && (
				<div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
					<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Favourite Arenas</p>
					<div className="mt-2 flex flex-wrap gap-2">
						{studentProfile.favoriteSubjects.map((subject) => (
							<span key={subject} className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-100">
								{subject}
							</span>
						))}
					</div>
				</div>
			)}

			{studentProfile.funFact && (
				<div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left dark:border-orange-800 dark:bg-orange-900/20">
					<p className="text-xs font-semibold uppercase tracking-wide text-orange-500 dark:text-orange-300">Fun Fact</p>
					<p className="mt-1 text-sm text-orange-700 dark:text-orange-100">{studentProfile.funFact}</p>
				</div>
			)}
		</div>
	);
}
