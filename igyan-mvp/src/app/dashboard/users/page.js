"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";

// SHA-256 hashing function (same as auth_context)
async function hashPassword(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
}

export default function UserManagementPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [users, setUsers] = useState([]);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		full_name: "",
		phone: "",
		role: "faculty",
		image_base64: "",
	});

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		const fetchUsers = async () => {
			if (!user) return;

			try {
				// Get the school_id of the current user
				const { data: schoolData } = await supabase
					.from("schools")
					.select("id")
					.eq("created_by", user.id)
					.single();

				if (!schoolData) {
					setLoadingUsers(false);
					return;
				}

				// Fetch all users from the same school
				const { data, error: fetchError } = await supabase
					.from("users")
					.select("*")
					.eq("school_id", schoolData.id)
					.order("created_at", { ascending: false });

				if (fetchError) {
					console.error("Error fetching users:", fetchError);
					setError("Failed to load users");
				} else {
					setUsers(data || []);
				}
			} catch (err) {
				console.error("Error:", err);
				setError("Failed to load users");
			} finally {
				setLoadingUsers(false);
			}
		};

		if (user) {
			fetchUsers();
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setError("Profile picture size should be less than 5MB");
			return;
		}

		const validTypes = ["image/jpeg", "image/jpg", "image/png"];
		if (!validTypes.includes(file.type)) {
			setError("Please upload a valid image (JPEG or PNG)");
			return;
		}

		setUploadingImage(true);
		setError("");

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
			if (!formData.email || !formData.password || !formData.full_name) {
				setError("Please fill in all required fields");
				setSaving(false);
				return;
			}

			if (!formData.image_base64) {
				setError("Please upload a profile picture");
				setSaving(false);
				return;
			}

			// Get the school_id
			const { data: schoolData } = await supabase
				.from("schools")
				.select("id")
				.eq("created_by", user.id)
				.single();

			if (!schoolData) {
				setError("School not found. Please complete school onboarding first.");
				setSaving(false);
				return;
			}

			// Hash the password using SHA-256
			const password_hash = await hashPassword(formData.password);

			// Insert the new user
			const { data: newUser, error: insertError } = await supabase
				.from("users")
				.insert([
					{
						email: formData.email,
						password_hash: password_hash,
						full_name: formData.full_name,
						phone: formData.phone || null,
						role: formData.role,
						school_id: schoolData.id,
						image_base64: formData.image_base64,
					},
				])
				.select()
				.single();

			if (insertError) {
				if (insertError.code === "23505") {
					throw new Error("Email already exists");
				}
				throw insertError;
			}

			// Add new user to the list
			setUsers((prev) => [newUser, ...prev]);

			// Reset form and close modal
			setFormData({
				email: "",
				password: "",
				full_name: "",
				phone: "",
				role: "faculty",
				image_base64: "",
			});
			setShowAddModal(false);
			setSuccess("User created successfully!");

			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			console.error("Error creating user:", err);
			setError(err.message || "Failed to create user. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (userId) => {
		if (!confirm("Are you sure you want to delete this user?")) return;

		try {
			const { error: deleteError } = await supabase
				.from("users")
				.delete()
				.eq("id", userId);

			if (deleteError) throw deleteError;

			setUsers((prev) => prev.filter((u) => u.id !== userId));
			setSuccess("User deleted successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			console.error("Error deleting user:", err);
			setError("Failed to delete user");
		}
	};

	if (loading || loadingUsers) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading users...
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
						User Management
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Manage faculty, students, and administrators
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="h-5 w-5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 4.5v15m7.5-7.5h-15"
						/>
					</svg>
					Add User
				</button>
			</div>

			{/* Success Message */}
			{success && (
				<div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
					{success}
				</div>
			)}

			{/* Error Message */}
			{error && !showAddModal && (
				<div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
					{error}
				</div>
			)}

			{/* Users List */}
			<div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
									User
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
									Email
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
									Phone
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
									Role
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
									Joined
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
							{users.length === 0 ? (
								<tr>
									<td colSpan="6" className="px-6 py-12 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
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
														d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
													/>
												</svg>
											</div>
											<div>
												<p className="text-sm font-medium text-zinc-900 dark:text-white">
													No users yet
												</p>
												<p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
													Click "Add User" to create your first user
												</p>
											</div>
										</div>
									</td>
								</tr>
							) : (
								users.map((usr) => (
									<tr
										key={usr.id}
										className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												{usr.image_base64 ? (
													<img
														src={usr.image_base64}
														alt={usr.full_name}
														className="h-10 w-10 rounded-full object-cover"
													/>
												) : (
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
														{usr.full_name
															?.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase() || "U"}
													</div>
												)}
												<div>
													<p className="text-sm font-medium text-zinc-900 dark:text-white">
														{usr.full_name}
													</p>
													<p className="text-xs text-zinc-600 dark:text-zinc-400">
														{usr.id === user.id ? "(You)" : ""}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<p className="text-sm text-zinc-900 dark:text-white">
												{usr.email}
											</p>
										</td>
										<td className="px-6 py-4">
											<p className="text-sm text-zinc-900 dark:text-white">
												{usr.phone || "-"}
											</p>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    usr.role === "co_admin"
														? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
														: usr.role === "faculty"
														? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
														: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
												}`}
											>
												{usr.role?.replace("_", " ").toUpperCase()}
											</span>
										</td>
										<td className="px-6 py-4">
											<p className="text-sm text-zinc-900 dark:text-white">
												{new Date(usr.created_at).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</p>
										</td>
										<td className="px-6 py-4">
											<button
												onClick={() => handleDelete(usr.id)}
												disabled={usr.id === user.id}
												className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20"
												title={usr.id === user.id ? "Cannot delete yourself" : "Delete user"}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.5"
													className="h-5 w-5"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
													/>
												</svg>
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add User Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
								Add New User
							</h2>
							<button
								onClick={() => {
									setShowAddModal(false);
									setError("");
									setFormData({
										email: "",
										password: "",
										full_name: "",
										phone: "",
										role: "faculty",
										image_base64: "",
									});
								}}
								className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-6 w-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{error && (
							<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Profile Picture */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Profile Picture <span className="text-red-500">*</span>
								</label>
								<div className="flex items-center gap-4">
									{formData.image_base64 ? (
										<div className="relative">
											<img
												src={formData.image_base64}
												alt="Profile"
												className="h-20 w-20 rounded-full object-cover"
											/>
											<button
												type="button"
												onClick={removeImage}
												className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className="h-4 w-4"
												>
													<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									) : (
										<label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800">
											<input
												type="file"
												accept="image/jpeg,image/jpg,image/png"
												onChange={handleImageUpload}
												className="hidden"
												disabled={uploadingImage}
											/>
											{uploadingImage ? (
												<svg className="h-6 w-6 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-zinc-400">
													<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
													<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
												</svg>
											)}
										</label>
									)}
									<div className="flex-1">
										<p className="text-sm text-zinc-600 dark:text-zinc-400">Upload profile picture</p>
										<p className="text-xs text-zinc-500">Max 5MB. JPEG or PNG</p>
									</div>
								</div>
							</div>

							{/* Full Name */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Full Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="full_name"
									value={formData.full_name}
									onChange={handleChange}
									placeholder="Enter full name"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								/>
							</div>

							{/* Email */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="user@example.com"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								/>
							</div>

							{/* Password */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Password <span className="text-red-500">*</span>
								</label>
								<input
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Enter password"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								/>
							</div>

							{/* Phone */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Phone Number
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									placeholder="+91 1234567890"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>

							{/* Role */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Role <span className="text-red-500">*</span>
								</label>
								<select
									name="role"
									value={formData.role}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								>
									<option value="faculty">Faculty</option>
									<option value="student">Student</option>
									<option value="co_admin">Co-Admin</option>
								</select>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 pt-4">
								<button
									type="submit"
									disabled={saving || uploadingImage}
									className="flex-1 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{saving ? "Creating..." : "Create User"}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddModal(false);
										setError("");
										setFormData({
											email: "",
											password: "",
											full_name: "",
											phone: "",
											role: "faculty",
											image_base64: "",
										});
									}}
									className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
