"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Modal, Badge, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, thClass, tdClass, emptyClass, alertError } from "./shared";

export default function ClassesTab({ schoolId, session, classes, subjects, onRefresh }) {
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ class_name: "", section: "A", room_number: "", capacity: "" });
	const [error, setError] = useState("");
	const [classSubjects, setClassSubjects] = useState({});
	const [showSubjectAssign, setShowSubjectAssign] = useState(null);

	useEffect(() => {
		if (classes.length) fetchClassSubjects();
	}, [classes]);

	const fetchClassSubjects = async () => {
		const classIds = classes.map((c) => c.id);
		if (!classIds.length) return;
		const { data } = await supabase.from("class_subjects").select("*").in("class_id", classIds);
		const map = {};
		(data || []).forEach((cs) => {
			if (!map[cs.class_id]) map[cs.class_id] = [];
			map[cs.class_id].push(cs.subject_id);
		});
		setClassSubjects(map);
	};

	const handleAdd = async (e) => {
		e.preventDefault();
		if (!session) { setError("Please create an academic session first"); return; }
		setSaving(true);
		setError("");
		try {
			const { error: err } = await supabase.from("classes").insert([{
				school_id: schoolId,
				session_id: session.id,
				class_name: form.class_name,
				section: form.section || "A",
				room_number: form.room_number || null,
				capacity: form.capacity ? parseInt(form.capacity) : null,
			}]);
			if (err) throw err;
			setForm({ class_name: "", section: "A", room_number: "", capacity: "" });
			setShowModal(false);
			onRefresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm("Delete this class?")) return;
		await supabase.from("classes").delete().eq("id", id);
		onRefresh();
	};

	const toggleSubject = async (classId, subjectId) => {
		const current = classSubjects[classId] || [];
		if (current.includes(subjectId)) {
			await supabase.from("class_subjects").delete().eq("class_id", classId).eq("subject_id", subjectId);
		} else {
			await supabase.from("class_subjects").insert([{ school_id: schoolId, class_id: classId, subject_id: subjectId }]);
		}
		fetchClassSubjects();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Classes & Sections</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						{session ? `Session: ${session.session_name}` : "No session selected"} — {classes.length} classes
					</p>
				</div>
				<button onClick={() => setShowModal(true)} className={btnPrimary}>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
					Add Class
				</button>
			</div>

			{classes.length === 0 ? (
				<div className={`${cardClass} py-12 text-center`}>
					<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl dark:bg-zinc-800">🏫</div>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">No classes for this session. Add your first class.</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{classes.map((c) => (
						<div key={c.id} className={`${cardClass} relative group`}>
							<button onClick={() => handleDelete(c.id)} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20">
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
							</button>
							<div className="flex items-start gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
									{c.class_name}
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-bold text-zinc-900 dark:text-white">
										Class {c.class_name} <span className="text-zinc-400 font-normal">- {c.section}</span>
									</h3>
									<div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
										{c.room_number && <span>🚪 Room {c.room_number}</span>}
										{c.capacity && <span>👥 Cap: {c.capacity}</span>}
									</div>
								</div>
							</div>
							<div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
								<div className="flex flex-wrap gap-1.5">
									{(classSubjects[c.id] || []).map((sid) => {
										const sub = subjects.find((s) => s.id === sid);
										return sub ? <Badge key={sid} color="indigo">{sub.subject_name}</Badge> : null;
									})}
									<button
										onClick={() => setShowSubjectAssign(showSubjectAssign === c.id ? null : c.id)}
										className="inline-flex items-center rounded-full border border-dashed border-zinc-300 px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-600 dark:text-zinc-400"
									>
										{showSubjectAssign === c.id ? "✕ Close" : "+ Assign Subjects"}
									</button>
								</div>
								{showSubjectAssign === c.id && (
									<div className="mt-3 flex flex-wrap gap-2">
										{subjects.filter((s) => s.is_active).map((sub) => (
											<label key={sub.id} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs cursor-pointer transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
												<input type="checkbox" checked={(classSubjects[c.id] || []).includes(sub.id)} onChange={() => toggleSubject(c.id, sub.id)} className="h-3.5 w-3.5 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500" />
												{sub.subject_name}
											</label>
										))}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			<Modal open={showModal} onClose={() => { setShowModal(false); setError(""); }} title="Add New Class">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleAdd} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className={labelClass}>Class Name <span className="text-red-500">*</span></label>
							<input type="text" placeholder="e.g. 10, XII" value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} className={inputClass} required />
						</div>
						<div>
							<label className={labelClass}>Section</label>
							<input type="text" placeholder="e.g. A, B" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className={inputClass} />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className={labelClass}>Room Number</label>
							<input type="text" placeholder="e.g. 101" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className={inputClass} />
						</div>
						<div>
							<label className={labelClass}>Capacity</label>
							<input type="number" placeholder="e.g. 40" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputClass} />
						</div>
					</div>
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving..." : "Create Class"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
