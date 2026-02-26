"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Modal, Badge, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, btnDanger, thClass, tdClass, tdBold, emptyClass, alertError } from "./shared";

export default function StudentsTab({ schoolId, session, classes, students, onRefresh }) {
	const [selectedClass, setSelectedClass] = useState("");
	const [classStudents, setClassStudents] = useState([]);
	const [enrolling, setEnrolling] = useState(false);
	const [enrollForm, setEnrollForm] = useState({ student_id: "", roll_number: "" });
	const [error, setError] = useState("");
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [showEnrollModal, setShowEnrollModal] = useState(false);

	useEffect(() => {
		if (selectedClass && session) fetchClassStudents();
	}, [selectedClass, session]);

	const fetchClassStudents = async () => {
		setLoadingStudents(true);
		try {
			const { data } = await supabase
				.from("class_students")
				.select("*, users:student_id(id, full_name, email, phone)")
				.eq("class_id", selectedClass)
				.eq("session_id", session.id)
				.eq("status", "active")
				.order("roll_number");
			setClassStudents(data || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingStudents(false);
		}
	};

	const handleEnroll = async (e) => {
		e.preventDefault();
		if (!selectedClass || !session) { setError("Select a class first"); return; }
		setEnrolling(true);
		setError("");
		try {
			const { data: existing } = await supabase
				.from("class_students")
				.select("id, class_id")
				.eq("student_id", enrollForm.student_id)
				.eq("session_id", session.id)
				.eq("status", "active")
				.maybeSingle();

			if (existing) {
				const cls = classes.find((c) => c.id === existing.class_id);
				setError(`Student already enrolled in Class ${cls?.class_name || "?"}-${cls?.section || "?"}`);
				setEnrolling(false);
				return;
			}

			const { error: err } = await supabase.from("class_students").insert([{
				school_id: schoolId,
				class_id: selectedClass,
				student_id: enrollForm.student_id,
				session_id: session.id,
				roll_number: enrollForm.roll_number || null,
			}]);
			if (err) throw err;
			setEnrollForm({ student_id: "", roll_number: "" });
			setShowEnrollModal(false);
			fetchClassStudents();
		} catch (err) {
			setError(err.message);
		} finally {
			setEnrolling(false);
		}
	};

	const handleRemove = async (id) => {
		if (!confirm("Remove student from this class?")) return;
		await supabase.from("class_students").update({ status: "dropped", left_at: new Date().toISOString() }).eq("id", id);
		fetchClassStudents();
	};

	const enrolledIds = classStudents.map((cs) => cs.student_id);
	const availableStudents = students.filter((s) => !enrolledIds.includes(s.id));

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Student Enrollment</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Assign students to classes for the active session</p>
				</div>
				{selectedClass && (
					<button onClick={() => setShowEnrollModal(true)} className={btnPrimary}>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
						Enroll Student
					</button>
				)}
			</div>

			<div>
				<label className={labelClass}>Select Class</label>
				<div className="mt-2 flex flex-wrap gap-2">
					{classes.map((c) => (
						<button
							key={c.id}
							onClick={() => setSelectedClass(c.id)}
							className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
								selectedClass === c.id
									? "bg-indigo-500 text-white shadow-md"
									: "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-600"
							}`}
						>
							{c.class_name} - {c.section}
						</button>
					))}
					{classes.length === 0 && <p className="text-sm text-zinc-400">No classes available. Create classes first.</p>}
				</div>
			</div>

			{error && <div className={alertError}><span>⚠</span> {error}</div>}

			{selectedClass && (
				<div className={cardClass + " p-0! overflow-hidden"}>
					<div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
								Enrolled Students <Badge color="indigo">{classStudents.length}</Badge>
							</h3>
						</div>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30">
								<tr>
									<th className={thClass}>Roll</th>
									<th className={thClass}>Student</th>
									<th className={thClass}>Email</th>
									<th className={thClass}>Phone</th>
									<th className={thClass}>Enrolled On</th>
									<th className={thClass + " text-right"}>Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
								{loadingStudents ? (
									<tr><td colSpan={6} className={emptyClass}>
										<div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
									</td></tr>
								) : classStudents.length === 0 ? (
									<tr><td colSpan={6} className={emptyClass}>
										<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">🎓</div>
										No students enrolled. Click &quot;Enroll Student&quot; to add.
									</td></tr>
								) : classStudents.map((cs) => (
									<tr key={cs.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
										<td className={tdClass + " font-mono text-xs"}>{cs.roll_number || "—"}</td>
										<td className={tdBold}>{cs.users?.full_name}</td>
										<td className={tdClass}>{cs.users?.email}</td>
										<td className={tdClass}>{cs.users?.phone || "—"}</td>
										<td className={tdClass + " text-xs"}>{new Date(cs.enrolled_at).toLocaleDateString()}</td>
										<td className={tdClass + " text-right"}>
											<button onClick={() => handleRemove(cs.id)} className={btnDanger}>Remove</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<Modal open={showEnrollModal} onClose={() => { setShowEnrollModal(false); setError(""); }} title="Enroll Student">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleEnroll} className="space-y-4">
					<div>
						<label className={labelClass}>Student <span className="text-red-500">*</span></label>
						<select value={enrollForm.student_id} onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })} className={inputClass} required>
							<option value="">-- Select Student --</option>
							{availableStudents.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
						</select>
						{availableStudents.length === 0 && <p className="mt-1 text-xs text-amber-600">All students are already enrolled in a class.</p>}
					</div>
					<div>
						<label className={labelClass}>Roll Number</label>
						<input type="text" value={enrollForm.roll_number} onChange={(e) => setEnrollForm({ ...enrollForm, roll_number: e.target.value })} placeholder="Optional" className={inputClass} />
					</div>
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowEnrollModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={enrolling} className={btnPrimary}>{enrolling ? "Enrolling..." : "Enroll Student"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
