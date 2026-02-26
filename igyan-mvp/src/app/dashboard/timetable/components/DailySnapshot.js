"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../utils/supabase";

// ─── CONSTANTS ──────────────────────────────────────────────
const SLOT_ICONS = { period: "📖", short_break: "☕", lunch_break: "🍽️" };

const SUBJECT_COLORS = [
	{ bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
	{ bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
	{ bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-800 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" },
	{ bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-800 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
	{ bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
	{ bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-800 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
	{ bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-800 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
	{ bg: "bg-lime-100 dark:bg-lime-900/40", text: "text-lime-800 dark:text-lime-300", border: "border-lime-200 dark:border-lime-800" },
	{ bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-800 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
	{ bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
];

const STATUS_CONFIG = {
	as_planned: { label: "As Planned", icon: "✅", bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500" },
	substituted: { label: "Substituted", icon: "🔄", bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500" },
	cancelled: { label: "Cancelled", icon: "❌", bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
	free_period: { label: "Free Period", icon: "⬜", bg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", dot: "bg-zinc-400" },
};

function fmt12(timeStr) {
	if (!timeStr) return "";
	const [h, m] = timeStr.split(":").map(Number);
	return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// ════════════════════════════════════════════════════════════════
// DAILY SNAPSHOT COMPONENT
// ════════════════════════════════════════════════════════════════
export default function DailySnapshot({
	schoolId,
	activeSession,
	activeTemplate,
	classes,
	subjects,
	faculty,
	facultyAssignments,
	savedDays,
	savedSlots,
	user,
}) {
	// ─── State ───
	const [dailyDate, setDailyDate] = useState(new Date().toISOString().split("T")[0]);
	const [dailyRecord, setDailyRecord] = useState(null);
	const [dailyEntries, setDailyEntries] = useState([]);
	const [dailyClassId, setDailyClassId] = useState("");
	const [generatingSnapshot, setGeneratingSnapshot] = useState(false);
	const [dailyLoading, setDailyLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [editingRow, setEditingRow] = useState(null); // slot_id being edited
	const [substituteReason, setSubstituteReason] = useState("");
	const [showReasonModal, setShowReasonModal] = useState(null); // slot_id for reason modal
	const [saving, setSaving] = useState({});

	// Subject color map
	const subjectColorMap = {};
	subjects.forEach((s, i) => { subjectColorMap[s.id] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]; });

	// ─── Get day index from date ───
	const getDayIndex = (dateStr) => {
		const d = new Date(dateStr + "T00:00:00");
		const jsDay = d.getDay();
		return jsDay === 0 ? 6 : jsDay - 1; // Convert JS Sunday=0 → Mon=0 index
	};

	// ─── Get faculty display name ───
	const getFacultyDisplay = (facId) => {
		const f = faculty.find((x) => x.id === facId);
		if (!f) return "Unknown";
		const assignedSubjectIds = [...new Set(
			facultyAssignments.filter((a) => a.faculty_id === facId).map((a) => a.subject_id).filter(Boolean)
		)];
		const subNames = assignedSubjectIds.map((sid) => subjects.find((s) => s.id === sid)?.subject_name).filter(Boolean);
		return subNames.length > 0 ? `${f.full_name} - ${subNames.join(", ")}` : f.full_name;
	};

	// ─── Fetch daily record ───
	const fetchDailyRecord = useCallback(async () => {
		if (!schoolId || !dailyDate) return;
		setDailyLoading(true);
		try {
			const { data } = await supabase
				.from("timetable_daily_records").select("*")
				.eq("school_id", schoolId).eq("record_date", dailyDate)
				.maybeSingle();
			setDailyRecord(data || null);
			if (!data) { setDailyEntries([]); setDailyClassId(""); }
		} catch { setDailyRecord(null); setDailyEntries([]); }
		setDailyLoading(false);
	}, [schoolId, dailyDate]);

	useEffect(() => { fetchDailyRecord(); }, [fetchDailyRecord]);

	// ─── Fetch daily entries for selected class ───
	const fetchDailyEntries = useCallback(async () => {
		if (!dailyRecord || !dailyClassId) { setDailyEntries([]); return; }
		setDailyLoading(true);
		try {
			const { data } = await supabase
				.from("timetable_daily_entries").select("*")
				.eq("daily_record_id", dailyRecord.id)
				.eq("class_id", dailyClassId);
			setDailyEntries(data || []);
		} catch { setDailyEntries([]); }
		setDailyLoading(false);
	}, [dailyRecord, dailyClassId]);

	useEffect(() => { fetchDailyEntries(); }, [fetchDailyEntries]);

	// ─── Generate Snapshot ───
	const generateSnapshot = async () => {
		if (!activeTemplate || !schoolId || !activeSession) return;
		setGeneratingSnapshot(true); setError("");
		try {
			const dayIdx = getDayIndex(dailyDate);
			const matchDay = savedDays.find((d) => d.day_index === dayIdx && d.is_active);
			if (!matchDay) {
				const dayName = new Date(dailyDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
				setError(`${dayName} is not a school day in the current template.`);
				setGeneratingSnapshot(false);
				return;
			}

			// Create daily record
			const { data: rec, error: rErr } = await supabase
				.from("timetable_daily_records")
				.insert({
					school_id: schoolId, session_id: activeSession.id, template_id: activeTemplate.id,
					record_date: dailyDate, day_id: matchDay.id, status: "draft", created_by: user.id,
				})
				.select().single();
			if (rErr) throw rErr;

			// Get ALL master entries for that day (all classes)
			const { data: masterEntries } = await supabase
				.from("timetable_entries").select("*")
				.eq("template_id", activeTemplate.id).eq("day_id", matchDay.id);

			// Build a lookup: class_id + slot_id → master entry
			const masterMap = {};
			(masterEntries || []).forEach((e) => {
				masterMap[`${e.class_id}_${e.slot_id}`] = e;
			});

			// Get all period slots only
			const periodSlotList = savedSlots.filter((s) => s.slot_type === "period");

			// Create entries for ALL classes × ALL period slots
			const rows = [];
			classes.forEach((cls) => {
				periodSlotList.forEach((slot) => {
					const master = masterMap[`${cls.id}_${slot.id}`];
					rows.push({
						daily_record_id: rec.id,
						slot_id: slot.id,
						class_id: cls.id,
						original_subject_id: master?.subject_id || null,
						original_faculty_id: master?.faculty_id || null,
						actual_subject_id: master?.subject_id || null,
						actual_faculty_id: master?.faculty_id || null,
						status: "as_planned",
					});
				});
			});

			if (rows.length > 0) {
				const { error: iErr } = await supabase.from("timetable_daily_entries").insert(rows);
				if (iErr) throw iErr;
			}

			setDailyRecord(rec);
			setSuccess("Daily snapshot generated successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message || "Failed to generate snapshot");
		}
		setGeneratingSnapshot(false);
	};

	// ─── Update single daily entry ───
	const updateDailyEntry = async (entryId, updates) => {
		setSaving((p) => ({ ...p, [entryId]: true }));
		try {
			const { error: uErr } = await supabase
				.from("timetable_daily_entries")
				.update({ ...updates, updated_at: new Date().toISOString() })
				.eq("id", entryId);
			if (uErr) throw uErr;
			// Update local state
			setDailyEntries((prev) =>
				prev.map((e) => (e.id === entryId ? { ...e, ...updates } : e))
			);
			setSuccess("Updated!"); setTimeout(() => setSuccess(""), 1500);
		} catch (err) {
			console.error(err);
			setError("Update failed: " + (err.message || "Unknown error"));
			setTimeout(() => setError(""), 3000);
		}
		setSaving((p) => ({ ...p, [entryId]: false }));
	};

	// ─── Mark as Substitute (opens reason + faculty picker) ───
	const handleMarkSubstitute = (entry) => {
		setShowReasonModal(entry.id);
		setSubstituteReason(entry.substitute_reason || "");
		setEditingRow(entry.id);
	};

	// ─── Confirm substitute with reason ───
	const confirmSubstitute = async (entryId, facultyId, reason) => {
		await updateDailyEntry(entryId, {
			status: "substituted",
			actual_faculty_id: facultyId || null,
			substitute_reason: reason || null,
		});
		setShowReasonModal(null);
		setEditingRow(null);
		setSubstituteReason("");
	};

	// ─── Restore to as planned ───
	const handleRestore = async (entry) => {
		await updateDailyEntry(entry.id, {
			status: "as_planned",
			actual_faculty_id: entry.original_faculty_id,
			actual_subject_id: entry.original_subject_id,
			substitute_reason: null,
		});
		setEditingRow(null);
	};

	// ─── Cancel period ───
	const handleCancel = async (entry) => {
		await updateDailyEntry(entry.id, {
			status: "cancelled",
			actual_faculty_id: null,
			actual_subject_id: null,
		});
	};

	// ─── Mark free period ───
	const handleFreePeriod = async (entry) => {
		await updateDailyEntry(entry.id, {
			status: "free_period",
			actual_faculty_id: null,
			actual_subject_id: null,
		});
	};

	// ─── Update daily record status ───
	const updateRecordStatus = async (newStatus) => {
		if (!dailyRecord) return;
		try {
			await supabase.from("timetable_daily_records")
				.update({ status: newStatus, updated_at: new Date().toISOString() })
				.eq("id", dailyRecord.id);
			setDailyRecord((p) => ({ ...p, status: newStatus }));
			setSuccess(`Status changed to ${newStatus}!`);
			setTimeout(() => setSuccess(""), 2000);
		} catch (err) {
			setError("Failed to update status");
			setTimeout(() => setError(""), 3000);
		}
	};

	// ─── Delete snapshot ───
	const deleteSnapshot = async () => {
		if (!dailyRecord) return;
		if (!confirm("Are you sure you want to delete this daily snapshot? All entries will be removed.")) return;
		try {
			await supabase.from("timetable_daily_entries").delete().eq("daily_record_id", dailyRecord.id);
			await supabase.from("timetable_daily_records").delete().eq("id", dailyRecord.id);
			setDailyRecord(null);
			setDailyEntries([]);
			setDailyClassId("");
			setSuccess("Snapshot deleted! You can now generate a fresh one.");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError("Failed to delete: " + err.message);
			setTimeout(() => setError(""), 3000);
		}
	};

	// ─── Sync from Master Timetable ───
	// Re-creates all daily entries from current master timetable_entries
	// This fixes the issue when slot IDs changed (structure re-saved) or entries were added after snapshot
	const syncFromMaster = async () => {
		if (!dailyRecord || !activeTemplate) return;
		if (!confirm("This will re-sync all daily entries from the master timetable. Any substitutions or changes will be reset. Continue?")) return;
		setDailyLoading(true); setError("");
		try {
			// 1) Delete all existing daily entries for this record
			await supabase.from("timetable_daily_entries").delete().eq("daily_record_id", dailyRecord.id);

			// 2) Get the day_id from the record
			const dayId = dailyRecord.day_id;

			// 3) Get current master entries for this day
			const { data: masterEntries } = await supabase
				.from("timetable_entries").select("*")
				.eq("template_id", activeTemplate.id).eq("day_id", dayId);

			// 4) Build master lookup
			const masterMap = {};
			(masterEntries || []).forEach((e) => {
				masterMap[`${e.class_id}_${e.slot_id}`] = e;
			});

			// 5) Get current period slots (use savedSlots which have current IDs)
			const periodSlotList = savedSlots.filter((s) => s.slot_type === "period");

			// 6) Create entries for ALL classes × ALL period slots
			const rows = [];
			classes.forEach((cls) => {
				periodSlotList.forEach((slot) => {
					const master = masterMap[`${cls.id}_${slot.id}`];
					rows.push({
						daily_record_id: dailyRecord.id,
						slot_id: slot.id,
						class_id: cls.id,
						original_subject_id: master?.subject_id || null,
						original_faculty_id: master?.faculty_id || null,
						actual_subject_id: master?.subject_id || null,
						actual_faculty_id: master?.faculty_id || null,
						status: "as_planned",
					});
				});
			});

			if (rows.length > 0) {
				const { error: iErr } = await supabase.from("timetable_daily_entries").insert(rows);
				if (iErr) throw iErr;
			}

			// 7) Update record status back to draft and reset day_id to current
			await supabase.from("timetable_daily_records")
				.update({ status: "draft", updated_at: new Date().toISOString() })
				.eq("id", dailyRecord.id);
			setDailyRecord((p) => ({ ...p, status: "draft" }));

			// 8) Refresh entries for currently selected class
			if (dailyClassId) {
				const { data: freshEntries } = await supabase
					.from("timetable_daily_entries").select("*")
					.eq("daily_record_id", dailyRecord.id)
					.eq("class_id", dailyClassId);
				setDailyEntries(freshEntries || []);
			}

			setSuccess("Synced from master timetable! All entries updated with current assignments.");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError("Sync failed: " + (err.message || "Unknown error"));
			setTimeout(() => setError(""), 3000);
		}
		setDailyLoading(false);
	};

	// ─── Derived data ───
	const entryMap = {};
	dailyEntries.forEach((e) => { entryMap[e.slot_id] = e; });

	const periodSlots = savedSlots.filter((s) => s.slot_type === "period");
	const selectedClassName = classes.find((c) => c.id === dailyClassId);
	const dayName = dailyDate ? new Date(dailyDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }) : "";
	const shortDayName = dailyDate ? new Date(dailyDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" }) : "";

	// Stats
	const stats = {
		as_planned: dailyEntries.filter((e) => e.status === "as_planned").length,
		substituted: dailyEntries.filter((e) => e.status === "substituted").length,
		cancelled: dailyEntries.filter((e) => e.status === "cancelled").length,
		free_period: dailyEntries.filter((e) => e.status === "free_period").length,
	};

	// ════════════════════════════════════════════════════════════════
	// RENDER
	// ════════════════════════════════════════════════════════════════
	return (
		<div className="space-y-6">
			{/* Alerts */}
			{error && (
				<div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
					⚠️ {error}
					<button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
				</div>
			)}
			{success && (
				<div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
					✅ {success}
				</div>
			)}

			{/* ─── DATE PICKER + STATUS CARD ─── */}
			<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center gap-3 mb-5">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-xl text-white shadow-lg shadow-orange-500/20">📋</div>
					<div>
						<h3 className="text-xl font-bold text-zinc-900 dark:text-white">Daily Timetable Snapshot</h3>
						<p className="text-xs text-zinc-400">Record actual timetable — handle absences, substitutions &amp; free periods</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
					{/* Date input */}
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">📅 Select Date</label>
						<input
							type="date"
							value={dailyDate}
							onChange={(e) => {
								setDailyDate(e.target.value);
								setDailyRecord(null);
								setDailyEntries([]);
								setDailyClassId("");
								setEditingRow(null);
							}}
							className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						/>
					</div>

					{/* Day display */}
					<div>
						{dailyDate && (
							<div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 dark:from-indigo-950/30 dark:to-purple-950/30">
								<p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Selected Day</p>
								<p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{dayName}</p>
								<p className="text-[10px] text-indigo-500 dark:text-indigo-400">{shortDayName}</p>
							</div>
						)}
					</div>

					{/* Action area */}
					<div className="flex flex-col gap-2">
						{!dailyRecord && !dailyLoading && dailyDate && (
							<button
								onClick={generateSnapshot}
								disabled={generatingSnapshot}
								className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl disabled:opacity-50"
							>
								{generatingSnapshot ? (
									<><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" /></svg> Generating...</>
								) : (
									<>⚡ Generate Snapshot</>
								)}
							</button>
						)}
						{dailyRecord && (
							<div className="flex items-center gap-2 flex-wrap">
								<span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_CONFIG[dailyRecord.status]?.bg || "bg-zinc-100 text-zinc-600"}`}>
									<span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[dailyRecord.status]?.dot || "bg-zinc-400"}`} />
									{dailyRecord.status === "completed" ? "✅ Completed" : dailyRecord.status === "published" ? "📢 Published" : "📝 Draft"}
								</span>
								<button onClick={syncFromMaster}
									className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400">
									🔄 Sync from Master
								</button>
								<button onClick={deleteSnapshot}
									className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
									🗑️ Delete
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Loading */}
			{dailyLoading && (
				<div className="flex justify-center py-12">
					<div className="flex flex-col items-center gap-3">
						<div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
						<p className="text-sm text-zinc-400">Loading snapshot...</p>
					</div>
				</div>
			)}

			{/* No snapshot */}
			{!dailyRecord && !dailyLoading && dailyDate && (
				<div className="rounded-2xl border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50 py-16 text-center dark:border-orange-900/50 dark:from-orange-950/20 dark:to-amber-950/20">
					<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
						<span className="text-4xl">📋</span>
					</div>
					<p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">No snapshot exists for this date</p>
					<p className="mt-1 text-xs text-zinc-400">Click &quot;Generate Snapshot&quot; to copy the master timetable for this day</p>
				</div>
			)}

			{/* ─── SNAPSHOT EXISTS ─── */}
			{dailyRecord && !dailyLoading && (
				<>
					{/* Class selector */}
					<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-blue-900/30">🏫</div>
							<div>
								<h3 className="text-lg font-bold text-zinc-900 dark:text-white">Select Class</h3>
								<p className="text-xs text-zinc-400">Choose a class to view &amp; manage today&apos;s timetable</p>
							</div>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
							{classes.map((c) => (
								<button
									key={c.id}
									onClick={() => { setDailyClassId(c.id); setEditingRow(null); }}
									className={`rounded-xl border-2 px-4 py-3 text-center transition-all ${
										dailyClassId === c.id
											? "border-indigo-500 bg-indigo-50 shadow-md dark:border-indigo-400 dark:bg-indigo-950/40"
											: "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
									}`}
								>
									<p className={`text-sm font-bold ${dailyClassId === c.id ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300"}`}>
										{c.class_name}
									</p>
									<p className={`text-[10px] ${dailyClassId === c.id ? "text-indigo-500" : "text-zinc-400"}`}>
										{c.section}
									</p>
								</button>
							))}
						</div>
					</div>

					{/* Daily entries */}
					{dailyClassId && (
						<div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
							{/* Header */}
							<div className="border-b border-zinc-200 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-4">
								<div className="flex items-center justify-between flex-wrap gap-3">
									<div className="text-white">
										<h3 className="text-lg font-bold">
											{selectedClassName?.class_name} - {selectedClassName?.section}
										</h3>
										<p className="text-xs text-white/80">{dayName} • Daily Timetable</p>
									</div>
									<div className="flex gap-2">
										{dailyRecord.status === "draft" && (
											<>
												<button onClick={() => updateRecordStatus("published")}
													className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-xs font-bold text-white hover:bg-white/30 transition-colors">
													📢 Publish
												</button>
												<button onClick={() => updateRecordStatus("completed")}
													className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-xs font-bold text-white hover:bg-white/30 transition-colors">
													✅ Complete
												</button>
											</>
										)}
										{dailyRecord.status === "published" && (
											<button onClick={() => updateRecordStatus("completed")}
												className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-xs font-bold text-white hover:bg-white/30 transition-colors">
												✅ Mark Complete
											</button>
										)}
									</div>
								</div>
							</div>

							{/* ─── PERIOD CARDS ─── */}
							<div className="p-4 space-y-3">
								{/* Sync banner when entries are missing */}
								{periodSlots.length > 0 && Object.keys(entryMap).length === 0 && !dailyLoading && (
									<div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
										<div className="flex items-center justify-between gap-4 flex-wrap">
											<div>
												<h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">⚠️ Entries Out of Sync</h4>
												<p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
													No daily entries found for this class. This happens when the timetable structure was re-saved after the snapshot was created, or assignments were added later.
												</p>
											</div>
											<button
												onClick={syncFromMaster}
												className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all"
											>
												🔄 Sync from Master Timetable
											</button>
										</div>
									</div>
								)}
								{savedSlots.map((slot) => {
									const isPeriod = slot.slot_type === "period";

									// Break row
									if (!isPeriod) {
										return (
											<div key={slot.id} className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/40">
												<span className="text-lg">{SLOT_ICONS[slot.slot_type]}</span>
												<span className="text-xs font-medium text-zinc-400">{slot.label}</span>
												<span className="text-[10px] text-zinc-300 dark:text-zinc-600">
													{fmt12(slot.start_time?.slice(0, 5))} – {fmt12(slot.end_time?.slice(0, 5))}
												</span>
											</div>
										);
									}

									const entry = entryMap[slot.id];
									if (!entry) {
										return (
											<div key={slot.id} className="rounded-xl border border-dashed border-amber-200 bg-amber-50/30 px-4 py-4 dark:border-amber-900/50 dark:bg-amber-950/10">
												<div className="flex items-center gap-2 justify-between">
													<div className="flex items-center gap-2">
														<span className="text-sm">{SLOT_ICONS[slot.slot_type]}</span>
														<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{slot.label}</span>
														<span className="text-[10px] text-zinc-400">({fmt12(slot.start_time?.slice(0, 5))} – {fmt12(slot.end_time?.slice(0, 5))})</span>
													</div>
													<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">⚠️ Not synced</span>
												</div>
												<p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5">
													Slot IDs changed or snapshot was created before assignments. Click <strong>&quot;🔄 Sync from Master&quot;</strong> above to fix.
												</p>
											</div>
										);
									}

									const st = entry.status || "as_planned";
									const stConfig = STATUS_CONFIG[st];
									const origSubj = entry.original_subject_id ? subjects.find((s) => s.id === entry.original_subject_id) : null;
									const origFac = entry.original_faculty_id ? faculty.find((f) => f.id === entry.original_faculty_id) : null;
									const actSubj = entry.actual_subject_id ? subjects.find((s) => s.id === entry.actual_subject_id) : null;
									const actFac = entry.actual_faculty_id ? faculty.find((f) => f.id === entry.actual_faculty_id) : null;
									const sc = origSubj ? subjectColorMap[origSubj.id] : null;
									const isEditing = editingRow === entry.id;
									const isSaving = saving[entry.id];

									return (
										<div
											key={slot.id}
											className={`rounded-xl border transition-all ${
												st === "cancelled" ? "border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10 opacity-60" :
												st === "substituted" ? "border-orange-200 bg-orange-50/30 dark:border-orange-900/50 dark:bg-orange-950/10" :
												st === "free_period" ? "border-zinc-200 bg-zinc-50/30 dark:border-zinc-700 dark:bg-zinc-800/30" :
												"border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
											} ${isEditing ? "ring-2 ring-indigo-500/30 shadow-lg" : "hover:shadow-sm"}`}
										>
											{/* Top: Slot info + Status + Actions */}
											<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
												{/* Left: Slot label + time */}
												<div className="flex items-center gap-3">
													<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
														{slot.label.replace("Period ", "P")}
													</div>
													<div>
														<p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{slot.label}</p>
														<p className="text-[10px] text-zinc-400">
															{fmt12(slot.start_time?.slice(0, 5))} – {fmt12(slot.end_time?.slice(0, 5))}
														</p>
													</div>
												</div>

												{/* Right: Status badge */}
												<span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${stConfig.bg}`}>
													<span className={`h-1.5 w-1.5 rounded-full ${stConfig.dot}`} />
													{stConfig.icon} {stConfig.label}
												</span>
											</div>

											{/* Middle: Subject & Faculty info */}
											<div className="px-4 py-3">
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													{/* Original Assignment */}
													<div>
														<p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">📚 Assigned (Master)</p>
														<div className="flex items-center gap-2">
															{origSubj && (
																<span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${sc?.bg || ""} ${sc?.text || ""} ${sc?.border || ""}`}>
																	{origSubj.subject_name}
																</span>
															)}
															{origFac && (
																<span className="text-xs text-zinc-600 dark:text-zinc-400">
																	👨‍🏫 {origFac.full_name}
																</span>
															)}
															{!origSubj && !origFac && (
																<span className="text-[10px] text-zinc-400 italic">Not assigned in master</span>
															)}
														</div>
													</div>

													{/* Actual / Current */}
													<div>
														<p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
															{st === "substituted" ? "🔄 Substitute" : st === "cancelled" ? "❌ Cancelled" : st === "free_period" ? "⬜ Free" : "✅ Current"}
														</p>
													{st === "as_planned" && (actSubj || actFac) && (
														<div className="flex items-center gap-2 flex-wrap">
															{actSubj && (
																<span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${sc?.bg || ""} ${sc?.text || ""} ${sc?.border || ""}`}>
																	{actSubj.subject_name}
																</span>
															)}
															{actFac && (
																<span className="text-xs text-green-600 dark:text-green-400">
																	👨‍🏫 {actFac.full_name}
																</span>
															)}
														</div>
													)}
													{st === "as_planned" && !actSubj && !actFac && (
														<span className="text-[10px] text-zinc-400 italic">Not assigned yet</span>
														)}
														{st === "substituted" && (
															<div className="space-y-2">
																{actFac ? (
																	<div className="flex items-center gap-2">
																		<span className="text-xs font-medium text-orange-700 dark:text-orange-300">
																			👨‍🏫 {actFac.full_name}
																		</span>
																		{entry.substitute_reason && (
																			<span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
																				{entry.substitute_reason}
																			</span>
																		)}
																	</div>
																) : (
																	<span className="text-[10px] text-orange-500 italic">⚠️ No substitute assigned yet</span>
																)}
															</div>
														)}
														{(st === "cancelled" || st === "free_period") && (
															<span className="text-[10px] text-zinc-400 italic">N/A</span>
														)}
													</div>
												</div>
											</div>

											{/* Bottom: Actions */}
											{dailyRecord.status !== "completed" && (
												<div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-b-xl">
													<div className="flex items-center gap-2 flex-wrap">
														{st === "as_planned" && (
															<>
																<button
																	onClick={() => handleMarkSubstitute(entry)}
																	disabled={isSaving}
																	className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-3 py-1.5 text-[11px] font-bold text-orange-700 hover:bg-orange-200 transition-colors dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 disabled:opacity-50"
																>
																	🔄 Substitute
																</button>
																<button
																	onClick={() => handleCancel(entry)}
																	disabled={isSaving}
																	className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50"
																>
																	❌ Cancel
																</button>
																<button
																	onClick={() => handleFreePeriod(entry)}
																	disabled={isSaving}
																	className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-[11px] font-bold text-zinc-600 hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50"
																>
																	⬜ Free Period
																</button>
															</>
														)}
														{st === "substituted" && (
															<>
																<button
																	onClick={() => handleMarkSubstitute(entry)}
																	disabled={isSaving}
																	className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-3 py-1.5 text-[11px] font-bold text-orange-700 hover:bg-orange-200 transition-colors dark:bg-orange-900/30 dark:text-orange-400 disabled:opacity-50"
																>
																	🔄 Change Substitute
																</button>
																<button
																	onClick={() => handleRestore(entry)}
																	disabled={isSaving}
																	className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-[11px] font-bold text-green-700 hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400 disabled:opacity-50"
																>
																	↩️ Restore
																</button>
															</>
														)}
														{(st === "cancelled" || st === "free_period") && (
															<button
																onClick={() => handleRestore(entry)}
																disabled={isSaving}
																className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-[11px] font-bold text-green-700 hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400 disabled:opacity-50"
															>
																↩️ Restore Original
															</button>
														)}
													</div>
													{isSaving && (
														<div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
													)}
												</div>
											)}

											{/* ─── SUBSTITUTE ASSIGNMENT PANEL (expanded) ─── */}
											{showReasonModal === entry.id && (
												<div className="border-t-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-4 rounded-b-xl dark:from-orange-950/20 dark:to-amber-950/20 dark:border-orange-800">
													<div className="flex items-center gap-2 mb-3">
														<span className="text-sm">🔄</span>
														<h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">Assign Substitute Teacher</h4>
													</div>

													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
														{/* Faculty picker */}
														<div>
															<label className="block text-[10px] uppercase tracking-wider text-orange-600 font-bold mb-1 dark:text-orange-400">Select Faculty</label>
															<select
																value={entry.actual_faculty_id || ""}
																onChange={(e) => {
																	setDailyEntries((prev) =>
																		prev.map((de) => de.id === entry.id ? { ...de, actual_faculty_id: e.target.value || null } : de)
																	);
																}}
																className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-orange-800 dark:bg-zinc-800 dark:text-white"
															>
																<option value="">— Select substitute teacher —</option>
																{faculty
																	.filter((f) => f.id !== entry.original_faculty_id)
																	.map((f) => (
																		<option key={f.id} value={f.id}>{getFacultyDisplay(f.id)}</option>
																	))}
															</select>
														</div>

														{/* Reason */}
														<div>
															<label className="block text-[10px] uppercase tracking-wider text-orange-600 font-bold mb-1 dark:text-orange-400">Reason (Optional)</label>
															<select
																value={substituteReason}
																onChange={(e) => setSubstituteReason(e.target.value)}
																className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-orange-800 dark:bg-zinc-800 dark:text-white"
															>
																<option value="">— Select reason —</option>
																<option value="Sick Leave">🤒 Sick Leave</option>
																<option value="Casual Leave">🏖️ Casual Leave</option>
																<option value="Training">📚 Training / Workshop</option>
																<option value="Meeting">📋 Meeting</option>
																<option value="Emergency">🚨 Emergency</option>
																<option value="Other">📝 Other</option>
															</select>
														</div>
													</div>

													{/* Custom reason if "Other" */}
													{substituteReason === "Other" && (
														<div className="mb-3">
															<input
																type="text"
																placeholder="Enter custom reason..."
																value=""
																onChange={(e) => setSubstituteReason(e.target.value)}
																className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm dark:border-orange-800 dark:bg-zinc-800 dark:text-white"
															/>
														</div>
													)}

													{/* Confirm / Cancel */}
													<div className="flex items-center gap-2">
														<button
															onClick={() => confirmSubstitute(entry.id, entry.actual_faculty_id, substituteReason)}
															disabled={isSaving}
															className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
														>
															{isSaving ? "Saving..." : "✅ Confirm Substitute"}
														</button>
														<button
															onClick={() => { setShowReasonModal(null); setEditingRow(null); setSubstituteReason(""); }}
															className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
														>
															Cancel
														</button>
													</div>
												</div>
											)}
										</div>
									);
								})}
							</div>

							{/* Stats footer */}
							{dailyEntries.length > 0 && (
								<div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/20">
									<div className="flex flex-wrap gap-4">
										{Object.entries(STATUS_CONFIG).map(([key, config]) => (
											<div key={key} className="flex items-center gap-2">
												<span className={`h-3 w-3 rounded-full ${config.dot}`} />
												<span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{stats[key]}</span>
												<span className="text-[10px] text-zinc-400">{config.label}</span>
											</div>
										))}
										<div className="ml-auto text-[10px] text-zinc-400">
											Total: {dailyEntries.length} periods
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{/* No class selected */}
					{!dailyClassId && (
						<div className="rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
								<span className="text-3xl">🏫</span>
							</div>
							<p className="mt-4 text-sm font-medium text-zinc-500">Select a class above to manage the daily timetable</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
