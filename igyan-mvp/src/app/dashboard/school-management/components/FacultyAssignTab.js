"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Modal, Badge, StatCard, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, btnDanger, thClass, tdClass, tdBold, emptyClass, alertError } from "./shared";

export default function FacultyAssignTab({ schoolId, session, classes, subjects, faculty, onRefresh }) {
	const [assignments, setAssignments] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState({ faculty_id: "", class_id: "", subject_id: "", assignment_type: "subject_teacher" });

	useEffect(() => {
		if (session) fetchAssignments();
	}, [session]);

	const fetchAssignments = async () => {
		if (!session) return;
		const { data } = await supabase
			.from("faculty_assignments")
			.select("*, users:faculty_id(id, full_name, email), classes:class_id(class_name, section), subjects:subject_id(subject_name)")
			.eq("school_id", schoolId)
			.eq("session_id", session.id)
			.eq("is_active", true)
			.order("created_at", { ascending: false });
		setAssignments(data || []);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!session) { setError("No active session"); return; }
		setSaving(true);
		setError("");
		try {
			const payload = {
				school_id: schoolId,
				faculty_id: form.faculty_id,
				class_id: form.class_id,
				session_id: session.id,
				assignment_type: form.assignment_type,
				subject_id: form.assignment_type === "subject_teacher" ? form.subject_id : null,
			};

			if (form.assignment_type === "class_teacher") {
				const { data: existing } = await supabase
					.from("faculty_assignments").select("id")
					.eq("class_id", form.class_id).eq("session_id", session.id)
					.eq("assignment_type", "class_teacher").eq("is_active", true).maybeSingle();
				if (existing) { setError("This class already has a class teacher"); setSaving(false); return; }
			}

			const { error: err } = await supabase.from("faculty_assignments").insert([payload]);
			if (err) throw err;
			setForm({ faculty_id: "", class_id: "", subject_id: "", assignment_type: "subject_teacher" });
			setShowModal(false);
			fetchAssignments();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleRemove = async (id) => {
		if (!confirm("Remove this assignment?")) return;
		await supabase.from("faculty_assignments").update({ is_active: false }).eq("id", id);
		fetchAssignments();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Faculty Assignments</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Assign teachers to classes and subjects</p>
				</div>
				<button onClick={() => setShowModal(true)} className={btnPrimary}>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
					Assign Faculty
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<StatCard icon="👨‍🏫" label="Total Assignments" value={assignments.length} color="indigo" />
				<StatCard icon="🎯" label="Class Teachers" value={assignments.filter((a) => a.assignment_type === "class_teacher").length} color="purple" />
				<StatCard icon="📖" label="Subject Teachers" value={assignments.filter((a) => a.assignment_type === "subject_teacher").length} color="sky" />
			</div>

			<div className={cardClass + " p-0! overflow-hidden"}>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
							<tr>
								<th className={thClass}>Faculty</th>
								<th className={thClass}>Class</th>
								<th className={thClass}>Role</th>
								<th className={thClass}>Subject</th>
								<th className={thClass + " text-right"}>Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{assignments.map((a) => (
								<tr key={a.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
									<td className={tdBold}>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
												{a.users?.full_name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
											</div>
											{a.users?.full_name}
										</div>
									</td>
									<td className={tdClass}>{a.classes?.class_name} - {a.classes?.section}</td>
									<td className={tdClass}>
										<Badge color={a.assignment_type === "class_teacher" ? "purple" : "blue"}>
											{a.assignment_type === "class_teacher" ? "Class Teacher" : "Subject Teacher"}
										</Badge>
									</td>
									<td className={tdClass}>{a.subjects?.subject_name || "—"}</td>
									<td className={tdClass + " text-right"}>
										<button onClick={() => handleRemove(a.id)} className={btnDanger}>Remove</button>
									</td>
								</tr>
							))}
							{assignments.length === 0 && (
								<tr><td colSpan={5} className={emptyClass}>
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">👨‍🏫</div>
									No faculty assignments yet.
								</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<Modal open={showModal} onClose={() => { setShowModal(false); setError(""); }} title="Assign Faculty">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className={labelClass}>Faculty <span className="text-red-500">*</span></label>
							<select value={form.faculty_id} onChange={(e) => setForm({ ...form, faculty_id: e.target.value })} className={inputClass} required>
								<option value="">Select Faculty</option>
								{faculty.map((f) => <option key={f.id} value={f.id}>{f.full_name}</option>)}
							</select>
						</div>
						<div>
							<label className={labelClass}>Class <span className="text-red-500">*</span></label>
							<select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className={inputClass} required>
								<option value="">Select Class</option>
								{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
							</select>
						</div>
					</div>
					<div>
						<label className={labelClass}>Assignment Type <span className="text-red-500">*</span></label>
						<select value={form.assignment_type} onChange={(e) => setForm({ ...form, assignment_type: e.target.value })} className={inputClass}>
							<option value="subject_teacher">Subject Teacher</option>
							<option value="class_teacher">Class Teacher</option>
						</select>
					</div>
					{form.assignment_type === "subject_teacher" && (
						<div>
							<label className={labelClass}>Subject <span className="text-red-500">*</span></label>
							<select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className={inputClass} required>
								<option value="">Select Subject</option>
								{subjects.filter((s) => s.is_active).map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
							</select>
						</div>
					)}
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving..." : "Assign"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
