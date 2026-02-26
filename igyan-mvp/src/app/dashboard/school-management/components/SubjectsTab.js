"use client";

import { useState } from "react";
import { supabase } from "../../../utils/supabase";
import { Modal, Badge, StatCard, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, btnDanger, btnGhost, thClass, tdClass, tdBold, emptyClass, alertError } from "./shared";

export default function SubjectsTab({ schoolId, subjects, onRefresh }) {
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ subject_name: "", subject_code: "", description: "" });
	const [error, setError] = useState("");
	const [editingId, setEditingId] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		try {
			if (editingId) {
				const { error: err } = await supabase.from("subjects").update({
					subject_name: form.subject_name,
					subject_code: form.subject_code || null,
					description: form.description || null,
					updated_at: new Date().toISOString(),
				}).eq("id", editingId);
				if (err) throw err;
			} else {
				const { error: err } = await supabase.from("subjects").insert([{
					school_id: schoolId,
					subject_name: form.subject_name,
					subject_code: form.subject_code || null,
					description: form.description || null,
				}]);
				if (err) throw err;
			}
			setForm({ subject_name: "", subject_code: "", description: "" });
			setShowModal(false);
			setEditingId(null);
			onRefresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleEdit = (sub) => {
		setEditingId(sub.id);
		setForm({ subject_name: sub.subject_name, subject_code: sub.subject_code || "", description: sub.description || "" });
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		if (!confirm("Delete this subject?")) return;
		await supabase.from("subjects").delete().eq("id", id);
		onRefresh();
	};

	const handleToggleActive = async (id, current) => {
		await supabase.from("subjects").update({ is_active: !current, updated_at: new Date().toISOString() }).eq("id", id);
		onRefresh();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Subjects</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create and manage subject catalog</p>
				</div>
				<button onClick={() => { setShowModal(true); setEditingId(null); setForm({ subject_name: "", subject_code: "", description: "" }); }} className={btnPrimary}>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
					Add Subject
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<StatCard icon="📚" label="Total Subjects" value={subjects.length} color="indigo" />
				<StatCard icon="✅" label="Active" value={subjects.filter((s) => s.is_active).length} color="emerald" />
				<StatCard icon="⏸" label="Inactive" value={subjects.filter((s) => !s.is_active).length} color="amber" />
			</div>

			<div className={cardClass + " p-0! overflow-hidden"}>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
							<tr>
								<th className={thClass}>Subject Name</th>
								<th className={thClass}>Code</th>
								<th className={thClass}>Description</th>
								<th className={thClass}>Status</th>
								<th className={thClass + " text-right"}>Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{subjects.map((s) => (
								<tr key={s.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
									<td className={tdBold}>{s.subject_name}</td>
									<td className={tdClass}><Badge color="indigo">{s.subject_code || "—"}</Badge></td>
									<td className={tdClass + " max-w-xs truncate"}>{s.description || "—"}</td>
									<td className={tdClass}>
										<button onClick={() => handleToggleActive(s.id, s.is_active)}>
											<Badge color={s.is_active ? "green" : "zinc"}>{s.is_active ? "Active" : "Inactive"}</Badge>
										</button>
									</td>
									<td className={tdClass + " text-right"}>
										<div className="flex items-center justify-end gap-1">
											<button onClick={() => handleEdit(s)} className={btnGhost}>Edit</button>
											<button onClick={() => handleDelete(s.id)} className={btnDanger}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{subjects.length === 0 && (
								<tr><td colSpan={5} className={emptyClass}>
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">📚</div>
									No subjects yet. Add your first subject.
								</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<Modal open={showModal} onClose={() => { setShowModal(false); setError(""); setEditingId(null); }} title={editingId ? "Edit Subject" : "Add Subject"}>
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className={labelClass}>Subject Name <span className="text-red-500">*</span></label>
						<input type="text" placeholder="e.g. Mathematics" value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} className={inputClass} required />
					</div>
					<div>
						<label className={labelClass}>Subject Code</label>
						<input type="text" placeholder="e.g. MATH-101" value={form.subject_code} onChange={(e) => setForm({ ...form, subject_code: e.target.value })} className={inputClass} />
					</div>
					<div>
						<label className={labelClass}>Description</label>
						<input type="text" placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
					</div>
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowModal(false); setError(""); setEditingId(null); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving..." : editingId ? "Update" : "Create Subject"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
