"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Modal, Badge, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, btnGhost, thClass, tdClass, tdBold, emptyClass, alertSuccess, alertError } from "./shared";

export default function TransfersTab({ schoolId, sessions, classes, students, activeSession, userId, onRefresh }) {
	const [transferHistory, setTransferHistory] = useState([]);
	const [showBulkModal, setShowBulkModal] = useState(false);
	const [showSingleModal, setShowSingleModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [bulkForm, setBulkForm] = useState({
		from_class_id: "", to_class_id: "", from_session_id: activeSession?.id || "",
		to_session_id: "", transfer_type: "promotion", remarks: "",
	});
	const [singleForm, setSingleForm] = useState({
		student_id: "", to_class_id: "", to_session_id: activeSession?.id || "",
		transfer_type: "transfer", remarks: "",
	});
	const [fromClassStudents, setFromClassStudents] = useState([]);
	const [selectedStudents, setSelectedStudents] = useState([]);
	const [allClasses, setAllClasses] = useState([]);

	useEffect(() => { fetchTransferHistory(); fetchAllClasses(); }, []);

	const fetchAllClasses = async () => {
		const { data } = await supabase.from("classes").select("*, academic_sessions:session_id(session_name)").eq("school_id", schoolId).order("class_name");
		setAllClasses(data || []);
	};

	const fetchTransferHistory = async () => {
		const { data } = await supabase
			.from("student_transfer_history")
			.select("*, users:student_id(full_name), from_class:from_class_id(class_name, section), to_class:to_class_id(class_name, section), from_session:from_session_id(session_name), to_session:to_session_id(session_name)")
			.eq("school_id", schoolId).order("transferred_at", { ascending: false }).limit(100);
		setTransferHistory(data || []);
	};

	useEffect(() => {
		if (bulkForm.from_class_id && bulkForm.from_session_id) fetchFromClassStudents();
	}, [bulkForm.from_class_id, bulkForm.from_session_id]);

	const fetchFromClassStudents = async () => {
		const { data } = await supabase.from("class_students")
			.select("*, users:student_id(id, full_name)")
			.eq("class_id", bulkForm.from_class_id).eq("session_id", bulkForm.from_session_id).eq("status", "active");
		setFromClassStudents(data || []);
		setSelectedStudents((data || []).map((d) => d.student_id));
	};

	const handleBulkTransfer = async () => {
		if (!bulkForm.to_class_id || !bulkForm.to_session_id || selectedStudents.length === 0) {
			setError("Please fill all fields and select at least one student"); return;
		}
		setSaving(true); setError(""); setSuccess("");
		try {
			for (const studentId of selectedStudents) {
				await supabase.from("class_students").update({ status: "transferred", left_at: new Date().toISOString() })
					.eq("student_id", studentId).eq("class_id", bulkForm.from_class_id).eq("session_id", bulkForm.from_session_id).eq("status", "active");
				await supabase.from("class_students").insert([{ school_id: schoolId, class_id: bulkForm.to_class_id, student_id: studentId, session_id: bulkForm.to_session_id, status: "active" }]);
				await supabase.from("student_transfer_history").insert([{
					school_id: schoolId, student_id: studentId, from_class_id: bulkForm.from_class_id, to_class_id: bulkForm.to_class_id,
					from_session_id: bulkForm.from_session_id, to_session_id: bulkForm.to_session_id, transfer_type: bulkForm.transfer_type, remarks: bulkForm.remarks || null, transferred_by: userId,
				}]);
			}
			setSuccess(`Successfully transferred ${selectedStudents.length} students!`);
			setShowBulkModal(false); fetchTransferHistory(); onRefresh();
		} catch (err) { setError(err.message); } finally { setSaving(false); }
	};

	const handleSingleTransfer = async () => {
		if (!singleForm.student_id || !singleForm.to_class_id || !singleForm.to_session_id) { setError("Please fill all fields"); return; }
		setSaving(true); setError(""); setSuccess("");
		try {
			const { data: current } = await supabase.from("class_students")
				.select("id, class_id, session_id").eq("student_id", singleForm.student_id).eq("status", "active").maybeSingle();
			if (current) {
				await supabase.from("class_students").update({ status: "transferred", left_at: new Date().toISOString() }).eq("id", current.id);
				await supabase.from("student_transfer_history").insert([{
					school_id: schoolId, student_id: singleForm.student_id, from_class_id: current.class_id, to_class_id: singleForm.to_class_id,
					from_session_id: current.session_id, to_session_id: singleForm.to_session_id, transfer_type: singleForm.transfer_type, remarks: singleForm.remarks || null, transferred_by: userId,
				}]);
			}
			await supabase.from("class_students").insert([{ school_id: schoolId, class_id: singleForm.to_class_id, student_id: singleForm.student_id, session_id: singleForm.to_session_id, status: "active" }]);
			setSuccess("Student transferred successfully!"); setShowSingleModal(false); fetchTransferHistory(); onRefresh();
		} catch (err) { setError(err.message); } finally { setSaving(false); }
	};

	const getSessionClasses = (sessionId) => allClasses.filter((c) => c.session_id === sessionId);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Transfers & Promotions</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Move students between classes and sessions</p>
				</div>
				<div className="flex gap-2">
					<button onClick={() => { setShowBulkModal(true); setError(""); }} className={btnPrimary}>Bulk Transfer</button>
					<button onClick={() => { setShowSingleModal(true); setError(""); }} className={btnSecondary}>Single Transfer</button>
				</div>
			</div>

			{error && <div className={alertError}><span>⚠</span> {error}</div>}
			{success && <div className={alertSuccess}><span>✓</span> {success}</div>}

			<div className={cardClass + " p-0! overflow-hidden"}>
				<div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Transfer History <Badge color="indigo">{transferHistory.length}</Badge></h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30">
							<tr>
								<th className={thClass}>Student</th>
								<th className={thClass}>From</th>
								<th className={thClass}>To</th>
								<th className={thClass}>Type</th>
								<th className={thClass}>Date</th>
								<th className={thClass}>Remarks</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{transferHistory.length === 0 ? (
								<tr><td colSpan={6} className={emptyClass}>
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">🔄</div>
									No transfer history yet.
								</td></tr>
							) : transferHistory.map((t) => (
								<tr key={t.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
									<td className={tdBold}>{t.users?.full_name}</td>
									<td className={tdClass}>{t.from_class?.class_name}-{t.from_class?.section} ({t.from_session?.session_name})</td>
									<td className={tdClass}>{t.to_class ? `${t.to_class.class_name}-${t.to_class.section} (${t.to_session?.session_name})` : "Left"}</td>
									<td className={tdClass}>
										<Badge color={t.transfer_type === "promotion" ? "green" : t.transfer_type === "section_change" ? "blue" : "yellow"}>
											{t.transfer_type?.replace("_", " ")}
										</Badge>
									</td>
									<td className={tdClass + " text-xs"}>{new Date(t.transferred_at).toLocaleDateString()}</td>
									<td className={tdClass + " max-w-xs truncate"}>{t.remarks || "—"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Single Transfer Modal */}
			<Modal open={showSingleModal} onClose={() => { setShowSingleModal(false); setError(""); }} title="Single Student Transfer">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className={labelClass}>Student <span className="text-red-500">*</span></label>
							<select value={singleForm.student_id} onChange={(e) => setSingleForm({ ...singleForm, student_id: e.target.value })} className={inputClass} required>
								<option value="">Select Student</option>
								{students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
							</select>
						</div>
						<div>
							<label className={labelClass}>Transfer Type</label>
							<select value={singleForm.transfer_type} onChange={(e) => setSingleForm({ ...singleForm, transfer_type: e.target.value })} className={inputClass}>
								<option value="transfer">Transfer</option>
								<option value="section_change">Section Change</option>
								<option value="promotion">Promotion</option>
								<option value="demotion">Demotion</option>
							</select>
						</div>
						<div>
							<label className={labelClass}>To Session <span className="text-red-500">*</span></label>
							<select value={singleForm.to_session_id} onChange={(e) => setSingleForm({ ...singleForm, to_session_id: e.target.value })} className={inputClass}>
								<option value="">Select Session</option>
								{sessions.map((s) => <option key={s.id} value={s.id}>{s.session_name}</option>)}
							</select>
						</div>
						<div>
							<label className={labelClass}>To Class <span className="text-red-500">*</span></label>
							<select value={singleForm.to_class_id} onChange={(e) => setSingleForm({ ...singleForm, to_class_id: e.target.value })} className={inputClass}>
								<option value="">Select Class</option>
								{getSessionClasses(singleForm.to_session_id).map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
							</select>
						</div>
					</div>
					<div>
						<label className={labelClass}>Remarks</label>
						<input type="text" value={singleForm.remarks} onChange={(e) => setSingleForm({ ...singleForm, remarks: e.target.value })} placeholder="Optional remarks" className={inputClass} />
					</div>
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowSingleModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button onClick={handleSingleTransfer} disabled={saving} className={btnPrimary}>{saving ? "Transferring..." : "Transfer Student"}</button>
					</div>
				</div>
			</Modal>

			{/* Bulk Transfer Modal */}
			<Modal open={showBulkModal} onClose={() => { setShowBulkModal(false); setError(""); }} title="Bulk Transfer / Promote" maxWidth="max-w-3xl">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div>
							<label className={labelClass}>From Session</label>
							<select value={bulkForm.from_session_id} onChange={(e) => setBulkForm({ ...bulkForm, from_session_id: e.target.value, from_class_id: "" })} className={inputClass}>
								<option value="">Select</option>
								{sessions.map((s) => <option key={s.id} value={s.id}>{s.session_name}</option>)}
							</select>
						</div>
						<div>
							<label className={labelClass}>From Class</label>
							<select value={bulkForm.from_class_id} onChange={(e) => setBulkForm({ ...bulkForm, from_class_id: e.target.value })} className={inputClass}>
								<option value="">Select</option>
								{getSessionClasses(bulkForm.from_session_id).map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
							</select>
						</div>
						<div>
							<label className={labelClass}>Transfer Type</label>
							<select value={bulkForm.transfer_type} onChange={(e) => setBulkForm({ ...bulkForm, transfer_type: e.target.value })} className={inputClass}>
								<option value="promotion">Promotion</option>
								<option value="transfer">Transfer</option>
								<option value="section_change">Section Change</option>
							</select>
						</div>
						<div>
							<label className={labelClass}>To Session</label>
							<select value={bulkForm.to_session_id} onChange={(e) => setBulkForm({ ...bulkForm, to_session_id: e.target.value, to_class_id: "" })} className={inputClass}>
								<option value="">Select</option>
								{sessions.map((s) => <option key={s.id} value={s.id}>{s.session_name}</option>)}
							</select>
						</div>
						<div>
							<label className={labelClass}>To Class</label>
							<select value={bulkForm.to_class_id} onChange={(e) => setBulkForm({ ...bulkForm, to_class_id: e.target.value })} className={inputClass}>
								<option value="">Select</option>
								{getSessionClasses(bulkForm.to_session_id).map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
							</select>
						</div>
						<div>
							<label className={labelClass}>Remarks</label>
							<input type="text" value={bulkForm.remarks} onChange={(e) => setBulkForm({ ...bulkForm, remarks: e.target.value })} placeholder="e.g. End of session" className={inputClass} />
						</div>
					</div>

					{fromClassStudents.length > 0 && (
						<div>
							<div className="mb-2 flex items-center justify-between">
								<p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Students ({selectedStudents.length}/{fromClassStudents.length})
								</p>
								<div className="flex gap-2">
									<button onClick={() => setSelectedStudents(fromClassStudents.map((d) => d.student_id))} className={btnGhost}>Select All</button>
									<button onClick={() => setSelectedStudents([])} className={`${btnGhost} text-zinc-500!`}>Clear</button>
								</div>
							</div>
							<div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
								{fromClassStudents.map((cs) => (
									<label key={cs.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 p-2.5 text-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
										<input type="checkbox" checked={selectedStudents.includes(cs.student_id)}
											onChange={(e) => {
												if (e.target.checked) setSelectedStudents([...selectedStudents, cs.student_id]);
												else setSelectedStudents(selectedStudents.filter((id) => id !== cs.student_id));
											}}
											className="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500" />
										<span className="text-zinc-900 dark:text-white">{cs.users?.full_name}</span>
									</label>
								))}
							</div>
						</div>
					)}

					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowBulkModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button onClick={handleBulkTransfer} disabled={saving} className={btnPrimary}>
							{saving ? "Transferring..." : `Transfer ${selectedStudents.length} Students`}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
