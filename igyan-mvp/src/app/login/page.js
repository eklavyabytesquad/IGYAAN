"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import { useAuth } from "../utils/auth_context";

export default function LoginPage() {
	const { login } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.target);
		const email = formData.get("email");
		const password = formData.get("password");

		const result = await login(email, password);

		if (!result.success) {
			setError(result.error);
			setLoading(false);
		}
		// If successful, auth context will redirect to dashboard
	};

	return (
		<div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-20">
			<div className="rounded-3xl border border-zinc-200 bg-white/90 p-10 shadow-2xl shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/70">
				<div className="mb-6 flex justify-center">
					<Logo variant="card" />
				</div>
				<h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
					Welcome back
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
					Access your iGyanAI dashboard and copilots.
				</p>

				{error && (
					<div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
						{error}
					</div>
				)}

				<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
						>
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							placeholder="you@school.com"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
						>
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							required
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? "Logging in..." : "Log in"}
					</button>
				</form>
				<p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
					Need an account?{" "}
					<Link
						href="/register"
						className="font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
					>
						Create one
					</Link>
				</p>
			</div>
		</div>
	);
}
