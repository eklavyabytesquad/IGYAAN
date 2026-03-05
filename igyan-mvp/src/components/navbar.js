"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const linksBeforeInsights = [
	{ href: "/features", label: "Features" },
	{ href: "/about", label: "About Us" },
];

const linksAfterInsights = [
	{ href: "/contact", label: "Contact" },
	{ href: "/shark-ai", label: "AI Shark" },
];

const insightsLinks = [
	{ href: "/insights/blogs", label: "I-GYAN AI Blogs" },
	{ href: "/insights/industry", label: "Industry Insights" },
];

export default function Navbar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [insightsOpen, setInsightsOpen] = useState(false);
	const insightsRef = useRef(null);
	const insightsMobileRef = useRef(null);

	useEffect(() => {
		const timer = setTimeout(() => setIsOpen(false), 0);
		return () => clearTimeout(timer);
	}, [pathname]);

	// Close insights dropdown on outside click
	useEffect(() => {
		function handleClickOutside(e) {
			if (insightsRef.current && !insightsRef.current.contains(e.target)) {
				setInsightsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<header className="sticky top-0 z-50 flex flex-col items-center px-4 pt-4 backdrop-blur">
			<div className="absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-white/90 via-white/70 to-transparent dark:from-black/85 dark:via-black/70 dark:to-transparent" />
			<nav className="flex w-full max-w-5xl items-center justify-between rounded-xl border border-zinc-200/80 bg-white/85 px-5 py-3 shadow-lg shadow-zinc-900/10 transition-all dark:border-zinc-700/60 dark:bg-zinc-900/80">
				<Link
					href="/"
					className="flex items-center gap-3 text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-indigo-500 dark:text-zinc-100 dark:hover:text-indigo-400"
				>
					<Image 
						src="/logo3.png" 
						alt="IGYAN.AI Logo" 
						width={48} 
						height={48} 
						className="scale-150 transform-gpu"
					/>
					<div className="flex flex-col">
						<span className="leading-tight text-base">I GYAN.AI</span>
						<span className="text-[10px] font-medium text-sky-500 tracking-wider">TALENT IN MOTION</span>
					</div>
				</Link>
				<div className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300 lg:flex">
					{linksBeforeInsights.map(({ href, label }) => {
						const isActive = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								className={`relative transition-colors hover:text-indigo-500 dark:hover:text-indigo-400 ${
									isActive
										? "text-indigo-500 dark:text-indigo-400"
										: "text-zinc-600 dark:text-zinc-300"
								}`}
							>
								{label}
								{isActive ? (
									<span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-indigo-500 dark:bg-indigo-400" />
								) : null}
							</Link>
						);
					})}
					{/* Insights Dropdown — between About Us and Contact */}
					<div ref={insightsRef} className="relative">
						<button
							type="button"
							onClick={() => setInsightsOpen((prev) => !prev)}
							className={`relative flex items-center gap-1 transition-colors hover:text-indigo-500 dark:hover:text-indigo-400 ${
								pathname?.startsWith("/insights")
									? "text-indigo-500 dark:text-indigo-400"
									: "text-zinc-600 dark:text-zinc-300"
							}`}
						>
							Insights
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className={`h-4 w-4 transition-transform duration-200 ${insightsOpen ? "rotate-180" : ""}`}
							>
								<path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
							</svg>
							{pathname?.startsWith("/insights") ? (
								<span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-indigo-500 dark:bg-indigo-400" />
							) : null}
						</button>
						{insightsOpen && (
							<div className="absolute top-full left-1/2 z-50 mt-3 w-56 -translate-x-1/2 rounded-xl border border-zinc-200/80 bg-white/95 p-2 shadow-xl shadow-zinc-900/10 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/95">
								{insightsLinks.map(({ href, label }) => {
									const isActive = pathname === href;
									return (
										<Link
											key={href}
											href={href}
											onClick={() => setInsightsOpen(false)}
											className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
												isActive
													? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
													: "text-zinc-600 hover:bg-zinc-100 hover:text-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
											}`}
										>
											{label === "I-GYAN AI Blogs" ? (
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
													<path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06v-11a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 3a8.963 8.963 0 0 0-4.25 1.065V16.82ZM9.25 4.065A8.963 8.963 0 0 0 5 3c-.85 0-1.673.118-2.454.339A.75.75 0 0 0 2 4.06v11a.75.75 0 0 0 .954.721A7.462 7.462 0 0 1 5 15.5c1.579 0 3.042.487 4.25 1.32V4.065Z" />
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
													<path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
												</svg>
											)}
											{label}
										</Link>
									);
								})}
							</div>
						)}
					</div>					{linksAfterInsights.map(({ href, label }) => {
						const isActive = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								className={`relative transition-colors hover:text-indigo-500 dark:hover:text-indigo-400 ${
									isActive
										? "text-indigo-500 dark:text-indigo-400"
										: "text-zinc-600 dark:text-zinc-300"
								}`}
							>
								{label}
								{isActive ? (
									<span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-indigo-500 dark:bg-indigo-400" />
								) : null}
							</Link>
						);
					})}				</div>
				<div className="hidden items-center gap-3 lg:flex">
					<Link
						href="/login"
						className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-500 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
					>
						Log in
					</Link>
					<Link
						href="/register"
						className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(56,189,248,0.45)] transition duration-200 hover:scale-[1.04] hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.75)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
					>
						Get Started
					</Link>
				</div>
				<button
					type="button"
					onClick={() => setIsOpen((prev) => !prev)}
					className="inline-flex items-center justify-center rounded-lg border border-transparent p-2 text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-indigo-300 lg:hidden"
					aria-expanded={isOpen}
					aria-label="Toggle navigation"
				>
					{isOpen ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
						</svg>
					)}
				</button>
			</nav>
			{isOpen ? (
				<div className="mt-3 w-full max-w-5xl rounded-xl border border-zinc-200/80 bg-white/95 p-4 text-sm shadow-lg shadow-zinc-900/10 dark:border-zinc-700/60 dark:bg-zinc-900/95 lg:hidden">
					<nav className="flex flex-col gap-3">
						{linksBeforeInsights.map(({ href, label }) => {
							const isActive = pathname === href;
							return (
								<Link
									key={href}
									href={href}
									className={`rounded-lg px-3 py-2 transition-colors ${
										isActive
											? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
									}`}
								>
									{label}
								</Link>
							);
						})}
						{/* Insights section in mobile — between About Us and Contact */}
						<div className="rounded-lg border border-zinc-200/60 dark:border-zinc-700/40 px-3 py-2">
							<span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Insights</span>
							<div className="mt-2 flex flex-col gap-1">
								{insightsLinks.map(({ href, label }) => {
									const isActive = pathname === href;
									return (
										<Link
											key={href}
											href={href}
											className={`rounded-lg px-3 py-2 transition-colors ${
												isActive
													? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
													: "text-zinc-600 hover:bg-zinc-100 hover:text-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
											}`}
										>
											{label}
										</Link>
									);
								})}
							</div>
						</div>
						{linksAfterInsights.map(({ href, label }) => {
							const isActive = pathname === href;
							return (
								<Link
									key={href}
									href={href}
									className={`rounded-lg px-3 py-2 transition-colors ${
										isActive
											? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
									}`}
								>
									{label}
								</Link>
							);
						})}
						<hr className="border-zinc-200 dark:border-zinc-700" />
						<Link
							href="/login"
							className="rounded-lg px-3 py-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-indigo-500 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-indigo-300"
						>
							Log in
						</Link>
						<Link
							href="/register"
							className="rounded-lg bg-sky-500 px-3 py-2 text-center font-semibold text-white shadow-[0_0_20px_rgba(56,189,248,0.45)] transition duration-200 hover:scale-[1.03] hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.75)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
						>
							Get Started
						</Link>
					</nav>
				</div>
			) : null}
		</header>
	);
}
