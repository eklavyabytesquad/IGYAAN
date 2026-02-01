"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import Link from "next/link";

export default function SchoolProfilePage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [uploadingFile, setUploadingFile] = useState("");
	const [schoolExists, setSchoolExists] = useState(false);
	const [formData, setFormData] = useState({
		school_name: "",
		school_type: "",
		affiliation_board: "",
		address_line1: "",
		address_line2: "",
		city: "",
		state: "",
		pincode: "",
		country: "India",
		contact_email: "",
		contact_phone: "",
		principal_name: "",
		principal_email: "",
		principal_phone: "",
		udise_code: "",
		logo_url: "",
		registration_certificate_url: "",
		affiliation_certificate_url: "",
		principal_id_proof_url: "",
	});

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		const fetchSchoolData = async () => {
			if (!user?.id) return;

			try {
				// Check if user has school_id (all institutional users should have one)
				if (!user.school_id) {
					console.warn("User does not have school_id:", user.id);
					return;
				}

				console.log("Fetching school data for school_id:", user.school_id);

				// Fetch school by user's school_id
				const { data, error: fetchError } = await supabase
					.from("schools")
					.select("*")
					.eq("id", user.school_id)
					.maybeSingle();

				if (fetchError && fetchError.code !== "PGRST116") {
					console.error("Error fetching school:", fetchError);
					return;
				}

				if (data) {
					setSchoolExists(true);
					setFormData({
						school_name: data.school_name || "",
						school_type: data.school_type || "",
						affiliation_board: data.affiliation_board || "",
						address_line1: data.address_line1 || "",
						address_line2: data.address_line2 || "",
						city: data.city || "",
						state: data.state || "",
						pincode: data.pincode || "",
						country: data.country || "India",
						contact_email: data.contact_email || "",
						contact_phone: data.contact_phone || "",
						principal_name: data.principal_name || "",
						principal_email: data.principal_email || "",
						principal_phone: data.principal_phone || "",
						udise_code: data.udise_code || "",
						logo_url: data.logo_url || "",
						registration_certificate_url: data.registration_certificate_url || "",
						affiliation_certificate_url: data.affiliation_certificate_url || "",
						principal_id_proof_url: data.principal_id_proof_url || "",
					});
				}
			} catch (err) {
				console.error("Error in fetchSchoolData:", err);
			}
		};

		if (user) {
			fetchSchoolData();
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
		setSuccess("");
	};

	const handleFileUpload = (e, fieldName) => {
		const file = e.target.files[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setError(`File size should be less than 5MB for ${fieldName}`);
			return;
		}

		const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
		if (!validTypes.includes(file.type)) {
			setError(`Please upload a valid image (JPEG, PNG) or PDF file`);
			return;
		}

		setUploadingFile(fieldName);
		setError("");
		setSuccess("");

		const reader = new FileReader();
		reader.onloadend = () => {
			setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
			setUploadingFile("");
		};
		reader.onerror = () => {
			setError(`Failed to read ${fieldName}. Please try again.`);
			setUploadingFile("");
		};
		reader.readAsDataURL(file);
	};

	const removeFile = (fieldName) => {
		setFormData((prev) => ({ ...prev, [fieldName]: "" }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			// Validate required fields
			if (
				!formData.school_name ||
				!formData.school_type ||
				!formData.address_line1 ||
				!formData.city ||
				!formData.state ||
				!formData.pincode ||
				!formData.contact_email ||
				!formData.contact_phone
			) {
				setError("Please fill in all required fields");
				setSaving(false);
				return;
			}

			// Generate subdomain from school name
			const subdomain = formData.school_name
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "");

			if (schoolExists) {
				// Update existing school
				const { error: updateError } = await supabase
					.from("schools")
					.update({
						school_name: formData.school_name,
						subdomain: subdomain || "school",
						school_type: formData.school_type,
						affiliation_board: formData.affiliation_board || null,
						address_line1: formData.address_line1,
						address_line2: formData.address_line2 || null,
						city: formData.city,
						state: formData.state,
						pincode: formData.pincode,
						country: formData.country,
						contact_email: formData.contact_email,
						contact_phone: formData.contact_phone,
						principal_name: formData.principal_name || null,
						principal_email: formData.principal_email || null,
						principal_phone: formData.principal_phone || null,
						udise_code: formData.udise_code || null,
						logo_url: formData.logo_url || null,
						registration_certificate_url: formData.registration_certificate_url || null,
						affiliation_certificate_url: formData.affiliation_certificate_url || null,
						principal_id_proof_url: formData.principal_id_proof_url || null,
						updated_by: user.id,
						updated_at: new Date().toISOString(),
					})
					.eq("created_by", user.id);

				if (updateError) {
					throw updateError;
				}
			} else {
				// Create new school (shouldn't happen normally, but handle it)
				const { error: insertError } = await supabase
					.from("schools")
					.insert([
						{
							school_name: formData.school_name,
							subdomain: subdomain || "school",
							school_type: formData.school_type,
							affiliation_board: formData.affiliation_board || null,
							address_line1: formData.address_line1,
							address_line2: formData.address_line2 || null,
							city: formData.city,
							state: formData.state,
							pincode: formData.pincode,
							country: formData.country,
							contact_email: formData.contact_email,
							contact_phone: formData.contact_phone,
							principal_name: formData.principal_name || null,
							principal_email: formData.principal_email || null,
							principal_phone: formData.principal_phone || null,
							udise_code: formData.udise_code || null,
							logo_url: formData.logo_url || null,
							registration_certificate_url: formData.registration_certificate_url || null,
							affiliation_certificate_url: formData.affiliation_certificate_url || null,
							principal_id_proof_url: formData.principal_id_proof_url || null,
							created_by: user.id,
							updated_by: user.id,
						},
					]);

				if (insertError) {
					throw insertError;
				}

				setSchoolExists(true);
			}

			setSuccess("School profile updated successfully!");
			window.scrollTo({ top: 0, behavior: "smooth" });

			// Reload after 1.5 seconds to refresh navbar/sidebar
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (err) {
			console.error("Error updating school:", err);
			setError(err.message || "Failed to update school profile. Please try again.");
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
						Loading school profile...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	const isFaculty = user.role === 'faculty';
	const isViewOnly = isFaculty;

	return (
		<div className="p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						School Profile
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						{isViewOnly ? 'View your school information and details' : 'Manage your school information and branding'}
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

			{/* View-Only Notice for Faculty */}
			{isViewOnly && (
				<div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
					</svg>
					<span>You are viewing school information in read-only mode. Contact your administrator to make changes.</span>
				</div>
			)}

			{/* School Profile Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
						Basic Information
					</h3>
					<div className="space-y-6">
						{/* School Name */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								School Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="school_name"
								value={formData.school_name}
								onChange={handleChange}
								placeholder="Enter school name"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
								required
								disabled={isViewOnly}
							/>
						</div>

						{/* School Logo */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								School Logo
							</label>
							<div className="flex items-start gap-4">
								{formData.logo_url ? (
									<div className="relative">
										<img
											src={formData.logo_url}
											alt="School Logo"
											className="h-24 w-24 rounded-lg border-2 border-zinc-200 object-cover dark:border-zinc-700"
										/>
										{!isViewOnly && (
											<button
												type="button"
												onClick={() => removeFile("logo_url")}
												className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
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
										)}
									</div>
								) : (
									!isViewOnly && (
										<label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800">
											<input
												type="file"
												accept="image/jpeg,image/jpg,image/png"
												onChange={(e) => handleFileUpload(e, "logo_url")}
												className="hidden"
												disabled={uploadingFile === "logo_url"}
											/>
											{uploadingFile === "logo_url" ? (
												<svg className="h-6 w-6 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-zinc-400">
													<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
												</svg>
											)}
										</label>
									)
								)}
								<div className="flex-1">
									<p className="text-sm text-zinc-600 dark:text-zinc-400">Upload your school logo</p>
									<p className="mt-1 text-xs text-zinc-500">Max 5MB. Recommended: 512x512px</p>
								</div>
							</div>
						</div>

						<div className="grid gap-6 sm:grid-cols-2">
							{/* School Type */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Type <span className="text-red-500">*</span>
								</label>
								<select
									name="school_type"
									value={formData.school_type}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									required
									disabled={isViewOnly}
								>
									<option value="">Select type</option>
									<option value="primary">Primary School</option>
									<option value="secondary">Secondary School</option>
									<option value="higher_secondary">Higher Secondary</option>
									<option value="college">College</option>
									<option value="university">University</option>
								</select>
							</div>

							{/* Affiliation Board */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Affiliation Board
								</label>
								<input
									type="text"
									name="affiliation_board"
									value={formData.affiliation_board}
									onChange={handleChange}
									placeholder="CBSE, ICSE, State Board, etc."
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={isViewOnly}
								/>
							</div>

							{/* UDISE Code */}
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									UDISE Code
								</label>
								<input
									type="text"
									name="udise_code"
									value={formData.udise_code}
									onChange={handleChange}
									placeholder="Enter UDISE code"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={isViewOnly}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Address Information */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
						Address
					</h3>
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Address Line 1 <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="address_line1"
								value={formData.address_line1}
								onChange={handleChange}
								placeholder="Street address"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
								required
								disabled={isViewOnly}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Address Line 2
							</label>
							<input
								type="text"
								name="address_line2"
								value={formData.address_line2}
								onChange={handleChange}
								placeholder="Apartment, suite, etc. (optional)"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
								disabled={isViewOnly}
							/>
						</div>

						<div className="grid gap-6 sm:grid-cols-3">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									City <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="city"
									value={formData.city}
									onChange={handleChange}
									placeholder="City"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									required
									disabled={isViewOnly}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									State <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="state"
									value={formData.state}
									onChange={handleChange}
									placeholder="State"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									required
									disabled={isViewOnly}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									PIN Code <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="pincode"
									value={formData.pincode}
									onChange={handleChange}
									placeholder="PIN code"
									maxLength={10}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									required
									disabled={isViewOnly}
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Country
							</label>
							<input
								type="text"
								name="country"
								value={formData.country}
								onChange={handleChange}
								placeholder="Country"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
								disabled={isViewOnly}
							/>
						</div>
					</div>
				</div>

				{/* Contact Information */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
						Contact Information
					</h3>
					<div className="space-y-6">
						<div className="grid gap-6 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Contact Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									name="contact_email"
									value={formData.contact_email}
									onChange={handleChange}
									placeholder="school@example.com"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									required
									disabled={isViewOnly}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Contact Phone <span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									name="contact_phone"
									value={formData.contact_phone}
									onChange={handleChange}
									placeholder="+91 1234567890"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									required
									disabled={isViewOnly}
								/>
							</div>
						</div>

						<div className="grid gap-6 sm:grid-cols-3">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Principal Name
								</label>
								<input
									type="text"
									name="principal_name"
									value={formData.principal_name}
									onChange={handleChange}
									placeholder="Principal's name"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={isViewOnly}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Principal Email
								</label>
								<input
									type="email"
									name="principal_email"
									value={formData.principal_email}
									onChange={handleChange}
									placeholder="principal@example.com"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={isViewOnly}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Principal Phone
								</label>
								<input
									type="tel"
									name="principal_phone"
									value={formData.principal_phone}
									onChange={handleChange}
									placeholder="+91 1234567890"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={isViewOnly}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Documents */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
						Verification Documents
					</h3>
					<div className="space-y-6">
						{/* Registration Certificate */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								School Registration Certificate
							</label>
							{formData.registration_certificate_url ? (
								<div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-green-500">
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div className="flex-1">
										<p className="text-sm font-medium text-zinc-900 dark:text-white">File uploaded</p>
									</div>
									{!isViewOnly && (
										<button type="button" onClick={() => removeFile("registration_certificate_url")} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									)}
								</div>
							) : (
								!isViewOnly && (
									<label className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800">
										<input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={(e) => handleFileUpload(e, "registration_certificate_url")} className="hidden" disabled={uploadingFile === "registration_certificate_url"} />
										{uploadingFile === "registration_certificate_url" ? (
											<svg className="h-8 w-8 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-zinc-400">
												<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
											</svg>
										)}
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">Click to upload</p>
											<p className="text-xs text-zinc-500">PDF, JPEG, or PNG (max 5MB)</p>
										</div>
									</label>
								)
							)}
						</div>

						{/* Similar structure for other documents - Affiliation Certificate */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Board Affiliation Certificate
							</label>
							{formData.affiliation_certificate_url ? (
								<div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-green-500">
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div className="flex-1">
										<p className="text-sm font-medium text-zinc-900 dark:text-white">File uploaded</p>
									</div>
									{!isViewOnly && (
										<button type="button" onClick={() => removeFile("affiliation_certificate_url")} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									)}
								</div>
							) : (
								!isViewOnly && (
									<label className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800">
										<input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={(e) => handleFileUpload(e, "affiliation_certificate_url")} className="hidden" disabled={uploadingFile === "affiliation_certificate_url"} />
										{uploadingFile === "affiliation_certificate_url" ? (
											<svg className="h-8 w-8 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-zinc-400">
												<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
											</svg>
										)}
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">Click to upload</p>
											<p className="text-xs text-zinc-500">PDF, JPEG, or PNG (max 5MB)</p>
										</div>
									</label>
								)
							)}
						</div>

						{/* Principal's ID Proof */}
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Principal's ID Proof
							</label>
							{formData.principal_id_proof_url ? (
								<div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-green-500">
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div className="flex-1">
										<p className="text-sm font-medium text-zinc-900 dark:text-white">File uploaded</p>
									</div>
									{!isViewOnly && (
										<button type="button" onClick={() => removeFile("principal_id_proof_url")} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									)}
								</div>
							) : (
								!isViewOnly && (
									<label className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800">
										<input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={(e) => handleFileUpload(e, "principal_id_proof_url")} className="hidden" disabled={uploadingFile === "principal_id_proof_url"} />
										{uploadingFile === "principal_id_proof_url" ? (
											<svg className="h-8 w-8 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-zinc-400">
												<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
											</svg>
										)}
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">Click to upload</p>
											<p className="text-xs text-zinc-500">PDF, JPEG, or PNG (max 5MB)</p>
										</div>
									</label>
								)
							)}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-4">
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
	);
}
