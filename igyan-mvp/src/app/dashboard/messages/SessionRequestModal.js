"use client";

import { useState } from "react";
import { supabase } from "@/app/utils/supabase";

export default function SessionRequestModal({ mentorUser, studentUserId, onClose }) {
	const [formData, setFormData] = useState({
		request_title: "",
		request_message: "",
		requested_start_time: "",
		requested_end_time: "",
		meeting_mode: "online",
		meeting_link: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setMessage({ type: "", text: "" });

		try {
			// Validate dates
			const startTime = new Date(formData.requested_start_time);
			const endTime = new Date(formData.requested_end_time);
			const now = new Date();

			if (startTime < now) {
				setMessage({
					type: "error",
					text: "Start time must be in the future",
				});
				setSubmitting(false);
				return;
			}

			if (endTime <= startTime) {
				setMessage({
					type: "error",
					text: "End time must be after start time",
				});
				setSubmitting(false);
				return;
			}

			// Create session request
			const { data, error } = await supabase
				.from("session_requests")
				.insert([
					{
						student_user_id: studentUserId,
						mentor_user_id: mentorUser.id,
						request_title: formData.request_title,
						request_message: formData.request_message,
						requested_start_time: formData.requested_start_time,
						requested_end_time: formData.requested_end_time,
						meeting_mode: formData.meeting_mode,
						meeting_link:
							formData.meeting_mode === "online" ? formData.meeting_link : null,
						status: "pending",
					},
				])
				.select()
				.single();

			if (error) throw error;

			setMessage({
				type: "success",
				text: "Session request sent successfully!",
			});

			setTimeout(() => {
				onClose();
			}, 2000);
		} catch (error) {
			console.error("Error creating session request:", error);
			setMessage({
				type: "error",
				text: "Failed to send session request. Please try again.",
			});
		} finally {
			setSubmitting(false);
		}
	};

	// Get current date-time in the format required for datetime-local input
	const getCurrentDateTime = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const hours = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-xl">
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
					<div>
						<h2 className="text-2xl font-bold text-zinc-900">
							Request Session
						</h2>
						<p className="mt-1 text-sm text-zinc-600">
							with {mentorUser.full_name}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-6 w-6"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				{/* Message Alert */}
				{message.text && (
					<div
						className={`mx-6 mt-4 rounded-xl border p-4 ${
							message.type === "success"
								? "border-green-200 bg-green-50 text-green-800"
								: "border-red-200 bg-red-50 text-red-800"
						}`}
					>
						<p className="text-sm font-medium">{message.text}</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6">
					<div className="space-y-6">
						{/* Request Title */}
						<div>
							<label className="block text-sm font-semibold text-zinc-700">
								Session Title <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="request_title"
								value={formData.request_title}
								onChange={handleInputChange}
								required
								placeholder="e.g., Career Guidance Session, Project Review"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
						</div>

						{/* Request Message */}
						<div>
							<label className="block text-sm font-semibold text-zinc-700">
								Message <span className="text-red-500">*</span>
							</label>
							<textarea
								name="request_message"
								value={formData.request_message}
								onChange={handleInputChange}
								required
								rows="4"
								placeholder="Explain what you'd like to discuss during the session..."
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
						</div>

						{/* Date and Time */}
						<div className="grid gap-6 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-semibold text-zinc-700">
									Start Time <span className="text-red-500">*</span>
								</label>
								<input
									type="datetime-local"
									name="requested_start_time"
									value={formData.requested_start_time}
									onChange={handleInputChange}
									required
									min={getCurrentDateTime()}
									className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-zinc-700">
									End Time <span className="text-red-500">*</span>
								</label>
								<input
									type="datetime-local"
									name="requested_end_time"
									value={formData.requested_end_time}
									onChange={handleInputChange}
									required
									min={formData.requested_start_time || getCurrentDateTime()}
									className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
								/>
							</div>
						</div>

						{/* Meeting Mode */}
						<div>
							<label className="block text-sm font-semibold text-zinc-700">
								Meeting Mode <span className="text-red-500">*</span>
							</label>
							<div className="mt-2 grid grid-cols-2 gap-4">
								<button
									type="button"
									onClick={() =>
										setFormData((prev) => ({
											...prev,
											meeting_mode: "online",
										}))
									}
									className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
										formData.meeting_mode === "online"
											? "border-indigo-600 bg-indigo-50 text-indigo-700"
											: "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
									}`}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="h-5 w-5"
									>
										<rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
										<polyline points="17 2 12 7 7 2" />
									</svg>
									Online
								</button>
								<button
									type="button"
									onClick={() =>
										setFormData((prev) => ({
											...prev,
											meeting_mode: "offline",
											meeting_link: "",
										}))
									}
									className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
										formData.meeting_mode === "offline"
											? "border-indigo-600 bg-indigo-50 text-indigo-700"
											: "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
									}`}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="h-5 w-5"
									>
										<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
										<circle cx="12" cy="10" r="3" />
									</svg>
									Offline
								</button>
							</div>
						</div>

						{/* Meeting Link (only for online) */}
						{formData.meeting_mode === "online" && (
							<div>
								<label className="block text-sm font-semibold text-zinc-700">
									Meeting Link (Optional)
								</label>
								<input
									type="url"
									name="meeting_link"
									value={formData.meeting_link}
									onChange={handleInputChange}
									placeholder="https://meet.google.com/..."
									className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
								/>
								<p className="mt-2 text-xs text-zinc-500">
									You can add the meeting link now or wait for the mentor to provide
									one
								</p>
							</div>
						)}

						{/* Info Box */}
						<div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
							<div className="flex gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="h-5 w-5 flex-shrink-0 text-blue-600"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="16" x2="12" y2="12" />
									<line x1="12" y1="8" x2="12.01" y2="8" />
								</svg>
								<div className="text-sm text-blue-800">
									<p className="font-semibold">Note:</p>
									<p className="mt-1">
										Your session request will be sent to {mentorUser.full_name}.
										They will review and respond to your request.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="mt-8 flex gap-3">
						<button
							type="submit"
							disabled={submitting}
							className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
						>
							{submitting ? "Sending Request..." : "Send Request"}
						</button>
						<button
							type="button"
							onClick={onClose}
							disabled={submitting}
							className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
