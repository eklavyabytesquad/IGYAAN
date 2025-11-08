"use client";

import { useState, useEffect } from "react";

export default function ProfileSetupModal({ initialData, onSave, onClose }) {
	const [formData, setFormData] = useState({
		name: "",
		aiName: "Sudarshan AI",
		class: "",
		school: {
			name: "",
			location: ""
		},
		classTeacher: "",
		interests: [],
		sleepTime: ""
	});

	const [interestInput, setInterestInput] = useState("");

	useEffect(() => {
		if (initialData) {
			setFormData(initialData);
		}
	}, [initialData]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setFormData(prev => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value
				}
			}));
		} else {
			setFormData(prev => ({
				...prev,
				[name]: value
			}));
		}
	};

	const handleAddInterest = () => {
		if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
			setFormData(prev => ({
				...prev,
				interests: [...prev.interests, interestInput.trim()]
			}));
			setInterestInput("");
		}
	};

	const handleRemoveInterest = (interest) => {
		setFormData(prev => ({
			...prev,
			interests: prev.interests.filter(i => i !== interest)
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			alert("Please enter your name");
			return;
		}
		onSave(formData);
	};

	const handleClose = () => {
		if (onClose) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 backdrop-blur-sm px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/95">
					<div>
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white">
							{initialData ? "Edit Your Profile" : "Setup Your Profile"}
						</h2>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Personalize your AI learning experience (optional)
						</p>
					</div>
					<button
						onClick={handleClose}
						className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						title="Close"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
							<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
						</svg>
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Personal Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Personal Information</h3>
						
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Your Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									placeholder="Enter your name"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									AI Assistant Name
								</label>
								<input
									type="text"
									name="aiName"
									value={formData.aiName}
									onChange={handleInputChange}
									placeholder="E.g., Sudarshan AI, My Tutor"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Class/Grade
							</label>
							<input
								type="text"
								name="class"
								value={formData.class}
								onChange={handleInputChange}
								placeholder="E.g., 10th, 12th, College"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>
					</div>

					{/* School Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">School/Institution</h3>
						
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Name
								</label>
								<input
									type="text"
									name="school.name"
									value={formData.school.name}
									onChange={handleInputChange}
									placeholder="Your school name"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Location
								</label>
								<input
									type="text"
									name="school.location"
									value={formData.school.location}
									onChange={handleInputChange}
									placeholder="City, State"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Class Teacher
							</label>
							<input
								type="text"
								name="classTeacher"
								value={formData.classTeacher}
								onChange={handleInputChange}
								placeholder="Teacher's name"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>
					</div>

					{/* Interests */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Interests & Hobbies</h3>
						
						<div className="flex gap-2">
							<input
								type="text"
								value={interestInput}
								onChange={(e) => setInterestInput(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
								placeholder="Add an interest (e.g., Science, Sports)"
								className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
							<button
								type="button"
								onClick={handleAddInterest}
								className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
							>
								Add
							</button>
						</div>

						{formData.interests.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{formData.interests.map((interest, index) => (
									<span
										key={index}
										className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
									>
										{interest}
										<button
											type="button"
											onClick={() => handleRemoveInterest(interest)}
											className="hover:text-indigo-900 dark:hover:text-indigo-100"
										>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
												<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
											</svg>
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					{/* Additional Info */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Additional Information</h3>
						
						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Usual Sleep Time
							</label>
							<input
								type="text"
								name="sleepTime"
								value={formData.sleepTime}
								onChange={handleInputChange}
								placeholder="E.g., 10:00 PM"
								className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 rounded-lg border-2 border-zinc-300 px-4 py-2.5 font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
						>
							{initialData ? "Cancel" : "Skip for Now"}
						</button>
						<button
							type="submit"
							className="flex-1 rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-600"
						>
							{initialData ? "Update Profile" : "Create Profile"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
