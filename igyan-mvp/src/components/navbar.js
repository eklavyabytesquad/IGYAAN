"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const links = [
	{ href: "/features", label: "Features" },
	{ href: "/about", label: "About Us" },
	{ href: "/contact", label: "Contact" },
	{ href: "/shark-ai", label: "AI Shark" },
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
					{links.map(({ href, label }) => {
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
				</div>
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
						{links.map(({ href, label }) => {
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
