"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
	{ href: "/features", label: "Features" },
	{ href: "/about", label: "About Us" },
	{ href: "/contact", label: "Contact" },
];

export default function Navbar() {
	const pathname = usePathname();

	return (
		<header className="sticky top-4 z-50 flex justify-center px-4">
			<nav className="flex w-full max-w-5xl items-center justify-between rounded-xl border border-zinc-200 bg-white/90 px-6 py-3 shadow-xl shadow-zinc-900/5 backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-900/80">
				<Link
					href="/"
					className="text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-indigo-500 dark:text-zinc-100 dark:hover:text-indigo-400"
				>
					iGyanAI
				</Link>
				<div className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
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
				<div className="flex items-center gap-3">
					<Link
						href="/login"
						className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-500 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
					>
						Log in
					</Link>
					<Link
						href="/register"
						className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-indigo-400"
					>
						Get Started
					</Link>
				</div>
			</nav>
		</header>
	);
}
