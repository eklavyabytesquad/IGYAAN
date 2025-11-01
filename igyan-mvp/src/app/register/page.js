"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import { useAuth } from "../utils/auth_context";

export default function RegisterPage() {
	const { register } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageBase64, setImageBase64] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError("Image size should be less than 5MB");
			return;
		}

		// Validate file type
		const validTypes = ["image/jpeg", "image/jpg", "image/png"];
		if (!validTypes.includes(file.type)) {
			setError("Please upload a valid image (JPEG, PNG)");
			return;
		}

		setUploadingImage(true);
		setError("");

		const reader = new FileReader();
		reader.onloadend = () => {
			setImageBase64(reader.result);
			setUploadingImage(false);
		};
		reader.onerror = () => {
			setError("Failed to read image. Please try again.");
			setUploadingImage(false);
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setImageBase64("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.target);
		const fullName = `${formData.get("firstName")} ${formData.get("lastName")}`;
		const email = formData.get("email");
		const password = formData.get("password");
		const phone = formData.get("phone");

		// Validate image is uploaded
		if (!imageBase64) {
			setError("Please upload your profile picture");
			setLoading(false);
			return;
		}

		const result = await register(email, password, fullName, phone || null, imageBase64);

		if (!result.success) {
			if (result.error.includes("duplicate") || result.error.includes("23505")) {
				setError("This email is already registered. Please log in instead.");
			} else {
				setError(result.error);
			}
			setLoading(false);
		}
		// If successful, auth context will redirect to dashboard
	};

	return (
		<div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-6 py-20">
			<div className="rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/15 dark:border-slate-900 dark:bg-slate-950/75">
				<div className="mb-6 flex justify-center">
					<Logo variant="card" />
				</div>
				<h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
					Create your iGyanAI workspace
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
					Set up access for your institution and invite your leadership team in
					minutes.
				</p>

				{error && (
					<div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
						{error}
					</div>
				)}

				<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
					{/* Profile Picture Upload */}
					<div>
						<label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
							Profile Picture <span className="text-red-500">*</span>
						</label>
						<div className="flex items-start gap-4">
							{imageBase64 ? (
								<div className="relative">
									<img
										src={imageBase64}
										alt="Profile"
										className="h-24 w-24 rounded-full border-2 border-zinc-200 object-cover dark:border-zinc-700"
									/>
									<button
										type="button"
										onClick={removeImage}
										className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="h-4 w-4"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							) : (
								<label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-sky-500 hover:bg-sky-50 dark:border-zinc-700 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-900/60">
									<input
										type="file"
										accept="image/jpeg,image/jpg,image/png"
										onChange={handleImageUpload}
										className="hidden"
										disabled={uploadingImage}
									/>
									{uploadingImage ? (
										<svg
											className="h-8 w-8 animate-spin text-sky-500"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									) : (
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
												d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
											/>
										</svg>
									)}
								</label>
							)}
							<div className="flex-1">
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Upload your profile picture
								</p>
								<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
									JPEG or PNG, max 5MB
								</p>
							</div>
						</div>
					</div>

					<div className="grid gap-5 sm:grid-cols-2">
						<div>
							<label
								htmlFor="firstName"
								className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
							>
								First name
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								placeholder="Priya"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="lastName"
								className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
							>
								Last name
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								placeholder="Sharma"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
								required
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
						>
							Work email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							placeholder="you@school.com"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="phone"
							className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
						>
							Phone number (optional)
						</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							placeholder="+91 98765 43210"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
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
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
							required
							minLength={8}
						/>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							Minimum 8 characters
						</p>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:-translate-y-0.5 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? "Creating account..." : "Create workspace"}
					</button>
				</form>
				<p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
					Already have access?{" "}
					<Link
						href="/login"
						className="font-semibold text-sky-500 transition-colors hover:text-sky-400"
					>
						Log in here
					</Link>
				</p>
			</div>
		</div>
	);
}
