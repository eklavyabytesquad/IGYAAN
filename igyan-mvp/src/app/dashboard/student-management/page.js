"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";

export default function StudentManagementPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [students, setStudents] = useState([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [filterClass, setFilterClass] = useState("");
	const [filterSection, setFilterSection] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [formData, setFormData] = useState({
		regNo: "",
		name: "",
		email: "",
		password: "",
		class: "",
		section: "",
	});
	const [formErrors, setFormErrors] = useState({});

	// Redirect if not authenticated or not faculty
	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		} else if (!loading && user && user.role !== "faculty") {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	// Load students from localStorage
	useEffect(() => {
		if (user && user.role === "faculty") {
			const storedStudents = localStorage.getItem(
				`students_${user.school_id || user.id}`
			);
			if (storedStudents) {
				setStudents(JSON.parse(storedStudents));
			}
		}
	}, [user]);

	// Save students to localStorage
	const saveStudents = (updatedStudents) => {
		localStorage.setItem(
			`students_${user.school_id || user.id}`,
			JSON.stringify(updatedStudents)
		);
		setStudents(updatedStudents);
	};

	// Validate form
	const validateForm = () => {
		const errors = {};
		if (!formData.regNo.trim()) errors.regNo = "Registration number is required";
		if (!formData.name.trim()) errors.name = "Name is required";
		if (!formData.email.trim()) errors.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
			errors.email = "Invalid email format";
		if (!formData.password.trim()) errors.password = "Password is required";
		else if (formData.password.length < 6)
			errors.password = "Password must be at least 6 characters";
		if (!formData.class.trim()) errors.class = "Class is required";
		if (!formData.section.trim()) errors.section = "Section is required";

		// Check for duplicate reg number
		if (
			students.some(
				(s) => s.regNo.toLowerCase() === formData.regNo.toLowerCase().trim()
			)
		) {
			errors.regNo = "Registration number already exists";
		}

		// Check for duplicate email
		if (
			students.some(
				(s) => s.email.toLowerCase() === formData.email.toLowerCase().trim()
			)
		) {
			errors.email = "Email already exists";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Handle form submit
	const handleAddStudent = (e) => {
		e.preventDefault();
		if (validateForm()) {
			const newStudent = {
				id: Date.now(),
				...formData,
				createdAt: new Date().toISOString(),
			};
			const updatedStudents = [...students, newStudent];
			saveStudents(updatedStudents);
			setShowAddModal(false);
			setFormData({
				regNo: "",
				name: "",
				email: "",
				password: "",
				class: "",
				section: "",
			});
			setFormErrors({});
		}
	};

	// Handle delete student
	const handleDeleteStudent = (id) => {
		if (confirm("Are you sure you want to delete this student?")) {
			const updatedStudents = students.filter((s) => s.id !== id);
			saveStudents(updatedStudents);
		}
	};

	// Download CSV
	const downloadCSV = () => {
		const headers = [
			"Reg No",
			"Name",
			"Email",
			"Class",
			"Section",
			"Added On",
		];
		const csvData = filteredStudents.map((s) => [
			s.regNo,
			s.name,
			s.email,
			s.class,
			s.section,
			new Date(s.createdAt).toLocaleDateString(),
		]);

		const csvContent = [
			headers.join(","),
			...csvData.map((row) => row.join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	// Filter students
	const filteredStudents = students.filter((student) => {
		const matchesClass = !filterClass || student.class === filterClass;
		const matchesSection = !filterSection || student.section === filterSection;
		const matchesSearch =
			!searchQuery ||
			student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.email.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesClass && matchesSection && matchesSearch;
	});

	// Get unique classes and sections
	const uniqueClasses = [...new Set(students.map((s) => s.class))].sort();
	const uniqueSections = [...new Set(students.map((s) => s.section))].sort();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading...
					</p>
				</div>
			</div>
		);
	}

	if (!user || user.role !== "faculty") return null;

	return (
		<div className="p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						Student Management
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Manage your students, add new records, and export data
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
						strokeWidth="2"
						className="h-5 w-5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 4.5v15m7.5-7.5h-15"
						/>
					</svg>
					Add Student
				</button>
			</div>

			{/* Stats */}
			<div className="mb-6 grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">
								{students.length}
							</p>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Total Students
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-sky-100 p-3 dark:bg-sky-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-sky-600 dark:text-sky-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">
								{uniqueClasses.length}
							</p>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Classes
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-purple-600 dark:text-purple-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">
								{filteredStudents.length}
							</p>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Filtered Results
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters and Search */}
			<div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="grid gap-4 sm:grid-cols-4">
					<div className="sm:col-span-2">
						<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Search
						</label>
						<div className="relative">
							<input
								type="text"
								placeholder="Search by name, reg no, or email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
								/>
							</svg>
						</div>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Filter by Class
						</label>
						<select
							value={filterClass}
							onChange={(e) => setFilterClass(e.target.value)}
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						>
							<option value="">All Classes</option>
							{uniqueClasses.map((cls) => (
								<option key={cls} value={cls}>
									{cls}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Filter by Section
						</label>
						<select
							value={filterSection}
							onChange={(e) => setFilterSection(e.target.value)}
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						>
							<option value="">All Sections</option>
							{uniqueSections.map((sec) => (
								<option key={sec} value={sec}>
									{sec}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
					<div className="text-sm text-zinc-600 dark:text-zinc-400">
						Showing {filteredStudents.length} of {students.length} students
					</div>
					<button
						onClick={downloadCSV}
						disabled={filteredStudents.length === 0}
						className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
								d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
							/>
						</svg>
						Download CSV
					</button>
				</div>
			</div>

			{/* Students Table */}
			<div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
				{filteredStudents.length === 0 ? (
					<div className="p-12 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="mx-auto h-16 w-16 text-zinc-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
							/>
						</svg>
						<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
							No students found
						</p>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{students.length === 0
								? "Get started by adding your first student"
								: "Try adjusting your filters"}
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
								<tr>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Reg No
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Name
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Email
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Class
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Section
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Added On
									</th>
									<th className="px-6 py-4 text-right text-sm font-semibold text-zinc-900 dark:text-white">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
								{filteredStudents.map((student) => (
									<tr
										key={student.id}
										className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									>
										<td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
											{student.regNo}
										</td>
										<td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
											{student.name}
										</td>
										<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
											{student.email}
										</td>
										<td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
											{student.class}
										</td>
										<td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
											{student.section}
										</td>
										<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
											{new Date(student.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 text-right">
											<button
												onClick={() => handleDeleteStudent(student.id)}
												className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
												title="Delete student"
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
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Add Student Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center overlay-scrim p-4">
					<div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
								Add New Student
							</h2>
							<button
								onClick={() => {
									setShowAddModal(false);
									setFormData({
										regNo: "",
										name: "",
										email: "",
										password: "",
										class: "",
										section: "",
									});
									setFormErrors({});
								}}
								className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
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

						<form onSubmit={handleAddStudent} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Registration Number <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.regNo}
										onChange={(e) =>
											setFormData({ ...formData, regNo: e.target.value })
										}
										className={`w-full rounded-lg border ${
											formErrors.regNo
												? "border-red-500"
												: "border-zinc-300 dark:border-zinc-700"
										} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
										placeholder="e.g., 2024001"
									/>
									{formErrors.regNo && (
										<p className="mt-1 text-xs text-red-500">
											{formErrors.regNo}
										</p>
									)}
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Full Name <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className={`w-full rounded-lg border ${
											formErrors.name
												? "border-red-500"
												: "border-zinc-300 dark:border-zinc-700"
										} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
										placeholder="e.g., John Doe"
									/>
									{formErrors.name && (
										<p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
									)}
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Email <span className="text-red-500">*</span>
									</label>
									<input
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										className={`w-full rounded-lg border ${
											formErrors.email
												? "border-red-500"
												: "border-zinc-300 dark:border-zinc-700"
										} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
										placeholder="e.g., john@example.com"
									/>
									{formErrors.email && (
										<p className="mt-1 text-xs text-red-500">
											{formErrors.email}
										</p>
									)}
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Password <span className="text-red-500">*</span>
									</label>
									<input
										type="password"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										className={`w-full rounded-lg border ${
											formErrors.password
												? "border-red-500"
												: "border-zinc-300 dark:border-zinc-700"
										} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
										placeholder="Min. 6 characters"
									/>
									{formErrors.password && (
										<p className="mt-1 text-xs text-red-500">
											{formErrors.password}
										</p>
									)}
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Class <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.class}
										onChange={(e) =>
											setFormData({ ...formData, class: e.target.value })
										}
										className={`w-full rounded-lg border ${
											formErrors.class
												? "border-red-500"
												: "border-zinc-300 dark:border-zinc-700"
										} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
										placeholder="e.g., 10"
									/>
									{formErrors.class && (
										<p className="mt-1 text-xs text-red-500">
											{formErrors.class}
										</p>
									)}
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Section <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.section}
										onChange={(e) =>
											setFormData({ ...formData, section: e.target.value })
										}
										className={`w-full rounded-lg border ${
											formErrors.section
												? "border-red-500"
												: "border-zinc-300 dark:border-zinc-700"
										} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
										placeholder="e.g., A"
									/>
									{formErrors.section && (
										<p className="mt-1 text-xs text-red-500">
											{formErrors.section}
										</p>
									)}
								</div>
							</div>

							<div className="flex gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
								<button
									type="submit"
									className="flex-1 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-600"
								>
									Add Student
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddModal(false);
										setFormData({
											regNo: "",
											name: "",
											email: "",
											password: "",
											class: "",
											section: "",
										});
										setFormErrors({});
									}}
									className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
