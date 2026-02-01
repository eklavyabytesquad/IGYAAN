"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

export default function FacultyProfileDisplay({ userId }) {
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		const fetchFacultyProfile = async () => {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("faculty_profiles")
					.select("*")
					.eq("user_id", userId)
					.maybeSingle();

				if (error && error.code !== "PGRST116") {
					console.error("Error fetching faculty profile:", error);
				}

				setProfile(data);
			} catch (err) {
				console.error("Error:", err);
			} finally {
				setLoading(false);
			}
		};

		if (userId) {
			fetchFacultyProfile();
		}
	}, [userId]);

	if (loading) {
		return (
			<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="text-center py-8">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
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
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
						No Faculty Profile Found
					</h3>
					<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
						Please contact your administrator to set up your faculty profile.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
					Faculty Profile
				</h2>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
					Your professional information and teaching details
				</p>
			</div>

			<div className="space-y-6">
				{/* Personal Information */}
				<div>
					<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Personal Information
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{profile.age && (
							<div>
								<p className="text-xs text-zinc-500 dark:text-zinc-500">Age</p>
								<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
									{profile.age} years
								</p>
							</div>
						)}
						{profile.gender && (
							<div>
								<p className="text-xs text-zinc-500 dark:text-zinc-500">Gender</p>
								<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
									{profile.gender}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Professional Details */}
				<div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
					<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Professional Details
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="text-xs text-zinc-500 dark:text-zinc-500">Post</p>
							<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
								{profile.post}
							</p>
						</div>
						{profile.department && (
							<div>
								<p className="text-xs text-zinc-500 dark:text-zinc-500">Department</p>
								<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
									{profile.department}
								</p>
							</div>
						)}
						<div>
							<p className="text-xs text-zinc-500 dark:text-zinc-500">Joining Date</p>
							<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
								{new Date(profile.joining_date).toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</p>
						</div>
						{profile.employment_type && (
							<div>
								<p className="text-xs text-zinc-500 dark:text-zinc-500">Employment Type</p>
								<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
									{profile.employment_type}
								</p>
							</div>
						)}
						{profile.experience_years !== null && (
							<div>
								<p className="text-xs text-zinc-500 dark:text-zinc-500">Experience</p>
								<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
									{profile.experience_years} {profile.experience_years === 1 ? "year" : "years"}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Class Teacher Details */}
				{profile.is_class_teacher && (
					<div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
							Class Teacher Details
						</h3>
						<div className="grid gap-4 sm:grid-cols-2">
							{profile.class && (
								<div>
									<p className="text-xs text-zinc-500 dark:text-zinc-500">Class</p>
									<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
										{profile.class}
									</p>
								</div>
							)}
							{profile.section && (
								<div>
									<p className="text-xs text-zinc-500 dark:text-zinc-500">Section</p>
									<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
										{profile.section}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Academic Information */}
				{(profile.subjects || profile.qualifications) && (
					<div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
							Academic Information
						</h3>
						<div className="space-y-4">
							{profile.subjects && profile.subjects.length > 0 && (
								<div>
									<p className="text-xs text-zinc-500 dark:text-zinc-500">Subjects</p>
									<div className="mt-2 flex flex-wrap gap-2">
										{profile.subjects.map((subject, index) => (
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
							{profile.qualifications && profile.qualifications.length > 0 && (
								<div>
									<p className="text-xs text-zinc-500 dark:text-zinc-500">Qualifications</p>
									<div className="mt-2 flex flex-wrap gap-2">
										{profile.qualifications.map((qualification, index) => (
											<span
												key={index}
												className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
											>
												{qualification}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* School Information */}
				{(profile.school_name || profile.school_location || profile.school_board) && (
					<div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
							School Information
						</h3>
						<div className="grid gap-4 sm:grid-cols-2">
							{profile.school_name && (
								<div>
									<p className="text-xs text-zinc-500 dark:text-zinc-500">School Name</p>
									<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
										{profile.school_name}
									</p>
								</div>
							)}
							{profile.school_location && (
								<div>
									<p className="text-xs text-zinc-500 dark:text-zinc-500">Location</p>
									<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
										{profile.school_location}
									</p>
								</div>
							)}
							{profile.school_board && (
								<div>
									<p className="text-xs text-zinc-500 dark:text-zinc-500">Board</p>
									<p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
										{profile.school_board}
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
