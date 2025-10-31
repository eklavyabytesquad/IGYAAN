"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";

export default function StartupHelpPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="dashboard-theme min-h-screen p-6 lg:p-8">
			<div className="mx-auto max-w-6xl space-y-8">
				<div className="dashboard-card rounded-3xl p-8">
					<div className="mb-6">
						<h1 className="text-3xl font-bold" style={{ color: "var(--dashboard-heading)" }}>
							🚀 Startup Help
						</h1>
						<p className="mt-2 text-base" style={{ color: "var(--dashboard-muted)" }}>
							Resources and guidance for your entrepreneurial journey
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<div className="dashboard-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
									<path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
									<path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--dashboard-heading)" }}>
								Business Planning
							</h3>
							<p className="text-sm" style={{ color: "var(--dashboard-muted)" }}>
								Learn how to create a solid business plan and define your startup vision
							</p>
						</div>

						<div className="dashboard-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
									<path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
									<path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 002.134 0l7.668-4.13 1.37.739a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.71 0l-9.75-5.25a.75.75 0 010-1.32l1.37-.738z" />
									<path d="M10.933 19.231l-7.668-4.13-1.37.739a.75.75 0 000 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 000-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 01-2.134-.001z" />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--dashboard-heading)" }}>
								Funding Resources
							</h3>
							<p className="text-sm" style={{ color: "var(--dashboard-muted)" }}>
								Explore funding options, grants, and investor connections for student startups
							</p>
						</div>

						<div className="dashboard-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
									<path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
									<path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--dashboard-heading)" }}>
								Mentorship Network
							</h3>
							<p className="text-sm" style={{ color: "var(--dashboard-muted)" }}>
								Connect with experienced entrepreneurs and industry mentors
							</p>
						</div>

						<div className="dashboard-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
									<path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--dashboard-heading)" }}>
								Learning Resources
							</h3>
							<p className="text-sm" style={{ color: "var(--dashboard-muted)" }}>
								Access courses, workshops, and materials on entrepreneurship
							</p>
						</div>

						<div className="dashboard-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
									<path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--dashboard-heading)" }}>
								Legal & Compliance
							</h3>
							<p className="text-sm" style={{ color: "var(--dashboard-muted)" }}>
								Understand legal requirements and compliance for student startups
							</p>
						</div>

						<div className="dashboard-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
									<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--dashboard-heading)" }}>
								Success Stories
							</h3>
							<p className="text-sm" style={{ color: "var(--dashboard-muted)" }}>
								Get inspired by successful student entrepreneurs and their journeys
							</p>
						</div>
					</div>

					<div className="mt-8 dashboard-card rounded-2xl p-6" style={{
						background: `linear-gradient(135deg, color-mix(in srgb, var(--dashboard-primary) 5%, var(--dashboard-surface-solid)), var(--dashboard-surface-solid))`
					}}>
						<h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--dashboard-heading)" }}>
							🎯 Coming Soon
						</h2>
						<p className="text-sm" style={{ color: "var(--dashboard-muted)" }}>
							We're building comprehensive startup resources including pitch deck templates, market research tools, 
							networking events, and direct connections to investors. Stay tuned for updates!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
