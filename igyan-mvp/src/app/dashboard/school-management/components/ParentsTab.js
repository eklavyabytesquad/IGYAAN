"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import {
	Modal, Badge, StatCard,
	inputClass, labelClass, cardClass,
	btnPrimary, btnSecondary, btnDanger, btnGhost,
	thClass, tdClass, tdBold, emptyClass,
	alertSuccess, alertError,
} from "./shared";

export default function ParentsTab({ schoolId, students, userId, onRefresh }) {
	const [parents, setParents] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showAddParent, setShowAddParent] = useState(false);
	const [showAssign, setShowAssign] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const [parentForm, setParentForm] = useState({
		full_name: "", email: "", phone: "", password: "",
	});
	const [assignForm, setAssignForm] = useState({
		parent_id: "", student_id: "", relationship: "parent", is_primary: true,
	});

	useEffect(() => {
		if (schoolId) { fetchParents(); fetchAssignments(); }
	}, [schoolId]);

	const fetchParents = async () => {
		setLoading(true);
		try {
			const { data } = await supabase
				.from("users")
				.select("id, full_name, email, phone, created_at")
				.eq("school_id", schoolId)
				.eq("role", "parent")
				.order("full_name");
			setParents(data || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const fetchAssignments = async () => {
		try {
			const { data } = await supabase
				.from("parent_student_assignments")
				.select("*, parent:parent_id(id, full_name, email, phone), student:student_id(id, full_name, email)")
				.eq("school_id", schoolId)
				.order("created_at", { ascending: false });
			setAssignments(data || []);
		} catch (err) {
			console.error(err);
		}
	};

	const hashPassword = async (password) => {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	};

	const sendOnboardingWhatsApp = async ({ phone, schoolName, fullName, email, password }) => {
		if (!phone) return;
		try {
			const receiver = phone.replace(/[^0-9]/g, "");
			const formattedReceiver = receiver.startsWith("91") ? receiver : "91" + receiver;
			await fetch("https://adminapis.backendprod.com/lms_campaign/api/whatsapp/template/0k3sr52fte/process", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					receiver: formattedReceiver,
					values: {
						"1": schoolName || "Your School",
						"2": fullName || "User",
						"3": email || "",
						"4": `password : "${password}"`,
					},
				}),
			});
			console.log("WhatsApp onboarding sent to", formattedReceiver);
		} catch (err) {
			console.error("Failed to send WhatsApp onboarding:", err);
		}
	};

	const getSchoolName = async () => {
		try {
			const { data } = await supabase.from("schools").select("school_name").eq("id", schoolId).single();
			return data?.school_name || "";
		} catch { return ""; }
	};

	const handleAddParent = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");
		try {
			const passwordHash = await hashPassword(parentForm.password);
			const { error: err } = await supabase.from("users").insert([{
				email: parentForm.email.trim().toLowerCase(),
				password_hash: passwordHash,
				full_name: parentForm.full_name.trim(),
				phone: parentForm.phone || null,
				school_id: schoolId,
				role: "parent",
			}]);
			if (err) throw err;

			// Send WhatsApp onboarding notification
			const schoolName = await getSchoolName();
			await sendOnboardingWhatsApp({
				phone: parentForm.phone,
				schoolName,
				fullName: parentForm.full_name.trim(),
				email: parentForm.email.trim().toLowerCase(),
				password: parentForm.password,
			});

			setSuccess(`Parent "${parentForm.full_name}" created successfully!`);
			setParentForm({ full_name: "", email: "", phone: "", password: "" });
			setShowAddParent(false);
			fetchParents();
			if (onRefresh) onRefresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleAssign = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");
		try {
			const { error: err } = await supabase.from("parent_student_assignments").insert([{
				school_id: schoolId,
				parent_id: assignForm.parent_id,
				student_id: assignForm.student_id,
				relationship: assignForm.relationship,
				is_primary: assignForm.is_primary,
				created_by: userId,
			}]);
			if (err) {
				if (err.message.includes("duplicate") || err.message.includes("unique")) {
					throw new Error("This parent is already assigned to this student.");
				}
				throw err;
			}
			setSuccess("Parent assigned to student successfully!");
			setAssignForm({ parent_id: "", student_id: "", relationship: "parent", is_primary: true });
			setShowAssign(false);
			fetchAssignments();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleRemoveAssignment = async (id) => {
		if (!confirm("Remove this parent-student assignment?")) return;
		await supabase.from("parent_student_assignments").delete().eq("id", id);
		fetchAssignments();
	};

	const handleDeleteParent = async (parentId) => {
		if (!confirm("Delete this parent account? This will also remove all their student assignments.")) return;
		try {
			await supabase.from("parent_student_assignments").delete().eq("parent_id", parentId);
			await supabase.from("users").delete().eq("id", parentId);
			fetchParents();
			fetchAssignments();
		} catch (err) {
			console.error(err);
		}
	};

	const getStudentCount = (parentId) => assignments.filter((a) => a.parent_id === parentId).length;

	const filtered = parents.filter((p) =>
		p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Parents & Guardians</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Register parents and link them to students</p>
				</div>
				<div className="flex gap-2">
					<button onClick={() => { setShowAddParent(true); setError(""); }} className={btnPrimary}>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
						Add Parent
					</button>
					<button onClick={() => { setShowAssign(true); setError(""); }} className={btnSecondary}>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" /></svg>
						Assign to Student
					</button>
				</div>
			</div>

			{success && <div className={alertSuccess}><span>✓</span> {success}</div>}
			{error && !showAddParent && !showAssign && <div className={alertError}><span>⚠</span> {error}</div>}

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<StatCard icon="👨‍👩‍👦" label="Total Parents" value={parents.length} color="indigo" />
				<StatCard icon="🔗" label="Assignments" value={assignments.length} color="purple" />
				<StatCard icon="⭐" label="Primary Contacts" value={assignments.filter((a) => a.is_primary).length} color="amber" />
				<StatCard icon="🎓" label="Students Linked" value={[...new Set(assignments.map((a) => a.student_id))].length} color="emerald" />
			</div>

			{/* Search */}
			<div className="relative">
				<svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
				<input
					type="text"
					placeholder="Search parents by name or email..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
				/>
			</div>

			{/* Parents Table */}
			<div className={cardClass + " p-0! overflow-hidden"}>
				<div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Registered Parents <Badge color="indigo">{parents.length}</Badge></h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30">
							<tr>
								<th className={thClass}>#</th>
								<th className={thClass}>Parent</th>
								<th className={thClass}>Phone</th>
								<th className={thClass}>Children Linked</th>
								<th className={thClass}>Registered</th>
								<th className={thClass + " text-right"}>Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{loading ? (
								<tr><td colSpan={6} className={emptyClass}>
									<div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
								</td></tr>
							) : filtered.length === 0 ? (
								<tr><td colSpan={6} className={emptyClass}>
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">👨‍👩‍👦</div>
									{searchQuery ? "No parents match your search." : "No parents registered yet. Click \"Add Parent\" to get started."}
								</td></tr>
							) : filtered.map((p, i) => (
								<tr key={p.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
									<td className={tdClass + " text-zinc-400 font-mono text-xs"}>{i + 1}</td>
									<td className={tdBold}>
										<div className="flex items-center gap-3">
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-400 to-pink-500 text-xs font-bold text-white">
												{p.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
											</div>
											<div>
												<p className="font-medium text-zinc-900 dark:text-white">{p.full_name}</p>
												<p className="text-xs text-zinc-400">{p.email}</p>
											</div>
										</div>
									</td>
									<td className={tdClass}>{p.phone || "—"}</td>
									<td className={tdClass}>
										{getStudentCount(p.id) > 0 ? (
											<Badge color="green">{getStudentCount(p.id)} student{getStudentCount(p.id) > 1 ? "s" : ""}</Badge>
										) : (
											<Badge color="zinc">None</Badge>
										)}
									</td>
									<td className={tdClass + " text-xs"}>{new Date(p.created_at).toLocaleDateString()}</td>
									<td className={tdClass + " text-right"}>
										<div className="flex items-center justify-end gap-1">
											<button onClick={() => { setAssignForm({ ...assignForm, parent_id: p.id }); setShowAssign(true); setError(""); }} className={btnGhost}>Link Student</button>
											<button onClick={() => handleDeleteParent(p.id)} className={btnDanger}>Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Assignments Table */}
			<div className={cardClass + " p-0! overflow-hidden"}>
				<div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Parent ↔ Student Assignments <Badge color="purple">{assignments.length}</Badge></h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30">
							<tr>
								<th className={thClass}>Parent</th>
								<th className={thClass}>Student</th>
								<th className={thClass}>Relationship</th>
								<th className={thClass}>Primary</th>
								<th className={thClass}>Assigned On</th>
								<th className={thClass + " text-right"}>Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{assignments.length === 0 ? (
								<tr><td colSpan={6} className={emptyClass}>
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">🔗</div>
									No parent-student assignments yet.
								</td></tr>
							) : assignments.map((a) => (
								<tr key={a.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
									<td className={tdBold}>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
												{a.parent?.full_name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
											</div>
											<div>
												<p className="text-sm font-medium text-zinc-900 dark:text-white">{a.parent?.full_name}</p>
												<p className="text-xs text-zinc-400">{a.parent?.email}</p>
											</div>
										</div>
									</td>
									<td className={tdBold}>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
												{a.student?.full_name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
											</div>
											<div>
												<p className="text-sm font-medium text-zinc-900 dark:text-white">{a.student?.full_name}</p>
												<p className="text-xs text-zinc-400">{a.student?.email}</p>
											</div>
										</div>
									</td>
									<td className={tdClass}>
										<Badge color="blue">{a.relationship}</Badge>
									</td>
									<td className={tdClass}>
										<Badge color={a.is_primary ? "green" : "zinc"}>{a.is_primary ? "Primary" : "Secondary"}</Badge>
									</td>
									<td className={tdClass + " text-xs"}>{new Date(a.created_at).toLocaleDateString()}</td>
									<td className={tdClass + " text-right"}>
										<button onClick={() => handleRemoveAssignment(a.id)} className={btnDanger}>Remove</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add Parent Modal */}
			<Modal open={showAddParent} onClose={() => { setShowAddParent(false); setError(""); }} title="Register New Parent">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleAddParent} className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
							<input type="text" placeholder="Parent's full name" value={parentForm.full_name} onChange={(e) => setParentForm({ ...parentForm, full_name: e.target.value })} className={inputClass} required />
						</div>
						<div>
							<label className={labelClass}>Email <span className="text-red-500">*</span></label>
							<input type="email" placeholder="parent@email.com" value={parentForm.email} onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })} className={inputClass} required />
						</div>
						<div>
							<label className={labelClass}>Phone</label>
							<input type="text" placeholder="+91 XXXXX XXXXX" value={parentForm.phone} onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })} className={inputClass} />
						</div>
						<div>
							<label className={labelClass}>Password <span className="text-red-500">*</span></label>
							<input type="password" placeholder="Min 6 characters" value={parentForm.password} onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })} className={inputClass} required minLength={6} />
						</div>
					</div>
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowAddParent(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Creating..." : "Register Parent"}</button>
					</div>
				</form>
			</Modal>

			{/* Assign Parent to Student Modal */}
			<Modal open={showAssign} onClose={() => { setShowAssign(false); setError(""); }} title="Assign Parent to Student">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleAssign} className="space-y-4">
					<div>
						<label className={labelClass}>Parent <span className="text-red-500">*</span></label>
						<select value={assignForm.parent_id} onChange={(e) => setAssignForm({ ...assignForm, parent_id: e.target.value })} className={inputClass} required>
							<option value="">-- Select Parent --</option>
							{parents.map((p) => <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>)}
						</select>
					</div>
					<div>
						<label className={labelClass}>Student <span className="text-red-500">*</span></label>
						<select value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} className={inputClass} required>
							<option value="">-- Select Student --</option>
							{students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
						</select>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className={labelClass}>Relationship</label>
							<select value={assignForm.relationship} onChange={(e) => setAssignForm({ ...assignForm, relationship: e.target.value })} className={inputClass}>
								<option value="parent">Parent</option>
								<option value="father">Father</option>
								<option value="mother">Mother</option>
								<option value="guardian">Guardian</option>
								<option value="grandparent">Grandparent</option>
								<option value="other">Other</option>
							</select>
						</div>
						<div>
							<label className={labelClass}>Contact Priority</label>
							<select value={assignForm.is_primary ? "true" : "false"} onChange={(e) => setAssignForm({ ...assignForm, is_primary: e.target.value === "true" })} className={inputClass}>
								<option value="true">Primary Contact</option>
								<option value="false">Secondary Contact</option>
							</select>
						</div>
					</div>
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowAssign(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Assigning..." : "Assign Parent"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
