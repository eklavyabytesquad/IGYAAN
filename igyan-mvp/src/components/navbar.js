"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";

const links = [
	{ href: "/features", label: "Features" },
	{ href: "/about", label: "About Us" },
	{ href: "/contact", label: "Contact" },
	{ href: "/shark-ai", label: "Shark AI" },
];

export default function Navbar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsOpen(false), 0);
		return () => clearTimeout(timer);
	}, [pathname]);

	return (
		<header className="sticky top-0 z-50 flex flex-col items-center px-4 pt-4 backdrop-blur">
			<div className="absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-white/90 via-white/70 to-transparent dark:from-black/85 dark:via-black/70 dark:to-transparent" />
			<nav className="flex w-full max-w-5xl items-center justify-between rounded-xl border border-zinc-200/80 bg-white/85 px-5 py-3 shadow-lg shadow-zinc-900/10 transition-all dark:border-zinc-700/60 dark:bg-zinc-900/80">
				<Link
					href="/"
					className="flex items-center gap-3 text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-sky-500 dark:text-zinc-100 dark:hover:text-sky-400"
				>
					<Logo variant="nav" />
					<span className="leading-tight">iGyanAI</span>
				</Link>
				<div className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300 lg:flex">
					{links.map(({ href, label }) => {
						const isActive = pathname === href;

						return (
							<Link
								key={href}
								href={href}
								className={`relative transition-colors hover:text-sky-500 dark:hover:text-sky-400 ${
									isActive
										? "text-sky-500 dark:text-sky-300"
										: "text-zinc-600 dark:text-zinc-300"
								}`}
							>
								{label}
								{isActive ? (
									<span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-sky-500 dark:bg-sky-400" />
								) : null}
							</Link>
						);
					})}
				</div>
				<div className="hidden items-center gap-3 lg:flex">
					<ThemeToggle />
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
					className="inline-flex items-center justify-center rounded-lg border border-transparent p-2 text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-sky-300 lg:hidden"
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
						{links.map(({ href, label }) => {
							const isActive = pathname === href;
							return (
								<Link
									key={href}
									href={href}
									className={`rounded-lg px-3 py-2 transition-colors ${
										isActive
											? "bg-sky-50 text-sky-600 dark:bg-slate-900/60 dark:text-sky-300"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-sky-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
									}`}
								>
									{label}
								</Link>
							);
						})}
						<hr className="border-zinc-200 dark:border-zinc-700" />
						<div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/70 bg-zinc-50/80 px-3 py-2 dark:border-zinc-700/60 dark:bg-zinc-900/70">
							<span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Theme</span>
							<ThemeToggle />
						</div>
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
