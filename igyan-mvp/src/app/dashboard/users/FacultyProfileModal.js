"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

// SHA-256 hashing function
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

export default function FacultyProfileModal({ 
	isOpen, 
	onClose, 
	userId, 
	userName, 
	userEmail, 
	userPhone,
	onSave 
}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [profileExists, setProfileExists] = useState(false);
	const [showPasswordField, setShowPasswordField] = useState(false);
	const [formData, setFormData] = useState({
		age: "",
		gender: "",
		post: "",
		department: "",
		is_class_teacher: false,
		class: "",
		section: "",
		subjects: "",
		qualifications: "",
		experience_years: "",
		joining_date: "",
		employment_type: "",
		school_name: "",
		school_location: "",
		school_board: "",
		new_password: "",
		confirm_password: "",
	});

	useEffect(() => {
		if (isOpen && userId) {
			fetchFacultyProfile();
		}
		if (!isOpen) {
			// Reset password field visibility when modal closes
			setShowPasswordField(false);
		}
	}, [isOpen, userId]);

	const fetchFacultyProfile = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("faculty_profiles")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle();

			if (error && error.code !== "PGRST116") {
				console.error("Error fetching faculty profile:", error);
			}

			if (data) {
				setProfileExists(true);
				setFormData({
					age: data.age || "",
					gender: data.gender || "",
					post: data.post || "",
					department: data.department || "",
					is_class_teacher: data.is_class_teacher || false,
					class: data.class || "",
					section: data.section || "",
					subjects: data.subjects ? data.subjects.join(", ") : "",
					qualifications: data.qualifications ? data.qualifications.join(", ") : "",
					experience_years: data.experience_years || "",
					joining_date: data.joining_date || "",
					employment_type: data.employment_type || "",
					school_name: data.school_name || "",
					school_location: data.school_location || "",
					school_board: data.school_board || "",
					new_password: "",
					confirm_password: "",
				});
			} else {
				setProfileExists(false);
				// Reset password fields for new profile too
				setFormData(prev => ({
					...prev,
					new_password: "",
					confirm_password: "",
				}));
			}
		} catch (err) {
			console.error("Error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (!formData.post || !formData.joining_date) {
				setError("Post and Joining Date are required");
				setLoading(false);
				return;
			}

			// Validate password if provided
			if (formData.new_password || formData.confirm_password) {
				if (formData.new_password !== formData.confirm_password) {
					setError("Passwords do not match");
					setLoading(false);
					return;
				}
				if (formData.new_password.length < 6) {
					setError("Password must be at least 6 characters long");
					setLoading(false);
					return;
				}
			}

			const subjectsArray = formData.subjects
				? formData.subjects.split(",").map(s => s.trim()).filter(s => s)
				: null;

			const qualificationsArray = formData.qualifications
				? formData.qualifications.split(",").map(q => q.trim()).filter(q => q)
				: null;

			const profileData = {
				user_id: userId,
				name: userName,
				age: formData.age ? parseInt(formData.age) : null,
				gender: formData.gender || null,
				post: formData.post,
				department: formData.department || null,
				is_class_teacher: formData.is_class_teacher,
				class: formData.is_class_teacher ? formData.class : null,
				section: formData.is_class_teacher ? formData.section : null,
				subjects: subjectsArray,
				qualifications: qualificationsArray,
				experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
				joining_date: formData.joining_date,
				employment_type: formData.employment_type || null,
				phone: userPhone || null,
				email: userEmail,
				school_name: formData.school_name || null,
				school_location: formData.school_location || null,
				school_board: formData.school_board || null,
				updated_at: new Date().toISOString(),
			};

			let result;
			if (profileExists) {
				// Update existing profile
				result = await supabase
					.from("faculty_profiles")
					.update(profileData)
					.eq("user_id", userId);
			} else {
				// Create new profile
				result = await supabase
					.from("faculty_profiles")
					.insert([profileData]);
			}

			if (result.error) throw result.error;

			// Update password if provided
			if (formData.new_password) {
				const password_hash = await hashPassword(formData.new_password);
				const { error: passwordError } = await supabase
					.from("users")
					.update({ password_hash, updated_at: new Date().toISOString() })
					.eq("id", userId);

				if (passwordError) throw passwordError;
			}

			onSave();
			onClose();
		} catch (err) {
			console.error("Error saving faculty profile:", err);
			setError(err.message || "Failed to save faculty profile");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center overlay-scrim p-4 backdrop-blur-sm">
			<div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mb-6 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 pb-4 border-b border-zinc-200 dark:border-zinc-800 z-10">
					<div>
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
							{profileExists ? "Edit" : "Add"} Faculty Profile
						</h2>
						<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
							{userName} ({userEmail})
						</p>
					</div>
					<button
						onClick={onClose}
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
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{error && (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
						{error}
					</div>
				)}

				{loading && !error ? (
					<div className="flex items-center justify-center py-12">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Password Change Section */}
						<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
									</svg>
									<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
										Change Password
									</h3>
								</div>
								<button
									type="button"
									onClick={() => setShowPasswordField(!showPasswordField)}
									className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
								>
									{showPasswordField ? "Cancel" : "Change Password"}
								</button>
							</div>
							
							{showPasswordField && (
								<div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
									<div>
										<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
											New Password
										</label>
										<input
											type="password"
											name="new_password"
											value={formData.new_password}
											onChange={handleChange}
											placeholder="Enter new password"
											className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										/>
										<p className="mt-1 text-xs text-zinc-500">Minimum 6 characters</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
											Confirm Password
										</label>
										<input
											type="password"
											name="confirm_password"
											value={formData.confirm_password}
											onChange={handleChange}
											placeholder="Confirm new password"
											className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										/>
									</div>
								</div>
							)}
						</div>

						<div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
								Professional Details
							</h3>
						</div>

						{/* Age and Gender */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Age
								</label>
								<input
									type="number"
									name="age"
									value={formData.age}
									onChange={handleChange}
									placeholder="Enter age"
									min="18"
									max="100"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Gender
								</label>
								<select
									name="gender"
									value={formData.gender}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">Select gender</option>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
									<option value="Other">Other</option>
								</select>
							</div>
						</div>

						{/* Post and Department */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Post <span className="text-red-500">*</span>
								</label>
								<select
									name="post"
									value={formData.post}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								>
									<option value="">Select post</option>
									<option value="TGT">TGT (Trained Graduate Teacher)</option>
									<option value="PGT">PGT (Post Graduate Teacher)</option>
									<option value="Professor">Professor</option>
									<option value="Assistant Professor">Assistant Professor</option>
									<option value="Principal">Principal</option>
									<option value="Vice Principal">Vice Principal</option>
									<option value="Lecturer">Lecturer</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Department
								</label>
								<input
									type="text"
									name="department"
									value={formData.department}
									onChange={handleChange}
									placeholder="e.g., Science, Mathematics"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
						</div>

						{/* Class Teacher */}
						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								name="is_class_teacher"
								id="is_class_teacher_edit"
								checked={formData.is_class_teacher}
								onChange={handleChange}
								className="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
							/>
							<label htmlFor="is_class_teacher_edit" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Is Class Teacher
							</label>
						</div>

						{/* Class and Section */}
						{formData.is_class_teacher && (
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
										Class <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="class"
										value={formData.class}
										onChange={handleChange}
										placeholder="e.g., 10th, XII"
										className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										required={formData.is_class_teacher}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
										Section <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="section"
										value={formData.section}
										onChange={handleChange}
										placeholder="e.g., A, B"
										className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										required={formData.is_class_teacher}
									/>
								</div>
							</div>
						)}

						{/* Subjects */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Subjects
							</label>
							<input
								type="text"
								name="subjects"
								value={formData.subjects}
								onChange={handleChange}
								placeholder="e.g., Mathematics, Physics (comma-separated)"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
							<p className="mt-1 text-xs text-zinc-500">Separate multiple subjects with commas</p>
						</div>

						{/* Qualifications */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Qualifications
							</label>
							<input
								type="text"
								name="qualifications"
								value={formData.qualifications}
								onChange={handleChange}
								placeholder="e.g., M.Sc., B.Ed., Ph.D. (comma-separated)"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
							<p className="mt-1 text-xs text-zinc-500">Separate multiple qualifications with commas</p>
						</div>

						{/* Experience and Joining Date */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Experience (years)
								</label>
								<input
									type="number"
									name="experience_years"
									value={formData.experience_years}
									onChange={handleChange}
									placeholder="Years of experience"
									min="0"
									max="50"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Joining Date <span className="text-red-500">*</span>
								</label>
								<input
									type="date"
									name="joining_date"
									value={formData.joining_date}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								/>
							</div>
						</div>

						{/* Employment Type */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Employment Type
							</label>
							<select
								name="employment_type"
								value={formData.employment_type}
								onChange={handleChange}
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							>
								<option value="">Select employment type</option>
								<option value="Permanent">Permanent</option>
								<option value="Contract">Contract</option>
								<option value="Guest">Guest</option>
								<option value="Part-time">Part-time</option>
							</select>
						</div>

						{/* School Details */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								School Name
							</label>
							<input
								type="text"
								name="school_name"
								value={formData.school_name}
								onChange={handleChange}
								placeholder="School name"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Location
								</label>
								<input
									type="text"
									name="school_location"
									value={formData.school_location}
									onChange={handleChange}
									placeholder="City, State"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Board
								</label>
								<input
									type="text"
									name="school_board"
									value={formData.school_board}
									onChange={handleChange}
									placeholder="e.g., CBSE, ICSE"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2 border-t border-zinc-200 dark:border-zinc-800 mt-4">
							<button
								type="submit"
								disabled={loading}
								className="flex-1 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{loading ? "Saving..." : profileExists ? "Update Profile" : "Create Profile"}
							</button>
							<button
								type="button"
								onClick={onClose}
								disabled={loading}
								className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Cancel
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
