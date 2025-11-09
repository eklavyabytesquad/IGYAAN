"use client";

import { useState, useEffect } from "react";

export default function FacultyProfileSetupModal({ initialData, onSave, onClose }) {
	const [formData, setFormData] = useState({
		name: "",
		department: "",
		designation: "",
		experience: "",
		subjects: [],
		grades: [],
		teachingStyle: "",
		school: {
			name: "",
			location: "",
		},
		aiName: "Sudarshan AI",
	});

	const [currentSubject, setCurrentSubject] = useState("");
	const [currentGrade, setCurrentGrade] = useState("");

	useEffect(() => {
		if (initialData) {
			setFormData(initialData);
		}
	}, [initialData]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name.startsWith("school.")) {
			const schoolField = name.split(".")[1];
			setFormData(prev => ({
				...prev,
				school: {
					...prev.school,
					[schoolField]: value
				}
			}));
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
	};

	const addSubject = () => {
		if (currentSubject.trim() && !formData.subjects.includes(currentSubject.trim())) {
			setFormData(prev => ({
				...prev,
				subjects: [...prev.subjects, currentSubject.trim()]
			}));
			setCurrentSubject("");
		}
	};

	const removeSubject = (subject) => {
		setFormData(prev => ({
			...prev,
			subjects: prev.subjects.filter(s => s !== subject)
		}));
	};

	const addGrade = () => {
		if (currentGrade && !formData.grades.includes(currentGrade)) {
			setFormData(prev => ({
				...prev,
				grades: [...prev.grades, currentGrade]
			}));
			setCurrentGrade("");
		}
	};

	const removeGrade = (grade) => {
		setFormData(prev => ({
			...prev,
			grades: prev.grades.filter(g => g !== grade)
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (formData.name && formData.subjects.length > 0) {
			onSave(formData);
		}
	};

	const gradeOptions = [
		"Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
		"Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
	];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
						<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
					</svg>
				</button>

				<div className="mb-6">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Faculty Profile Setup</h2>
					<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
						Set up your faculty profile to personalize your AI assistant experience
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Basic Information</h3>
						
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								Full Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								placeholder="e.g., Dr. Priya Sharma"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
									Department
								</label>
								<input
									type="text"
									name="department"
									value={formData.department}
									onChange={handleChange}
									placeholder="e.g., Science Department"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
									Designation
								</label>
								<input
									type="text"
									name="designation"
									value={formData.designation}
									onChange={handleChange}
									placeholder="e.g., Senior Teacher"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								Years of Experience
							</label>
							<input
								type="number"
								name="experience"
								value={formData.experience}
								onChange={handleChange}
								min="0"
								placeholder="e.g., 10"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>
					</div>

					{/* Teaching Details */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Teaching Details</h3>
						
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								Subjects Teaching <span className="text-red-500">*</span>
							</label>
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									value={currentSubject}
									onChange={(e) => setCurrentSubject(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
									placeholder="e.g., Physics, Chemistry"
									className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
								<button
									type="button"
									onClick={addSubject}
									className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
								>
									Add
								</button>
							</div>
							{formData.subjects.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.subjects.map((subject, idx) => (
										<span
											key={idx}
											className="inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
										>
											{subject}
											<button
												type="button"
												onClick={() => removeSubject(subject)}
												className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
											>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
													<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
												</svg>
											</button>
										</span>
									))}
								</div>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								Grades Teaching
							</label>
							<div className="flex gap-2 mb-2">
								<select
									value={currentGrade}
									onChange={(e) => setCurrentGrade(e.target.value)}
									className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">Select Grade</option>
									{gradeOptions.map(grade => (
										<option key={grade} value={grade}>{grade}</option>
									))}
								</select>
								<button
									type="button"
									onClick={addGrade}
									disabled={!currentGrade}
									className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Add
								</button>
							</div>
							{formData.grades.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.grades.map((grade, idx) => (
										<span
											key={idx}
											className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
										>
											{grade}
											<button
												type="button"
												onClick={() => removeGrade(grade)}
												className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
											>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
													<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
												</svg>
											</button>
										</span>
									))}
								</div>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								Teaching Style
							</label>
							<textarea
								name="teachingStyle"
								value={formData.teachingStyle}
								onChange={handleChange}
								rows="3"
								placeholder="e.g., Interactive, student-centered approach with focus on practical applications..."
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none"
							/>
						</div>
					</div>

					{/* School Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">School Information</h3>
						
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								School Name
							</label>
							<input
								type="text"
								name="school.name"
								value={formData.school.name}
								onChange={handleChange}
								placeholder="e.g., Delhi Public School"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								School Location
							</label>
							<input
								type="text"
								name="school.location"
								value={formData.school.location}
								onChange={handleChange}
								placeholder="e.g., Mumbai, Maharashtra"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>
					</div>

					{/* AI Customization */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">AI Customization</h3>
						
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
								AI Assistant Name
							</label>
							<input
								type="text"
								name="aiName"
								value={formData.aiName}
								onChange={handleChange}
								placeholder="e.g., Sudarshan AI"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
							<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
								This is how your AI assistant will be addressed
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!formData.name || formData.subjects.length === 0}
							className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Save Profile
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
