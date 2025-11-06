"use client";

import { useState } from "react";

export default function ProfileSetupForm({ onSave, userName }) {
	const [formData, setFormData] = useState({
		name: userName || "",
		class: "",
		section: "",
		age: "",
		schoolName: "",
		schoolLocation: "",
		interests: "",
		learningStyle: "",
		academicGoals: "",
		favoriteSubjects: "",
		sleepTime: "",
		studyScheduleWeekday: "",
		studyScheduleWeekend: ""
	});

	const handleChange = (e) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		
		const profileData = {
			name: formData.name,
			class: formData.class,
			section: formData.section,
			age: parseInt(formData.age) || "",
			classTeacher: "",
			house: "",
			school: {
				name: formData.schoolName,
				location: formData.schoolLocation,
				board: ""
			},
			interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
			learningStyle: formData.learningStyle,
			strengths: [],
			growthAreas: [],
			academicGoals: formData.academicGoals.split(',').map(g => g.trim()).filter(Boolean),
			recentWins: [],
			sleepTime: formData.sleepTime,
			studySchedule: {
				weekday: formData.studyScheduleWeekday,
				weekend: formData.studyScheduleWeekend
			},
			favoriteSubjects: formData.favoriteSubjects.split(',').map(s => s.trim()).filter(Boolean),
			mentors: [],
			funFact: ""
		};

		onSave(profileData);
	};

	return (
		<form onSubmit={handleSubmit} className="p-6 space-y-6">
			{/* Basic Info */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-500">
						<path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
					</svg>
					Basic Information
				</h3>
				
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Full Name *</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="Enter your full name"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Age *</label>
						<input
							type="number"
							name="age"
							value={formData.age}
							onChange={handleChange}
							required
							min="5"
							max="100"
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="Your age"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class/Grade *</label>
						<input
							type="text"
							name="class"
							value={formData.class}
							onChange={handleChange}
							required
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="e.g., 9th, 10th"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Section</label>
						<input
							type="text"
							name="section"
							value={formData.section}
							onChange={handleChange}
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="e.g., A, B"
						/>
					</div>
				</div>
			</div>

			{/* School Info */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-500">
						<path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424z" clipRule="evenodd" />
					</svg>
					School Details
				</h3>
				
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">School Name *</label>
						<input
							type="text"
							name="schoolName"
							value={formData.schoolName}
							onChange={handleChange}
							required
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="Your school name"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">School Location *</label>
						<input
							type="text"
							name="schoolLocation"
							value={formData.schoolLocation}
							onChange={handleChange}
							required
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="City, State"
						/>
					</div>
				</div>
			</div>

			{/* Learning Profile */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-500">
						<path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
					</svg>
					Learning Profile
				</h3>
				
				<div>
					<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Interests (comma-separated)</label>
					<input
						type="text"
						name="interests"
						value={formData.interests}
						onChange={handleChange}
						className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						placeholder="e.g., AI, Science, Sports, Music"
					/>
				</div>
				
				<div>
					<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Favorite Subjects (comma-separated)</label>
					<input
						type="text"
						name="favoriteSubjects"
						value={formData.favoriteSubjects}
						onChange={handleChange}
						className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						placeholder="e.g., Mathematics, Physics, English"
					/>
				</div>
				
				<div>
					<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Learning Style</label>
					<select
						name="learningStyle"
						value={formData.learningStyle}
						onChange={handleChange}
						className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					>
						<option value="">Select your learning style</option>
						<option value="Visual">Visual</option>
						<option value="Auditory">Auditory</option>
						<option value="Kinesthetic">Kinesthetic</option>
						<option value="Visual & Kinesthetic">Visual & Kinesthetic</option>
						<option value="Auditory & Visual">Auditory & Visual</option>
					</select>
				</div>
				
				<div>
					<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Academic Goals (comma-separated)</label>
					<textarea
						name="academicGoals"
						value={formData.academicGoals}
						onChange={handleChange}
						rows="2"
						className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						placeholder="e.g., Score 90%+ in finals, Improve problem-solving skills"
					/>
				</div>
			</div>

			{/* Study Schedule */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-500">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
					</svg>
					Study Schedule
				</h3>
				
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Weekday Study Time</label>
						<input
							type="text"
							name="studyScheduleWeekday"
							value={formData.studyScheduleWeekday}
							onChange={handleChange}
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="e.g., 7:00 PM - 9:00 PM"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Weekend Study Time</label>
						<input
							type="text"
							name="studyScheduleWeekend"
							value={formData.studyScheduleWeekend}
							onChange={handleChange}
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							placeholder="e.g., 10:00 AM - 12:00 PM"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sleep Time</label>
						<input
							type="time"
							name="sleepTime"
							value={formData.sleepTime}
							onChange={handleChange}
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						/>
					</div>
				</div>
			</div>

			{/* Submit Button */}
			<div className="flex gap-3 pt-4 border-t">
				<button
					type="submit"
					className="flex-1 rounded-xl px-6 py-3 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-lg"
					style={{
						background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`
					}}
				>
					Save Profile & Start Learning 🚀
				</button>
			</div>
		</form>
	);
}
