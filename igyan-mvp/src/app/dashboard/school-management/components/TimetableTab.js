"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../utils/supabase";
import {
	Modal, Badge,
	inputClass, labelClass, cardClass,
	btnPrimary, btnSecondary, btnDanger, btnGhost,
	thClass, tdClass, tdBold, emptyClass,
	alertSuccess, alertError,
} from "./shared";

// ─── CONSTANTS ──────────────────────────────────────────────
const ALL_DAYS = [
	{ name: "Monday", index: 0 },
	{ name: "Tuesday", index: 1 },
	{ name: "Wednesday", index: 2 },
	{ name: "Thursday", index: 3 },
	{ name: "Friday", index: 4 },
	{ name: "Saturday", index: 5 },
];

const SLOT_TYPES = [
	{ value: "period", label: "📖 Period", color: "indigo" },
	{ value: "short_break", label: "☕ Short Break", color: "yellow" },
	{ value: "lunch_break", label: "🍽️ Lunch Break", color: "green" },
];

const SLOT_COLORS = {
	period: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800",
	short_break: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
	lunch_break: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
};

const SLOT_ICONS = { period: "📖", short_break: "☕", lunch_break: "🍽️" };

// Helper: add minutes to a "HH:MM" string
function addMinutes(timeStr, mins) {
	const [h, m] = timeStr.split(":").map(Number);
	const total = h * 60 + m + mins;
	const nh = Math.floor(total / 60) % 24;
	const nm = total % 60;
	return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

// Helper: format "HH:MM" to "h:mm AM/PM"
function fmt12(timeStr) {
	if (!timeStr) return "";
	const [h, m] = timeStr.split(":").map(Number);
	const ampm = h >= 12 ? "PM" : "AM";
	const h12 = h % 12 || 12;
	return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Subject color palette for timetable view
const SUBJECT_COLORS = [
	"bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
	"bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
	"bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
	"bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
	"bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
	"bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
	"bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
	"bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
	"bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
	"bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
];

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function TimetableTab({ schoolId, session, classes, subjects, faculty }) {
	// ─── View mode ───
	const [view, setView] = useState("structure"); // structure | assign | view

	// ─── Template state ───
	const [templates, setTemplates] = useState([]);
	const [activeTemplate, setActiveTemplate] = useState(null);
	const [templateName, setTemplateName] = useState("Default Timetable");
	const [schoolStartTime, setSchoolStartTime] = useState("08:00");

	// ─── Days & Slots (for structure builder) ───
	const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4, 5]); // Mon-Sat
	const [slots, setSlots] = useState([]);
	const [savedDays, setSavedDays] = useState([]);
	const [savedSlots, setSavedSlots] = useState([]);

	// ─── Assignment state ───
	const [selectedClassId, setSelectedClassId] = useState("");
	const [entries, setEntries] = useState({});  // key: `${dayId}_${slotId}` → { subject_id, faculty_id }

	// ─── UI ───
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loadingTemplate, setLoadingTemplate] = useState(true);

	// ════════════════════════════════════════════════════════════
	// FETCH TEMPLATES
	// ════════════════════════════════════════════════════════════
	const fetchTemplates = useCallback(async () => {
		if (!schoolId || !session) return;
		setLoadingTemplate(true);
		try {
			const { data } = await supabase
				.from("timetable_templates")
				.select("*")
				.eq("school_id", schoolId)
				.eq("session_id", session.id)
				.order("created_at", { ascending: false });
			setTemplates(data || []);
			const active = (data || []).find((t) => t.is_active);
			if (active) {
				setActiveTemplate(active);
				setTemplateName(active.template_name);
				setSchoolStartTime(active.school_start_time?.slice(0, 5) || "08:00");
				await fetchDaysAndSlots(active.id);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingTemplate(false);
		}
	}, [schoolId, session]);

	const fetchDaysAndSlots = async (templateId) => {
		const [daysRes, slotsRes] = await Promise.all([
			supabase.from("timetable_days").select("*").eq("template_id", templateId).order("day_index"),
			supabase.from("timetable_slots").select("*").eq("template_id", templateId).order("slot_order"),
		]);
		const days = daysRes.data || [];
		const slotsData = slotsRes.data || [];
		setSavedDays(days);
		setSavedSlots(slotsData);
		setActiveDays(days.filter((d) => d.is_active).map((d) => d.day_index));
		setSlots(
			slotsData.map((s) => ({
				id: s.id,
				slot_type: s.slot_type,
				label: s.label,
				duration: s.duration_minutes,
				start_time: s.start_time?.slice(0, 5),
				end_time: s.end_time?.slice(0, 5),
			}))
		);
	};

	useEffect(() => {
		fetchTemplates();
	}, [fetchTemplates]);

	// ════════════════════════════════════════════════════════════
	// FETCH ENTRIES (for assignment tab)
	// ════════════════════════════════════════════════════════════
	const fetchEntries = useCallback(async () => {
		if (!activeTemplate || !selectedClassId) return;
		const { data } = await supabase
			.from("timetable_entries")
			.select("*")
			.eq("template_id", activeTemplate.id)
			.eq("class_id", selectedClassId);
		const map = {};
		(data || []).forEach((e) => {
			map[`${e.day_id}_${e.slot_id}`] = {
				id: e.id,
				subject_id: e.subject_id || "",
				faculty_id: e.faculty_id || "",
			};
		});
		setEntries(map);
	}, [activeTemplate, selectedClassId]);

	useEffect(() => {
		if (view === "assign" || view === "view") fetchEntries();
	}, [view, fetchEntries]);

	// ════════════════════════════════════════════════════════════
	// SLOT BUILDER HELPERS
	// ════════════════════════════════════════════════════════════
	const recalcTimes = (slotList, startTime) => {
		let cursor = startTime || schoolStartTime;
		return slotList.map((s) => ({
			...s,
			start_time: cursor,
			end_time: addMinutes(cursor, s.duration || 0),
			_cursor: (cursor = addMinutes(cursor, s.duration || 0)),
		}));
	};

	const addSlot = (type = "period") => {
		const periodCount = slots.filter((s) => s.slot_type === "period").length;
		const label =
			type === "period"
				? `Period ${periodCount + 1}`
				: type === "short_break"
				? "Short Break"
				: "Lunch Break";
		const duration = type === "period" ? 45 : type === "short_break" ? 10 : 30;
		const newSlots = [...slots, { slot_type: type, label, duration }];
		setSlots(recalcTimes(newSlots, schoolStartTime));
	};

	const updateSlot = (idx, field, value) => {
		const updated = slots.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
		setSlots(recalcTimes(updated, schoolStartTime));
	};

	const removeSlot = (idx) => {
		const updated = slots.filter((_, i) => i !== idx);
		// Re-label periods
		let pc = 0;
		const relabeled = updated.map((s) => {
			if (s.slot_type === "period") {
				pc++;
				return { ...s, label: `Period ${pc}` };
			}
			return s;
		});
		setSlots(recalcTimes(relabeled, schoolStartTime));
	};

	const moveSlot = (idx, dir) => {
		const arr = [...slots];
		const target = idx + dir;
		if (target < 0 || target >= arr.length) return;
		[arr[idx], arr[target]] = [arr[target], arr[idx]];
		setSlots(recalcTimes(arr, schoolStartTime));
	};

	// Recalc whenever school start time changes
	useEffect(() => {
		if (slots.length > 0) setSlots(recalcTimes([...slots], schoolStartTime));
	}, [schoolStartTime]);

	// ════════════════════════════════════════════════════════════
	// SAVE TEMPLATE STRUCTURE
	// ════════════════════════════════════════════════════════════
	const saveStructure = async () => {
		if (!session) { setError("No active session. Create a session first."); return; }
		if (slots.length === 0) { setError("Add at least one slot to the timetable."); return; }
		if (activeDays.length === 0) { setError("Select at least one school day."); return; }

		setSaving(true);
		setError("");
		setSuccess("");
		try {
			let templateId = activeTemplate?.id;

			// Upsert template
			if (!templateId) {
				const { data: newT, error: tErr } = await supabase
					.from("timetable_templates")
					.insert({
						school_id: schoolId,
						session_id: session.id,
						template_name: templateName,
						school_start_time: schoolStartTime,
						is_active: true,
					})
					.select()
					.single();
				if (tErr) throw tErr;
				templateId = newT.id;
				setActiveTemplate(newT);
			} else {
				await supabase
					.from("timetable_templates")
					.update({ template_name: templateName, school_start_time: schoolStartTime, updated_at: new Date().toISOString() })
					.eq("id", templateId);
			}

			// ── Save Days ──
			// Delete existing and re-insert
			await supabase.from("timetable_days").delete().eq("template_id", templateId);
			const dayRows = ALL_DAYS.map((d) => ({
				template_id: templateId,
				day_name: d.name,
				day_index: d.index,
				is_active: activeDays.includes(d.index),
			}));
			const { data: newDays, error: dayErr } = await supabase
				.from("timetable_days")
				.insert(dayRows)
				.select();
			if (dayErr) throw dayErr;
			setSavedDays(newDays);

			// ── Save Slots ──
			await supabase.from("timetable_slots").delete().eq("template_id", templateId);
			const slotRows = slots.map((s, i) => ({
				template_id: templateId,
				slot_order: i + 1,
				slot_type: s.slot_type,
				label: s.label,
				start_time: s.start_time,
				end_time: s.end_time,
				duration_minutes: s.duration,
			}));
			const { data: newSlots, error: slotErr } = await supabase
				.from("timetable_slots")
				.insert(slotRows)
				.select();
			if (slotErr) throw slotErr;
			setSavedSlots(newSlots);

			// Update local slots with saved IDs
			setSlots(
				newSlots.map((s) => ({
					id: s.id,
					slot_type: s.slot_type,
					label: s.label,
					duration: s.duration_minutes,
					start_time: s.start_time?.slice(0, 5),
					end_time: s.end_time?.slice(0, 5),
				}))
			);

			setSuccess("Timetable structure saved successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			console.error(err);
			setError(err.message || "Failed to save structure");
		} finally {
			setSaving(false);
		}
	};

	// ════════════════════════════════════════════════════════════
	// SAVE ASSIGNMENT ENTRY (single cell)
	// ════════════════════════════════════════════════════════════
	const saveEntry = async (dayId, slotId, subjectId, facultyId) => {
		if (!activeTemplate || !selectedClassId) return;
		const key = `${dayId}_${slotId}`;
		try {
			const existing = entries[key];
			if (existing?.id) {
				await supabase
					.from("timetable_entries")
					.update({ subject_id: subjectId || null, faculty_id: facultyId || null, updated_at: new Date().toISOString() })
					.eq("id", existing.id);
				setEntries((prev) => ({ ...prev, [key]: { ...prev[key], subject_id: subjectId, faculty_id: facultyId } }));
			} else {
				const { data, error: insErr } = await supabase
					.from("timetable_entries")
					.insert({
						template_id: activeTemplate.id,
						slot_id: slotId,
						day_id: dayId,
						class_id: selectedClassId,
						subject_id: subjectId || null,
						faculty_id: facultyId || null,
					})
					.select()
					.single();
				if (insErr) throw insErr;
				setEntries((prev) => ({ ...prev, [key]: { id: data.id, subject_id: subjectId, faculty_id: facultyId } }));
			}
		} catch (err) {
			console.error("Failed to save entry:", err);
			setError("Failed to save. Please try again.");
			setTimeout(() => setError(""), 2000);
		}
	};

	// ════════════════════════════════════════════════════════════
	// DERIVED DATA
	// ════════════════════════════════════════════════════════════
	const periodSlots = savedSlots.filter((s) => s.slot_type === "period");
	const activeSavedDays = savedDays.filter((d) => d.is_active).sort((a, b) => a.day_index - b.day_index);
	const selectedClassName = classes.find((c) => c.id === selectedClassId);

	// Subject color map
	const subjectColorMap = {};
	subjects.forEach((s, i) => { subjectColorMap[s.id] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]; });

	// ════════════════════════════════════════════════════════════
	// LOADING
	// ════════════════════════════════════════════════════════════
	if (loadingTemplate) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="flex flex-col items-center gap-3">
					<div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
					<p className="text-sm text-zinc-500">Loading Timetable...</p>
				</div>
			</div>
		);
	}

	// ════════════════════════════════════════════════════════════
	// RENDER
	// ════════════════════════════════════════════════════════════
	return (
		<div className="space-y-6">
			{error && <div className={alertError}>⚠️ {error}</div>}
			{success && <div className={alertSuccess}>✅ {success}</div>}

			{/* ── VIEW SWITCHER ── */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">🕐 Timetable Management</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						{activeTemplate ? `Template: ${activeTemplate.template_name}` : "Create a new timetable structure"}
					</p>
				</div>
				<div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
					{[
						{ key: "structure", label: "🏗️ Structure", desc: "Build Day" },
						{ key: "assign", label: "📝 Assign", desc: "Subjects & Teachers" },
						{ key: "view", label: "👁️ View", desc: "Full Timetable" },
					].map((tab) => (
						<button
							key={tab.key}
							onClick={() => {
								if ((tab.key === "assign" || tab.key === "view") && !activeTemplate) {
									setError("Save the timetable structure first before assigning.");
									return;
								}
								setView(tab.key);
							}}
							className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
								view === tab.key
									? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
									: "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
							}`}
						>
							<span className="block">{tab.label}</span>
							<span className="block text-[10px] opacity-60">{tab.desc}</span>
						</button>
					))}
				</div>
			</div>

			{/* ════════════════════════════════════════════════════════ */}
			{/* STRUCTURE VIEW                                          */}
			{/* ════════════════════════════════════════════════════════ */}
			{view === "structure" && (
				<div className="space-y-6">
					{/* Template Info */}
					<div className={cardClass}>
						<h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">📋 Template Settings</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div>
								<label className={labelClass}>Template Name</label>
								<input
									type="text"
									value={templateName}
									onChange={(e) => setTemplateName(e.target.value)}
									className={inputClass}
									placeholder="e.g. Default Timetable"
								/>
							</div>
							<div>
								<label className={labelClass}>School Start Time</label>
								<input
									type="time"
									value={schoolStartTime}
									onChange={(e) => setSchoolStartTime(e.target.value)}
									className={inputClass}
								/>
							</div>
							<div>
								<label className={labelClass}>Session</label>
								<div className="flex h-[42px] items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
									{session?.session_name || "No session"}
								</div>
							</div>
						</div>
					</div>

					{/* Active Days */}
					<div className={cardClass}>
						<h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">📅 School Days</h3>
						<div className="flex flex-wrap gap-3">
							{ALL_DAYS.map((d) => {
								const active = activeDays.includes(d.index);
								return (
									<button
										key={d.index}
										onClick={() =>
											setActiveDays((prev) =>
												active ? prev.filter((i) => i !== d.index) : [...prev, d.index].sort()
											)
										}
										className={`rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-all ${
											active
												? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
												: "border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
										}`}
									>
										{d.name.slice(0, 3)}
									</button>
								);
							})}
						</div>
						<p className="mt-2 text-xs text-zinc-400">
							{activeDays.length} day{activeDays.length !== 1 ? "s" : ""} selected
						</p>
					</div>

					{/* Slot Builder */}
					<div className={cardClass}>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">🧱 Day Structure</h3>
							<div className="flex gap-2">
								{SLOT_TYPES.map((st) => (
									<button
										key={st.value}
										onClick={() => addSlot(st.value)}
										className={btnSecondary + " text-xs"}
									>
										{st.label}
									</button>
								))}
							</div>
						</div>

						{slots.length === 0 ? (
							<div className="rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
								<span className="text-4xl">🕐</span>
								<p className="mt-3 text-sm text-zinc-500">No slots yet. Add periods and breaks above.</p>
								<p className="text-xs text-zinc-400 mt-1">
									Start with a Period, then add breaks between them as needed.
								</p>
							</div>
						) : (
							<div className="space-y-2">
								{/* Timeline header */}
								<div className="flex items-center gap-2 px-2 pb-2 text-xs font-medium text-zinc-400">
									<span className="w-8">#</span>
									<span className="w-24">Time</span>
									<span className="flex-1">Slot</span>
									<span className="w-20 text-center">Duration</span>
									<span className="w-48 text-center">Label</span>
									<span className="w-24 text-right">Actions</span>
								</div>

								{slots.map((slot, idx) => (
									<div
										key={idx}
										className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all ${SLOT_COLORS[slot.slot_type]}`}
									>
										{/* Order */}
										<span className="w-8 text-xs font-bold text-zinc-400">{idx + 1}</span>

										{/* Time */}
										<span className="w-24 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
											{fmt12(slot.start_time)} – {fmt12(slot.end_time)}
										</span>

										{/* Type badge */}
										<div className="flex-1">
											<select
												value={slot.slot_type}
												onChange={(e) => {
													updateSlot(idx, "slot_type", e.target.value);
													// Re-label
													if (e.target.value === "short_break") updateSlot(idx, "label", "Short Break");
													else if (e.target.value === "lunch_break") updateSlot(idx, "label", "Lunch Break");
												}}
												className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
											>
												{SLOT_TYPES.map((st) => (
													<option key={st.value} value={st.value}>{st.label}</option>
												))}
											</select>
										</div>

										{/* Duration */}
										<div className="w-20 flex items-center justify-center gap-1">
											<input
												type="number"
												min="5"
												max="120"
												value={slot.duration}
												onChange={(e) => updateSlot(idx, "duration", parseInt(e.target.value) || 5)}
												className="w-14 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
											/>
											<span className="text-[10px] text-zinc-400">min</span>
										</div>

										{/* Label */}
										<div className="w-48 text-center">
											<input
												type="text"
												value={slot.label}
												onChange={(e) => updateSlot(idx, "label", e.target.value)}
												className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
											/>
										</div>

										{/* Actions */}
										<div className="w-24 flex items-center justify-end gap-1">
											<button onClick={() => moveSlot(idx, -1)} disabled={idx === 0} className="rounded p-1 text-xs hover:bg-white/60 disabled:opacity-30">↑</button>
											<button onClick={() => moveSlot(idx, 1)} disabled={idx === slots.length - 1} className="rounded p-1 text-xs hover:bg-white/60 disabled:opacity-30">↓</button>
											<button onClick={() => removeSlot(idx)} className="rounded p-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">✕</button>
										</div>
									</div>
								))}

								{/* Summary */}
								<div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
									<div className="text-xs">
										<span className="text-zinc-400">Total Periods:</span>{" "}
										<span className="font-bold text-indigo-600 dark:text-indigo-400">{slots.filter((s) => s.slot_type === "period").length}</span>
									</div>
									<div className="text-xs">
										<span className="text-zinc-400">Breaks:</span>{" "}
										<span className="font-bold text-amber-600 dark:text-amber-400">{slots.filter((s) => s.slot_type !== "period").length}</span>
									</div>
									<div className="text-xs">
										<span className="text-zinc-400">School Hours:</span>{" "}
										<span className="font-bold text-zinc-700 dark:text-zinc-300">
											{fmt12(schoolStartTime)} – {slots.length > 0 ? fmt12(slots[slots.length - 1].end_time) : "—"}
										</span>
									</div>
									<div className="text-xs">
										<span className="text-zinc-400">Teaching Time:</span>{" "}
										<span className="font-bold text-emerald-600 dark:text-emerald-400">
											{slots.filter((s) => s.slot_type === "period").reduce((a, s) => a + s.duration, 0)} min
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Day Preview */}
					{slots.length > 0 && (
						<div className={cardClass}>
							<h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">👀 Day Preview</h3>
							<div className="flex gap-1 overflow-x-auto pb-2">
								{slots.map((slot, idx) => (
									<div
										key={idx}
										className={`shrink-0 rounded-lg border px-3 py-2 text-center ${SLOT_COLORS[slot.slot_type]}`}
										style={{ minWidth: Math.max(60, slot.duration * 1.5) }}
									>
										<div className="text-sm">{SLOT_ICONS[slot.slot_type]}</div>
										<div className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">{slot.label}</div>
										<div className="text-[9px] text-zinc-400">{fmt12(slot.start_time)}</div>
										<div className="text-[9px] text-zinc-400">{slot.duration}m</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Save Button */}
					<div className="flex justify-end">
						<button onClick={saveStructure} disabled={saving} className={btnPrimary}>
							{saving ? (
								<>
									<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
									</svg>
									Saving...
								</>
							) : (
								<>💾 Save Timetable Structure</>
							)}
						</button>
					</div>
				</div>
			)}

			{/* ════════════════════════════════════════════════════════ */}
			{/* ASSIGN VIEW                                             */}
			{/* ════════════════════════════════════════════════════════ */}
			{view === "assign" && activeTemplate && (
				<div className="space-y-6">
					{/* Class Selector */}
					<div className={cardClass}>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
							<div className="flex-1">
								<label className={labelClass}>Select Class to Assign</label>
								<select
									value={selectedClassId}
									onChange={(e) => setSelectedClassId(e.target.value)}
									className={inputClass}
								>
									<option value="">— Choose a class —</option>
									{classes.map((c) => (
										<option key={c.id} value={c.id}>
											{c.class_name} - {c.section}
										</option>
									))}
								</select>
							</div>
							{selectedClassName && (
								<Badge color="indigo">
									{selectedClassName.class_name} - {selectedClassName.section}
								</Badge>
							)}
						</div>
					</div>

					{/* Assignment Grid */}
					{selectedClassId && activeSavedDays.length > 0 && periodSlots.length > 0 ? (
						<div className={cardClass + " overflow-x-auto"}>
							<h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
								📝 Assign Subjects & Teachers — {selectedClassName?.class_name}-{selectedClassName?.section}
							</h3>

							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-zinc-200 dark:border-zinc-700">
										<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Period</th>
										<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Time</th>
										{activeSavedDays.map((day) => (
											<th key={day.id} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
												{day.day_name.slice(0, 3)}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{savedSlots.map((slot) => {
										const isPeriod = slot.slot_type === "period";
										return (
											<tr
												key={slot.id}
												className={
													isPeriod
														? "border-b border-zinc-100 dark:border-zinc-800"
														: "border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30"
												}
											>
												<td className="px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
													{SLOT_ICONS[slot.slot_type]} {slot.label}
												</td>
												<td className="px-3 py-2 text-[10px] font-mono text-zinc-400 whitespace-nowrap">
													{fmt12(slot.start_time?.slice(0, 5))} – {fmt12(slot.end_time?.slice(0, 5))}
												</td>
												{activeSavedDays.map((day) => {
													if (!isPeriod) {
														return (
															<td key={day.id} className="px-2 py-2 text-center">
																<span className="text-[10px] text-zinc-300 dark:text-zinc-600">—</span>
															</td>
														);
													}
													const key = `${day.id}_${slot.id}`;
													const entry = entries[key] || {};
													return (
														<td key={day.id} className="px-1 py-1.5">
															<div className="space-y-1">
																<select
																	value={entry.subject_id || ""}
																	onChange={(e) => {
																		const subId = e.target.value;
																		setEntries((prev) => ({
																			...prev,
																			[key]: { ...prev[key], subject_id: subId },
																		}));
																		saveEntry(day.id, slot.id, subId, entry.faculty_id || "");
																	}}
																	className="w-full rounded-md border border-zinc-200 bg-white px-1.5 py-1 text-[11px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																>
																	<option value="">Subject</option>
																	{subjects.map((s) => (
																		<option key={s.id} value={s.id}>{s.subject_name}</option>
																	))}
																</select>
																<select
																	value={entry.faculty_id || ""}
																	onChange={(e) => {
																		const facId = e.target.value;
																		setEntries((prev) => ({
																			...prev,
																			[key]: { ...prev[key], faculty_id: facId },
																		}));
																		saveEntry(day.id, slot.id, entry.subject_id || "", facId);
																	}}
																	className="w-full rounded-md border border-zinc-200 bg-white px-1.5 py-1 text-[11px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																>
																	<option value="">Teacher</option>
																	{faculty.map((f) => (
																		<option key={f.id} value={f.id}>{f.full_name}</option>
																	))}
																</select>
															</div>
														</td>
													);
												})}
											</tr>
										);
									})}
								</tbody>
							</table>

							<p className="mt-3 text-[11px] text-zinc-400">
								💡 Changes save automatically as you select. No save button needed.
							</p>
						</div>
					) : !selectedClassId ? (
						<div className="rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
							<span className="text-4xl">🏫</span>
							<p className="mt-3 text-sm text-zinc-500">Select a class above to start assigning subjects & teachers.</p>
						</div>
					) : (
						<div className="rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
							<span className="text-4xl">⚠️</span>
							<p className="mt-3 text-sm text-zinc-500">No days or period slots found. Please save the timetable structure first.</p>
						</div>
					)}
				</div>
			)}

			{/* ════════════════════════════════════════════════════════ */}
			{/* VIEW MODE                                               */}
			{/* ════════════════════════════════════════════════════════ */}
			{view === "view" && activeTemplate && (
				<div className="space-y-6">
					{/* Class Selector */}
					<div className={cardClass}>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
							<div className="flex-1">
								<label className={labelClass}>View Timetable for Class</label>
								<select
									value={selectedClassId}
									onChange={(e) => setSelectedClassId(e.target.value)}
									className={inputClass}
								>
									<option value="">— Choose a class —</option>
									{classes.map((c) => (
										<option key={c.id} value={c.id}>
											{c.class_name} - {c.section}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{selectedClassId && activeSavedDays.length > 0 ? (
						<div className={cardClass + " overflow-x-auto"}>
							<div className="mb-4 flex items-center justify-between">
								<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
									📅 {selectedClassName?.class_name}-{selectedClassName?.section} — Weekly Timetable
								</h3>
								<Badge color="indigo">{session?.session_name}</Badge>
							</div>

							<table className="w-full border-collapse">
								<thead>
									<tr>
										<th className="rounded-tl-xl bg-indigo-600 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">
											Time / Day
										</th>
										{activeSavedDays.map((day, i) => (
											<th
												key={day.id}
												className={`bg-indigo-600 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white ${
													i === activeSavedDays.length - 1 ? "rounded-tr-xl" : ""
												}`}
											>
												{day.day_name}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{savedSlots.map((slot, sIdx) => {
										const isPeriod = slot.slot_type === "period";
										const isLast = sIdx === savedSlots.length - 1;
										return (
											<tr key={slot.id}>
												<td
													className={`border-b border-l border-zinc-200 px-4 py-3 dark:border-zinc-700 ${
														isLast ? "rounded-bl-xl" : ""
													} ${!isPeriod ? "bg-zinc-50 dark:bg-zinc-800/40" : ""}`}
												>
													<div className="flex items-center gap-2">
														<span>{SLOT_ICONS[slot.slot_type]}</span>
														<div>
															<div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{slot.label}</div>
															<div className="text-[10px] text-zinc-400">
																{fmt12(slot.start_time?.slice(0, 5))} – {fmt12(slot.end_time?.slice(0, 5))}
															</div>
														</div>
													</div>
												</td>
												{activeSavedDays.map((day, dIdx) => {
													if (!isPeriod) {
														return (
															<td
																key={day.id}
																className={`border-b border-r border-zinc-200 px-3 py-3 text-center dark:border-zinc-700 ${
																	isLast && dIdx === activeSavedDays.length - 1 ? "rounded-br-xl" : ""
																} bg-zinc-50 dark:bg-zinc-800/40`}
															>
																<span className="text-xs text-zinc-300 italic dark:text-zinc-600">
																	{slot.slot_type === "lunch_break" ? "🍽️ Lunch" : "☕ Break"}
																</span>
															</td>
														);
													}
													const key = `${day.id}_${slot.id}`;
													const entry = entries[key];
													const subj = entry?.subject_id ? subjects.find((s) => s.id === entry.subject_id) : null;
													const teach = entry?.faculty_id ? faculty.find((f) => f.id === entry.faculty_id) : null;
													const colorCls = subj ? subjectColorMap[subj.id] : "";

													return (
														<td
															key={day.id}
															className={`border-b border-r border-zinc-200 px-2 py-2 dark:border-zinc-700 ${
																isLast && dIdx === activeSavedDays.length - 1 ? "rounded-br-xl" : ""
															}`}
														>
															{subj ? (
																<div className={`rounded-lg px-2 py-1.5 text-center ${colorCls}`}>
																	<div className="text-xs font-bold">{subj.subject_name}</div>
																	{teach && (
																		<div className="mt-0.5 text-[10px] opacity-75">{teach.full_name}</div>
																	)}
																</div>
															) : (
																<div className="rounded-lg bg-zinc-50 px-2 py-2 text-center text-[10px] text-zinc-300 dark:bg-zinc-800/30 dark:text-zinc-600">
																	Not Assigned
																</div>
															)}
														</td>
													);
												})}
											</tr>
										);
									})}
								</tbody>
							</table>

							{/* Legend */}
							<div className="mt-4 flex flex-wrap gap-2">
								{subjects
									.filter((s) => {
										return Object.values(entries).some((e) => e.subject_id === s.id);
									})
									.map((s) => (
										<span key={s.id} className={`rounded-full px-3 py-1 text-[10px] font-semibold ${subjectColorMap[s.id]}`}>
											{s.subject_name}
										</span>
									))}
							</div>
						</div>
					) : !selectedClassId ? (
						<div className="rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
							<span className="text-4xl">👁️</span>
							<p className="mt-3 text-sm text-zinc-500">Select a class to view its complete timetable.</p>
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
