"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/utils/auth_context";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";

export default function AboutPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		interest: [],
		age: "",
		experience: "",
		awards: [],
		title_on_account: "",
		about_me: "",
	});
	const [newInterest, setNewInterest] = useState("");
	const [newAward, setNewAward] = useState("");
	const [loadingData, setLoadingData] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (!loading && user) {
			// Check if user is B2C user
			if (user.role !== "b2c_student" && user.role !== "b2c_mentor") {
				router.push("/dashboard/settings");
				return;
			}
			fetchProfileData();
		}
	}, [user, loading]);

	const fetchProfileData = async () => {
		try {
			const { data, error } = await supabase
				.from("launch_pad_users_details")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (error && error.code !== "PGRST116") {
				// PGRST116 is "no rows returned"
				throw error;
			}

			if (data) {
				setFormData({
					interest: data.interest || [],
					age: data.age || "",
					experience: data.experience || "",
					awards: data.awards || [],
					title_on_account: data.title_on_account || "",
					about_me: data.about_me || "",
				});
			}
		} catch (error) {
			console.error("Error fetching profile data:", error);
			setMessage({ type: "error", text: "Failed to load profile data" });
		} finally {
			setLoadingData(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const addInterest = () => {
		if (newInterest.trim() && !formData.interest.includes(newInterest.trim())) {
			setFormData((prev) => ({
				...prev,
				interest: [...prev.interest, newInterest.trim()],
			}));
			setNewInterest("");
		}
	};

	const removeInterest = (index) => {
		setFormData((prev) => ({
			...prev,
			interest: prev.interest.filter((_, i) => i !== index),
		}));
	};

	const addAward = () => {
		if (newAward.trim() && !formData.awards.includes(newAward.trim())) {
			setFormData((prev) => ({
				...prev,
				awards: [...prev.awards, newAward.trim()],
			}));
			setNewAward("");
		}
	};

	const removeAward = (index) => {
		setFormData((prev) => ({
			...prev,
			awards: prev.awards.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setMessage({ type: "", text: "" });

		try {
			const profileData = {
				user_id: user.id,
				role: user.role,
				interest: formData.interest,
				age: formData.age ? parseInt(formData.age) : null,
				experience: formData.experience,
				awards: formData.awards,
				title_on_account: formData.title_on_account,
				about_me: formData.about_me,
				updated_at: new Date().toISOString(),
			};

			// Check if profile exists
			const { data: existing } = await supabase
				.from("launch_pad_users_details")
				.select("id")
				.eq("user_id", user.id)
				.single();

			let result;
			if (existing) {
				// Update existing profile
				result = await supabase
					.from("launch_pad_users_details")
					.update(profileData)
					.eq("user_id", user.id);
			} else {
				// Insert new profile
				result = await supabase
					.from("launch_pad_users_details")
					.insert([profileData]);
			}

			if (result.error) throw result.error;

			setMessage({
				type: "success",
				text: "Profile updated successfully!",
			});
		} catch (error) {
			console.error("Error saving profile:", error);
			setMessage({
				type: "error",
				text: "Failed to save profile. Please try again.",
			});
		} finally {
			setSaving(false);
		}
	};

	const copyPublicLink = () => {
		const link = `${window.location.origin}/about/${user.id}`;
		navigator.clipboard.writeText(link);
		setMessage({
			type: "success",
			text: "Public profile link copied to clipboard!",
		});
		setTimeout(() => setMessage({ type: "", text: "" }), 3000);
	};

	if (loading || loadingData) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading profile...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
					Professional Profile
				</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Manage your professional information and public profile
				</p>
			</div>

			{/* Message Alert */}
			{message.text && (
				<div
					className={`mb-6 rounded-xl border p-4 ${
						message.type === "success"
							? "border-green-200 bg-green-50 text-green-800"
							: "border-red-200 bg-red-50 text-red-800"
					}`}
				>
					<p className="text-sm font-medium">{message.text}</p>
				</div>
			)}

			{/* Public Link Card */}
			<div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<p className="text-sm font-semibold text-indigo-900">
							Your Public Profile Link
						</p>
						<p className="mt-2 break-all text-sm text-indigo-700">
							{window.location.origin}/about/{user.id}
						</p>
					</div>
					<button
						type="button"
						onClick={copyPublicLink}
						className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-4 w-4"
						>
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
						</svg>
						Copy Link
					</button>
				</div>
			</div>

			{/* Profile Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Info Card */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
						Basic Information
					</h2>
					<div className="mt-6 grid gap-6 md:grid-cols-2">
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Title on Account
							</label>
							<input
								type="text"
								name="title_on_account"
								value={formData.title_on_account}
								onChange={handleInputChange}
								placeholder="e.g., Full Stack Developer, Product Manager"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Age
							</label>
							<input
								type="number"
								name="age"
								value={formData.age}
								onChange={handleInputChange}
								placeholder="Enter your age"
								min="1"
								max="120"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
						</div>
					</div>
				</div>

				{/* About Me Card */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
						About Me
					</h2>
					<div className="mt-6">
						<textarea
							name="about_me"
							value={formData.about_me}
							onChange={handleInputChange}
							placeholder="Tell us about yourself, your background, goals, and what makes you unique..."
							rows="6"
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
						/>
					</div>
				</div>

				{/* Experience Card */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
						Experience
					</h2>
					<div className="mt-6">
						<textarea
							name="experience"
							value={formData.experience}
							onChange={handleInputChange}
							placeholder="Describe your professional experience, skills, and expertise..."
							rows="6"
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
						/>
					</div>
				</div>

				{/* Interests Card */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
						Interests
					</h2>
					<div className="mt-6">
						<div className="flex gap-3">
							<input
								type="text"
								value={newInterest}
								onChange={(e) => setNewInterest(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
								placeholder="Add an interest (e.g., AI, Web Development)"
								className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
							<button
								type="button"
								onClick={addInterest}
								className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
							>
								Add
							</button>
						</div>
						<div className="mt-4 flex flex-wrap gap-2">
							{formData.interest.map((item, index) => (
								<span
									key={index}
									className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700"
								>
									{item}
									<button
										type="button"
										onClick={() => removeInterest(index)}
										className="text-indigo-500 hover:text-indigo-700"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="h-4 w-4"
										>
											<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
										</svg>
									</button>
								</span>
							))}
						</div>
					</div>
				</div>

				{/* Awards Card */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
						Awards & Achievements
					</h2>
					<div className="mt-6">
						<div className="flex gap-3">
							<input
								type="text"
								value={newAward}
								onChange={(e) => setNewAward(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAward())}
								placeholder="Add an award or achievement"
								className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
							<button
								type="button"
								onClick={addAward}
								className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
							>
								Add
							</button>
						</div>
						<div className="mt-4 space-y-2">
							{formData.awards.map((award, index) => (
								<div
									key={index}
									className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-5 w-5 text-yellow-500"
									>
										<path
											fillRule="evenodd"
											d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
											clipRule="evenodd"
										/>
									</svg>
									<p className="flex-1 text-sm text-zinc-700">{award}</p>
									<button
										type="button"
										onClick={() => removeAward(index)}
										className="text-zinc-400 hover:text-red-600"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="h-5 w-5"
										>
											<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
										</svg>
									</button>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-4">
					<button
						type="submit"
						disabled={saving}
						className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
					>
						{saving ? "Saving..." : "Save Profile"}
					</button>
					<button
						type="button"
						onClick={() => router.push("/dashboard/settings")}
						className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
