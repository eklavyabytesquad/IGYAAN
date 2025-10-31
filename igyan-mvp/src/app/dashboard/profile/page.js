"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import Link from "next/link";

export default function ProfilePage() {
	const { user, loading, checkSession } = useAuth();
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);
	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		phone: "",
		image_base64: "",
	});

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (user) {
			setFormData({
				full_name: user.full_name || "",
				email: user.email || "",
				phone: user.phone || "",
				image_base64: user.image_base64 || "",
			});
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
		setSuccess("");
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setError("Image size should be less than 5MB");
			return;
		}

		const validTypes = ["image/jpeg", "image/jpg", "image/png"];
		if (!validTypes.includes(file.type)) {
			setError("Please upload a valid image (JPEG, PNG)");
			return;
		}

		setUploadingImage(true);
		setError("");
		setSuccess("");

		const reader = new FileReader();
		reader.onloadend = () => {
			setFormData((prev) => ({ ...prev, image_base64: reader.result }));
			setUploadingImage(false);
		};
		reader.onerror = () => {
			setError("Failed to read image. Please try again.");
			setUploadingImage(false);
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setFormData((prev) => ({ ...prev, image_base64: "" }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			// Validate required fields
			if (!formData.full_name || !formData.email) {
				setError("Name and email are required");
				setSaving(false);
				return;
			}

			// Update user profile
			const { error: updateError } = await supabase
				.from("users")
				.update({
					full_name: formData.full_name,
					email: formData.email,
					phone: formData.phone || null,
					image_base64: formData.image_base64 || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", user.id);

			if (updateError) {
				throw updateError;
			}

			setSuccess("Profile updated successfully!");
			
			// Refresh user data
			await checkSession();

			// Scroll to top to show success message
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (err) {
			console.error("Error updating profile:", err);
			setError(err.message || "Failed to update profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
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
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						User Profile
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Update your personal information and preferences
					</p>
				</div>
				<Link
					href="/dashboard/settings"
					className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="h-4 w-4"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
					Back to Settings
				</Link>
			</div>

			{/* Success Message */}
			{success && (
				<div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
					{success}
				</div>
			)}

			{/* Error Message */}
			{error && (
				<div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
					{error}
				</div>
			)}

			{/* Profile Form */}
			<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Profile Picture */}
					<div>
						<label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
							Profile Picture
						</label>
						<div className="flex items-start gap-6">
							{formData.image_base64 ? (
								<div className="relative">
									<img
										src={formData.image_base64}
										alt="Profile"
										className="h-32 w-32 rounded-full border-4 border-zinc-200 object-cover dark:border-zinc-700"
									/>
									<button
										type="button"
										onClick={removeImage}
										className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600"
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
								<label className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-4 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
									<input
										type="file"
										accept="image/jpeg,image/jpg,image/png"
										onChange={handleImageUpload}
										className="hidden"
										disabled={uploadingImage}
									/>
									{uploadingImage ? (
										<svg
											className="h-10 w-10 animate-spin text-indigo-500"
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
											className="h-10 w-10 text-zinc-400"
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
							<div>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Upload a professional photo
								</p>
								<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
									JPEG or PNG, max 5MB. Recommended: 512x512px
								</p>
							</div>
						</div>
					</div>

					{/* Full Name */}
					<div>
						<label
							htmlFor="full_name"
							className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
						>
							Full Name <span className="text-red-500">*</span>
						</label>
						<input
							id="full_name"
							name="full_name"
							type="text"
							value={formData.full_name}
							onChange={handleChange}
							placeholder="Enter your full name"
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							required
						/>
					</div>

					{/* Email */}
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
						>
							Email Address <span className="text-red-500">*</span>
						</label>
						<input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="your@email.com"
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							required
						/>
					</div>

					{/* Phone */}
					<div>
						<label
							htmlFor="phone"
							className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
						>
							Phone Number
						</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							value={formData.phone}
							onChange={handleChange}
							placeholder="+91 98765 43210"
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						/>
					</div>

					{/* Role (Read-only) */}
					<div>
						<label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
							Role
						</label>
						<div className="rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
							{user.role?.replace("_", " ").toUpperCase() || "NOT ASSIGNED"}
						</div>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
							Contact admin to change your role
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4 pt-4">
						<button
							type="submit"
							disabled={saving}
							className="flex-1 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
						>
							{saving ? "Saving changes..." : "Save Changes"}
						</button>
						<Link
							href="/dashboard/settings"
							className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
						>
							Cancel
						</Link>
					</div>
				</form>
			</div>

			{/* Account Info */}
			<div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
					Account Information
				</h3>
				<div className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span className="text-zinc-600 dark:text-zinc-400">User ID</span>
						<span className="font-mono text-xs text-zinc-900 dark:text-white">
							{user.id}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-zinc-600 dark:text-zinc-400">
							Member Since
						</span>
						<span className="font-medium text-zinc-900 dark:text-white">
							{new Date(user.created_at).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-zinc-600 dark:text-zinc-400">
							Last Updated
						</span>
						<span className="font-medium text-zinc-900 dark:text-white">
							{new Date(user.updated_at).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
