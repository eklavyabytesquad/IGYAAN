"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

export default function StudentProfileDisplay({ userId }) {
	const [profile, setProfile] = useState(null);
	const [school, setSchool] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStudentProfile();
	}, [userId]);

	const fetchStudentProfile = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("student_profiles")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle();

			if (error && error.code !== "PGRST116") {
				console.error("Error fetching student profile:", error);
			}

			setProfile(data);
			
			// Fetch school details if school_id exists
			if (data?.school_id) {
				const { data: schoolData, error: schoolError } = await supabase
					.from("schools")
					.select("school_name, location, board")
					.eq("id", data.school_id)
					.maybeSingle();
				
				if (!schoolError) {
					setSchool(schoolData);
				}
			}
		} catch (err) {
			console.error("Error:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex flex-col items-center gap-3 py-8 text-center">
					<div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-8 w-8 text-zinc-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
							/>
						</svg>
					</div>
					<div>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">
							Student Profile Not Found
						</p>
						<p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
							Please contact your administrator to set up your profile
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
			<div className="mb-6 flex items-center gap-3">
				<div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/30">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
						/>
					</svg>
				</div>
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">
						Student Profile
					</h2>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Your academic information and preferences
					</p>
				</div>
			</div>

			<div className="space-y-6">
				{/* Personal Information */}
				<div>
					<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
						Personal Information
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{profile.name && (
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
								<p className="text-xs text-zinc-600 dark:text-zinc-400">Name</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{profile.name}
								</p>
							</div>
						)}
						{profile.age && (
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
								<p className="text-xs text-zinc-600 dark:text-zinc-400">Age</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{profile.age} years
								</p>
							</div>
						)}
						{profile.fun_fact && (
							<div className="col-span-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
								<p className="text-xs text-zinc-600 dark:text-zinc-400">Fun Fact</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{profile.fun_fact}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Academic Information */}
				<div>
					<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
						Academic Information
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{profile.class && (
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
								<p className="text-xs text-zinc-600 dark:text-zinc-400">Class</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{profile.class}
								</p>
							</div>
						)}
						{profile.section && (
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
								<p className="text-xs text-zinc-600 dark:text-zinc-400">Section</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{profile.section}
								</p>
							</div>
						)}
						{profile.house && (
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
								<p className="text-xs text-zinc-600 dark:text-zinc-400">House</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{profile.house}
								</p>
							</div>
						)}
						{profile.class_teacher && (
							<div className="col-span-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
								<p className="text-xs text-zinc-600 dark:text-zinc-400">
									Class Teacher
								</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{profile.class_teacher}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* School Information */}
				{school && (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
							School Information
						</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{school.school_name && (
								<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										School Name
									</p>
									<p className="mt-1 font-medium text-zinc-900 dark:text-white">
										{school.school_name}
									</p>
								</div>
							)}
							{school.location && (
								<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										Location
									</p>
									<p className="mt-1 font-medium text-zinc-900 dark:text-white">
										{school.location}
									</p>
								</div>
							)}
							{school.board && (
								<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">Board</p>
									<p className="mt-1 font-medium text-zinc-900 dark:text-white">
										{school.board}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Study & Lifestyle */}
				{(profile.sleep_time || profile.study_schedule_weekday || profile.study_schedule_weekend) && (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
							Study & Lifestyle
						</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{profile.sleep_time && (
								<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										Sleep Time
									</p>
									<p className="mt-1 font-medium text-zinc-900 dark:text-white">
										{profile.sleep_time}
									</p>
								</div>
							)}
							{profile.study_schedule_weekday && (
								<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										Weekday Study Schedule
									</p>
									<p className="mt-1 font-medium text-zinc-900 dark:text-white">
										{profile.study_schedule_weekday}
									</p>
								</div>
							)}
							{profile.study_schedule_weekend && (
								<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										Weekend Study Schedule
									</p>
									<p className="mt-1 font-medium text-zinc-900 dark:text-white">
										{profile.study_schedule_weekend}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Learning Preferences */}
				{profile.learning_style && (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
							Learning Preferences
						</h3>
						<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
							<p className="text-xs text-zinc-600 dark:text-zinc-400">
								Learning Style
							</p>
							<p className="mt-1 font-medium text-zinc-900 dark:text-white">
								{profile.learning_style}
							</p>
						</div>
					</div>
				)}

				{/* Interests & Subjects */}
				{(profile.interests?.length > 0 || profile.favorite_subjects?.length > 0) && (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
							Interests & Subjects
						</h3>
						<div className="space-y-4">
							{profile.favorite_subjects?.length > 0 && (
								<div>
									<p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
										Favorite Subjects
									</p>
									<div className="flex flex-wrap gap-2">
										{profile.favorite_subjects.map((subject, index) => (
											<span
												key={index}
												className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
											>
												{subject}
											</span>
										))}
									</div>
								</div>
							)}
							{profile.interests?.length > 0 && (
								<div>
									<p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
										Interests
									</p>
									<div className="flex flex-wrap gap-2">
										{profile.interests.map((interest, index) => (
											<span
												key={index}
												className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
											>
												{interest}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Strengths & Growth Areas */}
				{(profile.strengths?.length > 0 || profile.growth_areas?.length > 0) && (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
							Strengths & Growth Areas
						</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{profile.strengths?.length > 0 && (
								<div>
									<p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
										Strengths
									</p>
									<div className="flex flex-wrap gap-2">
										{profile.strengths.map((strength, index) => (
											<span
												key={index}
												className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
											>
												{strength}
											</span>
										))}
									</div>
								</div>
							)}
							{profile.growth_areas?.length > 0 && (
								<div>
									<p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
										Growth Areas
									</p>
									<div className="flex flex-wrap gap-2">
										{profile.growth_areas.map((area, index) => (
											<span
												key={index}
												className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
											>
												{area}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Goals & Achievements */}
				{(profile.academic_goals?.length > 0 || profile.recent_wins?.length > 0) && (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
							Goals & Achievements
						</h3>
						<div className="space-y-4">
							{profile.academic_goals?.length > 0 && (
								<div>
									<p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
										Academic Goals
									</p>
									<ul className="space-y-2">
										{profile.academic_goals.map((goal, index) => (
											<li
												key={index}
												className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M13 10V3L4 14h7v7l9-11h-7z"
													/>
												</svg>
												{goal}
											</li>
										))}
									</ul>
								</div>
							)}
							{profile.recent_wins?.length > 0 && (
								<div>
									<p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
										Recent Wins
									</p>
									<ul className="space-y-2">
										{profile.recent_wins.map((win, index) => (
											<li
												key={index}
												className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
												{win}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
