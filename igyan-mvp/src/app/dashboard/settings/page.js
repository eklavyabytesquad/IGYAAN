"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";

const THEME_STORAGE_KEY = "dashboard-theme";

const themeOptions = [
	{
		id: "indigo",
		label: "Aurora Indigo",
		description: "Professional indigo theme, perfect for academics and daily use",
		preview: ["#312e81", "#4f46e5", "#a5b4fc"],
	},
	{
		id: "emerald",
		label: "Verdant Emerald",
		description: "Fresh green theme for a calming and focused environment",
		preview: ["#065f46", "#10b981", "#bbf7d0"],
	},
	{
		id: "ocean",
		label: "Celestial Ocean",
		description: "Balanced teal theme inspired by peaceful coastal waters",
		preview: ["#0f766e", "#14b8a6", "#99f6e4"],
	},
	{
		id: "sunset",
		label: "Sunset Ember",
		description: "Warm orange theme that brings energy and enthusiasm",
		preview: ["#9a3412", "#f97316", "#fed7aa"],
	},
	{
		id: "midnight",
		label: "Midnight Neon",
		description: "Dark theme with high contrast, ideal for extended sessions",
		preview: ["#0a0f1e", "#38bdf8", "#cbd5f5"],
	},
];

const quickThemeIds = ["indigo", "emerald", "ocean", "sunset", "midnight"];

export default function SettingsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [schoolData, setSchoolData] = useState(null);
	const [loadingSchool, setLoadingSchool] = useState(true);
	const [selectedTheme, setSelectedTheme] = useState("indigo");
	const themeLookup = useMemo(
		() => Object.fromEntries(themeOptions.map((option) => [option.id, option])),
		[]
	);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
		if (storedTheme && themeLookup[storedTheme]) {
			setSelectedTheme(storedTheme);
		}
	}, [themeLookup]);

	useEffect(() => {
		const fetchSchoolData = async () => {
			if (!user?.id) return;

			try {
				// Check if user has school_id
				if (!user.school_id) {
					console.warn("User does not have school_id:", user.id);
					setLoadingSchool(false);
					return;
				}

				console.log("Fetching school data for school_id:", user.school_id);

				// Fetch school by user's school_id
				const { data, error } = await supabase
					.from("schools")
					.select("id, school_name")
					.eq("id", user.school_id)
					.maybeSingle();

				if (error) {
					console.error("Error fetching school:", error);
				}

				setSchoolData(data);
			} catch (err) {
				console.error("Error in fetchSchoolData:", err);
			} finally {
				setLoadingSchool(false);
			}
		};

		if (user) {
			fetchSchoolData();
		}
	}, [user]);

	const handleThemeSelect = (themeId) => {
		if (!themeLookup[themeId]) return;
		setSelectedTheme(themeId);
		if (typeof window === "undefined") return;
		window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
		document.body.dataset.dashboardTheme = themeId;
		window.dispatchEvent(new CustomEvent("dashboard-theme-change", { detail: themeId }));
	};

	const activeTheme = themeLookup[selectedTheme] || themeLookup.indigo;
	const palette = activeTheme?.preview || [];
	const toneDeep = palette[0] || "#312e81";
	const toneMain = palette[1] || palette[0] || "#4f46e5";
	const toneSoft = palette[2] || palette[1] || "#c7d2fe";

	if (loading || loadingSchool) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading settings...
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
					Settings
				</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Manage your account and organization settings
				</p>
			</div>

			{/* Appearance Studio */}
			<div className="dashboard-card mb-8 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
				<div className="grid gap-8 lg:grid-cols-[340px,1fr]">
					<div className="flex flex-col gap-6">
						<div>
							<span className="dashboard-pill inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide">
								Appearance Studio
							</span>
							<h2 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-white">
								Curate the perfect look for your dashboard
							</h2>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								Themes update navigation, cards, chips, and buttons instantly for everyone in your workspace.
							</p>
						</div>

						<div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-inner backdrop-blur">
							<div
								className="rounded-3xl p-5"
								style={{
									background: `linear-gradient(135deg, ${toneSoft}, rgba(255,255,255,0.92))`,
								}}
							>
								<div
									className="rounded-2xl border border-white/60 p-4 shadow-sm backdrop-blur"
									style={{ background: "rgba(255,255,255,0.65)" }}
								>
									<div className="flex items-center justify-between gap-4">
										<div className="flex items-center gap-3">
											<span
												className="h-9 w-9 rounded-2xl shadow-sm"
												style={{
													background: `linear-gradient(135deg, ${toneDeep}, ${toneMain})`,
												}}
											/>
											<div>
												<p className="text-sm font-semibold text-zinc-900">Top Navbar</p>
												<p className="text-xs text-zinc-500">Frosted with quick actions</p>
											</div>
										</div>
										<button
											type="button"
											className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm transition-transform hover:-translate-y-0.5"
											style={{
												background: toneMain,
												color: "#ffffff",
												boxShadow: `0 12px 30px -18px ${toneMain}aa`,
											}}
										>
											Primary CTA
										</button>
									</div>

									<div className="mt-5 grid gap-3 sm:grid-cols-2">
										<div
											className="rounded-xl border border-white/60 p-3 shadow-sm"
											style={{ background: "rgba(255,255,255,0.75)" }}
										>
											<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Overview</p>
											<div
												className="mt-3 h-2 rounded-full"
												style={{ background: toneDeep, opacity: 0.9 }}
											/>
											<div
												className="mt-2 h-2 rounded-full"
												style={{ background: toneMain, opacity: 0.7 }}
											/>
										</div>
										<div
											className="rounded-xl border border-white/70 p-3 shadow-sm"
											style={{ background: "rgba(255,255,255,0.8)" }}
										>
											<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Progress</p>
											<div
												className="mt-3 h-2 rounded-full"
												style={{ background: toneMain, opacity: 0.85 }}
											/>
											<div
												className="mt-2 h-2 rounded-full"
												style={{ background: toneSoft, opacity: 0.8 }}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Quick presets</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{quickThemeIds.map((id) => {
									const preset = themeLookup[id];
									if (!preset) return null;
									const swatches = preset.preview || [];
									const deep = swatches[0] || toneDeep;
									const main = swatches[1] || deep;
									const soft = swatches[2] || main;
									const isActive = id === selectedTheme;
									return (
										<button
											type="button"
											key={id}
											onClick={() => handleThemeSelect(id)}
											className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition-all hover:-translate-y-0.5 focus-visible:outline-none ${
												isActive ? "scale-105" : ""
											}`}
											style={{
												background: `linear-gradient(135deg, ${deep}, ${main})`,
												boxShadow: isActive
													? `0 18px 38px -22px ${main}aa`
													: "0 10px 28px -24px rgba(15,23,42,0.35)",
												border: `1px solid ${isActive ? soft : "rgba(255,255,255,0.25)"}`,
											}}
										>
											<span
												className="h-2.5 w-2.5 rounded-full border border-white/60"
												style={{ background: soft }}
											/>
											{preset.label.split(" ")[0]}
										</button>
									);
								})}
							</div>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{themeOptions.map((option) => {
							const isActive = option.id === selectedTheme;
							const accent = option.preview[1] ?? option.preview[0];
							return (
								<button
									type="button"
									key={option.id}
									onClick={() => handleThemeSelect(option.id)}
									className={`group flex h-full flex-col justify-between rounded-2xl border bg-white/90 p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none ${
										isActive ? "shadow-lg" : ""
									}`}
									style={
										isActive
											? {
												borderColor: accent,
												boxShadow: `0 20px 45px -20px ${accent}66`,
											}
											: { borderColor: "rgba(148, 163, 184, 0.2)" }
									}
								>
									<span className="flex items-center justify-between gap-3">
										<span className="text-base font-semibold text-zinc-900 dark:text-white">
											{option.label}
										</span>
										{isActive && (
											<span
												className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
												style={{ background: accent, color: "#ffffff" }}
											>
												Active
											</span>
										)}
									</span>
									<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
										{option.description}
									</p>
									<div className="mt-4 flex items-center gap-2">
										{option.preview.map((tone) => (
											<span
												key={`${option.id}-${tone}`}
												className="h-8 w-8 rounded-xl border border-white/70 shadow-sm"
												style={{ background: tone }}
											/>
										))}
									</div>
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Settings Cards Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* User Profile Card */}
				<Link
					href="/dashboard/profile"
					className="group dashboard-card rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
				>
					<div className="flex items-start gap-4">
						<div
							className="rounded-xl p-4 shadow-sm"
							style={{
								background: "color-mix(in srgb, var(--dashboard-primary) 18%, transparent)",
								color: "var(--dashboard-primary)",
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-8 w-8"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
								User Profile
							</h2>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								Update your personal information, contact details, and profile
								picture
							</p>
							<div className="mt-4 flex items-center gap-3">
								<div
									className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm"
									style={{ background: `linear-gradient(135deg, ${toneDeep}, ${toneMain})` }}
								>
									{user.full_name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "U"}
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-900 dark:text-white">
										{user.full_name}
									</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										{user.email}
									</p>
								</div>
							</div>
						</div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6 text-zinc-400 transition-transform group-hover:translate-x-1"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5"
							/>
						</svg>
					</div>
				</Link>

				{/* School Profile Card */}
				<Link
					href="/dashboard/school-profile"
					className="group dashboard-card rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
				>
					<div className="flex items-start gap-4">
						<div
							className="rounded-xl p-4 shadow-sm"
							style={{
								background: "color-mix(in srgb, var(--dashboard-primary) 16%, transparent)",
								color: "var(--dashboard-primary)",
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-8 w-8"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
								School Profile
							</h2>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								Manage school information, contact details, documents, and
								branding
							</p>
							{schoolData ? (
								<div className="mt-4 flex items-center gap-3">
									<div
										className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
										style={{ background: `linear-gradient(135deg, ${toneDeep}, ${toneMain})` }}
									>
										{schoolData.school_name
											?.split(" ")
											.map((n) => n[0])
											.join("")
											.slice(0, 2)
											.toUpperCase() || "SC"}
									</div>
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">
											{schoolData.school_name}
										</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											School registered
										</p>
									</div>
								</div>
							) : (
								<p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
									No school registered yet
								</p>
							)}
						</div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6 text-zinc-400 transition-transform group-hover:translate-x-1"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5"
							/>
						</svg>
					</div>
				</Link>

				{/* Security Card */}
				<div className="dashboard-card rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<div className="flex items-start gap-4">
						<div
							className="rounded-xl p-4 shadow-sm"
							style={{
								background: "color-mix(in srgb, var(--dashboard-primary) 16%, transparent)",
								color: "var(--dashboard-primary)",
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-8 w-8"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
								Security
							</h2>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								Change password, enable two-factor authentication, and manage
								sessions
							</p>
							<p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
								Coming soon...
							</p>
						</div>
					</div>
				</div>

				{/* Preferences Card */}
				<div className="dashboard-card rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<div className="flex items-start gap-4">
						<div
							className="rounded-xl p-4 shadow-sm"
							style={{
								background: "color-mix(in srgb, var(--dashboard-primary) 16%, transparent)",
								color: "var(--dashboard-primary)",
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-8 w-8"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
								Preferences
							</h2>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								Customize your experience with theme, language, and notification
								settings
							</p>
							<p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
								Coming soon...
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Additional Info */}
			<div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-6 shadow-sm">
				<div className="flex items-start gap-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
						/>
					</svg>
					<div>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">
							Need Help?
						</p>
						<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
							Contact support at{" "}
							<a
								href="mailto:support@igyanai.com"
								className="font-semibold text-indigo-500 hover:text-indigo-600"
							>
								support@igyanai.com
							</a>{" "}
							if you need assistance with your account settings.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
