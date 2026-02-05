"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import Link from "next/link";

export default function StudentRequestsPanel({ studentUserId, onClose }) {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");
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
					mentor:mentor_user_id (
						id,
						full_name,
						email,
						image_base64
					)
				`)
				.eq("student_user_id", studentUserId)
				.order("created_at", { ascending: false });

			if (filter !== "all") {
				query = query.eq("status", filter);
			}

			const { data, error } = await query;

			if (error) throw error;
			setRequests(data || []);
			
			// Mark all as viewed
			await supabase
				.from("session_requests")
				.update({ student_viewed: true })
				.eq("student_user_id", studentUserId)
				.is("student_viewed", null);
				
		} catch (error) {
			console.error("Error fetching requests:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancelRequest = async (requestId) => {
		if (!confirm("Are you sure you want to cancel this request?")) return;

		try {
			const { error } = await supabase
				.from("session_requests")
				.update({ status: "cancelled", updated_at: new Date().toISOString() })
				.eq("id", requestId);

			if (error) throw error;
			fetchRequests();
			setSelectedRequest(null);
		} catch (error) {
			console.error("Error cancelling request:", error);
			alert("Failed to cancel request. Please try again.");
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
								My Requests
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
							{ value: "all", label: "All Requests", icon: "📋" },
							{ value: "pending", label: "Pending", icon: "⏳" },
							{ value: "accepted", label: "Accepted", icon: "✅" },
							{ value: "rejected", label: "Rejected", icon: "❌" },
							{ value: "cancelled", label: "Cancelled", icon: "🚫" },
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
									{filter === "all"
										? "You haven't sent any session requests yet"
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
						onCancel={handleCancelRequest}
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
					{request.mentor?.image_base64 ? (
						<img
							src={request.mentor.image_base64}
							alt={request.mentor.full_name}
							className="h-12 w-12 rounded-full border-2 border-zinc-200 object-cover"
						/>
					) : (
						<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-zinc-200 bg-indigo-600 text-sm font-bold text-white">
							{request.mentor?.full_name
								?.split(" ")
								.map((n) => n[0])
								.join("")
								.toUpperCase() || "?"}
						</div>
					)}
					<div className="flex-1">
						<h4 className="font-semibold text-zinc-900">
							{request.mentor?.full_name}
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

function RequestDetailsPanel({ request, onClose, onCancel }) {
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
					{/* Mentor Info */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Mentor
						</p>
						<div className="flex items-center gap-3">
							{request.mentor?.image_base64 ? (
								<img
									src={request.mentor.image_base64}
									alt={request.mentor.full_name}
									className="h-12 w-12 rounded-full border-2 border-zinc-200 object-cover"
								/>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
									{request.mentor?.full_name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "?"}
								</div>
							)}
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<p className="font-semibold text-zinc-900">
										{request.mentor?.full_name}
									</p>
									<Link
										href={`/about/${request.mentor?.id}`}
										target="_blank"
										className="text-indigo-600 hover:text-indigo-700"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="h-4 w-4"
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
										</svg>
									</Link>
								</div>
								<p className="text-sm text-zinc-600">{request.mentor?.email}</p>
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

					{/* Your Message */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Your Message
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

					{/* Status */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Status
						</p>
						<div className="flex items-center gap-2">
							{request.status === "pending" && (
								<span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
									⏳ Waiting for Response
								</span>
							)}
							{request.status === "accepted" && (
								<span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
									✅ Accepted
								</span>
							)}
							{request.status === "rejected" && (
								<span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
									❌ Rejected
								</span>
							)}
							{request.status === "cancelled" && (
								<span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-800">
									🚫 Cancelled
								</span>
							)}
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
					{request.meeting_link && request.status === "accepted" && (
						<div>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Meeting Link
							</p>
							<a
								href={request.meeting_link}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="h-4 w-4"
								>
									<rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
									<polyline points="17 2 12 7 7 2" />
								</svg>
								Join Meeting
							</a>
						</div>
					)}

					{/* Mentor Response */}
					{request.mentor_response && (
						<div>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Mentor's Response
							</p>
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
								<p className="whitespace-pre-wrap text-sm text-zinc-700">
									{request.mentor_response}
								</p>
							</div>
						</div>
					)}

					{/* Actions */}
					{request.status === "pending" && (
						<button
							type="button"
							onClick={() => onCancel(request.id)}
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
							Cancel Request
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
