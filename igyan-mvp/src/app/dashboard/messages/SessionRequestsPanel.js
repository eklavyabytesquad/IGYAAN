"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";

export default function SessionRequestsPanel({ mentorUserId, onClose }) {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("pending");
	const [selectedRequest, setSelectedRequest] = useState(null);

	useEffect(() => {
		fetchRequests();
	}, [filter]);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			let query = supabase
				.from("session_requests")
				.select(`
					*,
					student:student_user_id (
						id,
						full_name,
						email,
						image_base64
					)
				`)
				.eq("mentor_user_id", mentorUserId)
				.order("created_at", { ascending: false });

			if (filter !== "all") {
				query = query.eq("status", filter);
			}

			const { data, error } = await query;

			if (error) throw error;
			setRequests(data || []);
		} catch (error) {
			console.error("Error fetching requests:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRequestAction = async (requestId, action, mentorResponse = "") => {
		try {
			const updateData = {
				status: action,
				mentor_response: mentorResponse,
				updated_at: new Date().toISOString(),
			};

			const { error } = await supabase
				.from("session_requests")
				.update(updateData)
				.eq("id", requestId);

			if (error) throw error;

			// Refresh requests
			fetchRequests();
			setSelectedRequest(null);
		} catch (error) {
			console.error("Error updating request:", error);
			alert("Failed to update request. Please try again.");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
				{/* Sidebar */}
				<div className="w-80 border-r border-zinc-200 bg-zinc-50">
					<div className="sticky top-0 border-b border-zinc-200 bg-white p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-bold text-zinc-900">
								Session Requests
							</h2>
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
									className="h-5 w-5"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
					</div>

					{/* Filters */}
					<div className="space-y-1 p-4">
						{[
							{ value: "pending", label: "Pending", icon: "⏳" },
							{ value: "accepted", label: "Accepted", icon: "✅" },
							{ value: "rejected", label: "Rejected", icon: "❌" },
							{ value: "all", label: "All Requests", icon: "📋" },
						].map((filterOption) => (
							<button
								key={filterOption.value}
								type="button"
								onClick={() => {
									setFilter(filterOption.value);
									setSelectedRequest(null);
								}}
								className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
									filter === filterOption.value
										? "bg-indigo-50 text-indigo-700"
										: "text-zinc-700 hover:bg-zinc-100"
								}`}
							>
								<span className="text-lg">{filterOption.icon}</span>
								{filterOption.label}
								<span
									className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
										filter === filterOption.value
											? "bg-indigo-100 text-indigo-700"
											: "bg-zinc-200 text-zinc-600"
									}`}
								>
									{filterOption.value === "all"
										? requests.length
										: requests.filter((r) => r.status === filterOption.value)
												.length}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Main Content */}
				<div className="flex flex-1 flex-col">
					{loading ? (
						<div className="flex flex-1 items-center justify-center">
							<div className="text-center">
								<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
								<p className="mt-4 text-sm text-zinc-600">Loading requests...</p>
							</div>
						</div>
					) : requests.length === 0 ? (
						<div className="flex flex-1 items-center justify-center">
							<div className="text-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="mx-auto h-16 w-16 text-zinc-400"
								>
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
									<line x1="16" y1="2" x2="16" y2="6" />
									<line x1="8" y1="2" x2="8" y2="6" />
									<line x1="3" y1="10" x2="21" y2="10" />
								</svg>
								<h3 className="mt-4 text-lg font-semibold text-zinc-900">
									No Requests Found
								</h3>
								<p className="mt-2 text-sm text-zinc-600">
									{filter === "pending"
										? "You don't have any pending session requests"
										: `No ${filter} requests at the moment`}
								</p>
							</div>
						</div>
					) : (
						<div className="flex-1 overflow-y-auto p-6">
							<div className="space-y-4">
								{requests.map((request) => (
									<RequestCard
										key={request.id}
										request={request}
										onSelect={() => setSelectedRequest(request)}
										isSelected={selectedRequest?.id === request.id}
									/>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Request Details Panel */}
				{selectedRequest && (
					<RequestDetailsPanel
						request={selectedRequest}
						onClose={() => setSelectedRequest(null)}
						onAction={handleRequestAction}
					/>
				)}
			</div>
		</div>
	);
}

function RequestCard({ request, onSelect, isSelected }) {
	const statusColors = {
		pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
		accepted: "bg-green-100 text-green-800 border-green-200",
		rejected: "bg-red-100 text-red-800 border-red-200",
		cancelled: "bg-zinc-100 text-zinc-800 border-zinc-200",
		expired: "bg-orange-100 text-orange-800 border-orange-200",
	};

	const formatDateTime = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`w-full rounded-xl border-2 bg-white p-4 text-left transition-all hover:shadow-md ${
				isSelected ? "border-indigo-500 shadow-md" : "border-zinc-200"
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex gap-3">
					{request.student?.image_base64 ? (
						<img
							src={request.student.image_base64}
							alt={request.student.full_name}
							className="h-12 w-12 rounded-full border-2 border-zinc-200 object-cover"
						/>
					) : (
						<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-zinc-200 bg-indigo-600 text-sm font-bold text-white">
							{request.student?.full_name
								?.split(" ")
								.map((n) => n[0])
								.join("")
								.toUpperCase() || "?"}
						</div>
					)}
					<div className="flex-1">
						<h4 className="font-semibold text-zinc-900">
							{request.student?.full_name}
						</h4>
						<p className="text-sm text-zinc-600">{request.request_title}</p>
						<p className="mt-1 text-xs text-zinc-500">
							{formatDateTime(request.requested_start_time)}
						</p>
					</div>
				</div>
				<span
					className={`rounded-full border px-3 py-1 text-xs font-semibold ${
						statusColors[request.status]
					}`}
				>
					{request.status}
				</span>
			</div>
		</button>
	);
}

function RequestDetailsPanel({ request, onClose, onAction }) {
	const [showResponseForm, setShowResponseForm] = useState(false);
	const [action, setAction] = useState("");
	const [mentorResponse, setMentorResponse] = useState("");
	const [meetingLink, setMeetingLink] = useState(request.meeting_link || "");

	const formatDateTime = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleSubmit = () => {
		if (action === "accepted" && request.meeting_mode === "online" && !meetingLink) {
			alert("Please provide a meeting link for online sessions");
			return;
		}

		// Update meeting link if provided
		if (action === "accepted" && meetingLink) {
			supabase
				.from("session_requests")
				.update({ meeting_link: meetingLink })
				.eq("id", request.id)
				.then(() => {
					onAction(request.id, action, mentorResponse);
				});
		} else {
			onAction(request.id, action, mentorResponse);
		}
	};

	return (
		<div className="flex w-96 flex-col border-l border-zinc-200 bg-white">
			<div className="flex-shrink-0 flex items-center justify-between border-b border-zinc-200 bg-white p-4">
				<h3 className="font-semibold text-zinc-900">Request Details</h3>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="h-5 w-5"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-6">
					{/* Student Info */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Student
						</p>
						<div className="flex items-center gap-3">
							{request.student?.image_base64 ? (
								<img
									src={request.student.image_base64}
									alt={request.student.full_name}
									className="h-12 w-12 rounded-full border-2 border-zinc-200 object-cover"
								/>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
									{request.student?.full_name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "?"}
								</div>
							)}
							<div>
								<p className="font-semibold text-zinc-900">
									{request.student?.full_name}
								</p>
								<p className="text-sm text-zinc-600">{request.student?.email}</p>
							</div>
						</div>
					</div>

					{/* Session Title */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Session Title
						</p>
						<p className="font-medium text-zinc-900">{request.request_title}</p>
					</div>

					{/* Message */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Student's Message
						</p>
						<p className="whitespace-pre-wrap text-sm text-zinc-700">
							{request.request_message}
						</p>
					</div>

					{/* Schedule */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Requested Schedule
						</p>
						<div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
							<div className="flex items-center gap-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="h-4 w-4 text-zinc-500"
								>
									<circle cx="12" cy="12" r="10" />
									<polyline points="12 6 12 12 16 14" />
								</svg>
								<span className="font-medium text-zinc-900">Start:</span>
								<span className="text-zinc-700">
									{formatDateTime(request.requested_start_time)}
								</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="h-4 w-4 text-zinc-500"
								>
									<circle cx="12" cy="12" r="10" />
									<polyline points="12 6 12 12 16 14" />
								</svg>
								<span className="font-medium text-zinc-900">End:</span>
								<span className="text-zinc-700">
									{formatDateTime(request.requested_end_time)}
								</span>
							</div>
						</div>
					</div>

					{/* Meeting Mode */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Meeting Mode
						</p>
						<div className="flex items-center gap-2">
							{request.meeting_mode === "online" ? (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="h-5 w-5 text-indigo-600"
									>
										<rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
										<polyline points="17 2 12 7 7 2" />
									</svg>
									<span className="font-medium text-zinc-900">Online</span>
								</>
							) : (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="h-5 w-5 text-indigo-600"
									>
										<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
										<circle cx="12" cy="10" r="3" />
									</svg>
									<span className="font-medium text-zinc-900">Offline</span>
								</>
							)}
						</div>
					</div>

					{/* Meeting Link */}
					{request.meeting_link && (
						<div>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Meeting Link
							</p>
							<a
								href={request.meeting_link}
								target="_blank"
								rel="noopener noreferrer"
								className="break-all text-sm text-indigo-600 hover:text-indigo-700"
							>
								{request.meeting_link}
							</a>
						</div>
					)}

					{/* Mentor Response */}
					{request.mentor_response && (
						<div>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Your Response
							</p>
							<p className="whitespace-pre-wrap text-sm text-zinc-700">
								{request.mentor_response}
							</p>
						</div>
					)}

					{/* Actions */}
					{request.status === "pending" && !showResponseForm && (
						<div className="space-y-2">
							<button
								type="button"
								onClick={() => {
									setAction("accepted");
									setShowResponseForm(true);
								}}
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="h-5 w-5"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
								Accept Request
							</button>
							<button
								type="button"
								onClick={() => {
									setAction("rejected");
									setShowResponseForm(true);
								}}
								className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-600 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="h-5 w-5"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
								Reject Request
							</button>
						</div>
					)}

					{/* Response Form */}
					{showResponseForm && (
						<div className="space-y-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
							<h4 className="font-semibold text-zinc-900">
								{action === "accepted" ? "Accept Request" : "Reject Request"}
							</h4>

							{action === "accepted" && request.meeting_mode === "online" && (
								<div>
									<label className="block text-sm font-semibold text-zinc-700">
										Meeting Link <span className="text-red-500">*</span>
									</label>
									<input
										type="url"
										value={meetingLink}
										onChange={(e) => setMeetingLink(e.target.value)}
										placeholder="https://meet.google.com/..."
										className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
									/>
								</div>
							)}

							<div>
								<label className="block text-sm font-semibold text-zinc-700">
									Message to Student {action === "rejected" && <span className="text-red-500">*</span>}
								</label>
								<textarea
									value={mentorResponse}
									onChange={(e) => setMentorResponse(e.target.value)}
									placeholder={
										action === "accepted"
											? "Add any additional notes for the student..."
											: "Explain why you're rejecting this request..."
									}
									rows="4"
									className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
								/>
							</div>

							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleSubmit}
									className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
										action === "accepted"
											? "bg-green-600 hover:bg-green-700"
											: "bg-red-600 hover:bg-red-700"
									}`}
								>
									Confirm
								</button>
								<button
									type="button"
									onClick={() => {
										setShowResponseForm(false);
										setAction("");
										setMentorResponse("");
									}}
									className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
								>
									Cancel
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
