"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Modal, Badge, StatCard, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, btnDanger, btnGhost, thClass, tdClass, tdBold, emptyClass, alertSuccess, alertError } from "./shared";

export default function AddStudentsTab({ schoolId, onRefresh }) {
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [allStudents, setAllStudents] = useState([]);
	const [loadingStudents, setLoadingStudents] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewStudent, setViewStudent] = useState(null);

	const [form, setForm] = useState({
		full_name: "", email: "", phone: "", password: "", age: "", class: "", section: "",
		house: "", class_teacher: "", sleep_time: "", study_schedule_weekday: "", study_schedule_weekend: "",
		learning_style: "", fun_fact: "", interests: "", strengths: "", growth_areas: "", academic_goals: "", favorite_subjects: "",
	});

	const resetForm = () => setForm({
		full_name: "", email: "", phone: "", password: "", age: "", class: "", section: "",
		house: "", class_teacher: "", sleep_time: "", study_schedule_weekday: "", study_schedule_weekend: "",
		learning_style: "", fun_fact: "", interests: "", strengths: "", growth_areas: "", academic_goals: "", favorite_subjects: "",
	});

	useEffect(() => {
		fetchAllStudents();
	}, [schoolId]);

	const fetchAllStudents = async () => {
		setLoadingStudents(true);
		try {
			const { data } = await supabase
				.from("users")
				.select("id, full_name, email, phone, created_at")
				.eq("school_id", schoolId)
				.eq("role", "student")
				.order("created_at", { ascending: false });

			const userIds = (data || []).map((u) => u.id);
			let profiles = [];
			if (userIds.length) {
				const { data: profData } = await supabase
					.from("student_profiles")
					.select("*")
					.in("user_id", userIds);
				profiles = profData || [];
			}

			const merged = (data || []).map((u) => ({
				...u,
				profile: profiles.find((p) => p.user_id === u.id) || null,
			}));
			setAllStudents(merged);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingStudents(false);
		}
	};

	const hashPassword = async (password) => {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	};

	const handleAddStudent = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");
		try {
			const passwordHash = await hashPassword(form.password);

			const { data: newUser, error: userErr } = await supabase.from("users").insert([{
				email: form.email.trim().toLowerCase(),
				password_hash: passwordHash,
				full_name: form.full_name.trim(),
				phone: form.phone || null,
				school_id: schoolId,
				role: "student",
			}]).select("id").single();
			if (userErr) throw userErr;

			const toArray = (str) => str ? str.split(",").map((s) => s.trim()).filter(Boolean) : null;

			const { error: profileErr } = await supabase.from("student_profiles").insert([{
				user_id: newUser.id,
				name: form.full_name.trim(),
				school_id: schoolId,
				age: form.age ? parseInt(form.age) : null,
				class: form.class || null,
				section: form.section || null,
				house: form.house || null,
				class_teacher: form.class_teacher || null,
				sleep_time: form.sleep_time || null,
				study_schedule_weekday: form.study_schedule_weekday || null,
				study_schedule_weekend: form.study_schedule_weekend || null,
				learning_style: form.learning_style || null,
				fun_fact: form.fun_fact || null,
				interests: toArray(form.interests),
				strengths: toArray(form.strengths),
				growth_areas: toArray(form.growth_areas),
				academic_goals: toArray(form.academic_goals),
				favorite_subjects: toArray(form.favorite_subjects),
			}]);
			if (profileErr) console.warn("Profile insert warning:", profileErr.message);

			setSuccess(`Student "${form.full_name}" created successfully!`);
			resetForm();
			setShowModal(false);
			fetchAllStudents();
			onRefresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteStudent = async (userId) => {
		if (!confirm("Delete this student? This will remove their account and all associated data.")) return;
		try {
			await supabase.from("student_profiles").delete().eq("user_id", userId);
			await supabase.from("class_students").delete().eq("student_id", userId);
			await supabase.from("users").delete().eq("id", userId);
			fetchAllStudents();
			onRefresh();
		} catch (err) {
			console.error(err);
		}
	};

	const filtered = allStudents.filter((s) =>
		s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		s.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Student Directory</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Register new students and manage existing ones</p>
				</div>
				<button onClick={() => { setShowModal(true); resetForm(); setError(""); }} className={btnPrimary}>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
					Add New Student
				</button>
			</div>

			{success && <div className={alertSuccess}><span>✓</span> {success}</div>}

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<StatCard icon="🎓" label="Total Students" value={allStudents.length} color="indigo" />
				<StatCard icon="📋" label="With Profiles" value={allStudents.filter((s) => s.profile).length} color="emerald" />
				<StatCard icon="📧" label="Registered Today" value={allStudents.filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString()).length} color="sky" />
			</div>

			<div className="relative">
				<svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
				<input
					type="text"
					placeholder="Search students by name or email..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
				/>
			</div>

			<div className={cardClass + " p-0! overflow-hidden"}>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
							<tr>
								<th className={thClass}>#</th>
								<th className={thClass}>Student</th>
								<th className={thClass}>Contact</th>
								<th className={thClass}>Class / Section</th>
								<th className={thClass}>Profile</th>
								<th className={thClass}>Registered</th>
								<th className={thClass + " text-right"}>Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{loadingStudents ? (
								<tr><td colSpan={7} className={emptyClass}>
									<div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
								</td></tr>
							) : filtered.length === 0 ? (
								<tr><td colSpan={7} className={emptyClass}>
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">🎓</div>
									{searchQuery ? "No students match your search." : "No students registered yet."}
								</td></tr>
							) : filtered.map((s, i) => (
								<tr key={s.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
									<td className={tdClass + " text-zinc-400 font-mono text-xs"}>{i + 1}</td>
									<td className={tdBold}>
										<div className="flex items-center gap-3">
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
												{s.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
											</div>
											<div>
												<p className="font-medium text-zinc-900 dark:text-white">{s.full_name}</p>
												<p className="text-xs text-zinc-400">{s.email}</p>
											</div>
										</div>
									</td>
									<td className={tdClass}>{s.phone || "—"}</td>
									<td className={tdClass}>
										{s.profile?.class ? (
											<Badge color="indigo">{s.profile.class}{s.profile.section ? `-${s.profile.section}` : ""}</Badge>
										) : <span className="text-zinc-400">—</span>}
									</td>
									<td className={tdClass}>
										<Badge color={s.profile ? "green" : "zinc"}>{s.profile ? "Complete" : "Pending"}</Badge>
									</td>
									<td className={tdClass + " text-xs"}>{new Date(s.created_at).toLocaleDateString()}</td>
									<td className={tdClass + " text-right"}>
										<div className="flex items-center justify-end gap-1">
											{s.profile && (
												<button onClick={() => setViewStudent(s)} className={btnGhost}>View</button>
											)}
											<button onClick={() => handleDeleteStudent(s.id)} className={btnDanger}>Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add Student Modal */}
			<Modal open={showModal} onClose={() => { setShowModal(false); setError(""); }} title="Register New Student" maxWidth="max-w-3xl">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleAddStudent} className="space-y-6">
					<div>
						<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">1</span>
							Account Information
						</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
								<input type="text" placeholder="Student's full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} required />
							</div>
							<div>
								<label className={labelClass}>Email <span className="text-red-500">*</span></label>
								<input type="email" placeholder="student@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
							</div>
							<div>
								<label className={labelClass}>Phone</label>
								<input type="text" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Password <span className="text-red-500">*</span></label>
								<input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} required minLength={6} />
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">2</span>
							Academic Details
						</h3>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div>
								<label className={labelClass}>Age</label>
								<input type="number" placeholder="15" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputClass} min={3} max={25} />
							</div>
							<div>
								<label className={labelClass}>Class</label>
								<input type="text" placeholder="e.g. 10" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Section</label>
								<input type="text" placeholder="e.g. A" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>House</label>
								<input type="text" placeholder="e.g. Blue" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} className={inputClass} />
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">3</span>
							Learning Profile <span className="text-xs font-normal text-zinc-400">(Optional)</span>
						</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label className={labelClass}>Class Teacher</label>
								<input type="text" placeholder="Teacher's name" value={form.class_teacher} onChange={(e) => setForm({ ...form, class_teacher: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Learning Style</label>
								<select value={form.learning_style} onChange={(e) => setForm({ ...form, learning_style: e.target.value })} className={inputClass}>
									<option value="">Select style</option>
									<option value="Visual">Visual</option>
									<option value="Auditory">Auditory</option>
									<option value="Reading/Writing">Reading/Writing</option>
									<option value="Kinesthetic">Kinesthetic</option>
									<option value="Mixed">Mixed</option>
								</select>
							</div>
							<div>
								<label className={labelClass}>Interests <span className="text-xs text-zinc-400">(comma-separated)</span></label>
								<input type="text" placeholder="e.g. Cricket, Art, Science" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Strengths <span className="text-xs text-zinc-400">(comma-separated)</span></label>
								<input type="text" placeholder="e.g. Math, Leadership" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Favorite Subjects <span className="text-xs text-zinc-400">(comma-separated)</span></label>
								<input type="text" placeholder="e.g. Physics, Music" value={form.favorite_subjects} onChange={(e) => setForm({ ...form, favorite_subjects: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Academic Goals <span className="text-xs text-zinc-400">(comma-separated)</span></label>
								<input type="text" placeholder="e.g. Score 90%, Win quiz" value={form.academic_goals} onChange={(e) => setForm({ ...form, academic_goals: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Growth Areas <span className="text-xs text-zinc-400">(comma-separated)</span></label>
								<input type="text" placeholder="e.g. Time management" value={form.growth_areas} onChange={(e) => setForm({ ...form, growth_areas: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Fun Fact</label>
								<input type="text" placeholder="Something fun about the student" value={form.fun_fact} onChange={(e) => setForm({ ...form, fun_fact: e.target.value })} className={inputClass} />
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">4</span>
							Routine <span className="text-xs font-normal text-zinc-400">(Optional)</span>
						</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div>
								<label className={labelClass}>Sleep Time</label>
								<input type="text" placeholder="e.g. 10:00 PM" value={form.sleep_time} onChange={(e) => setForm({ ...form, sleep_time: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Study (Weekday)</label>
								<input type="text" placeholder="e.g. 4-6 PM" value={form.study_schedule_weekday} onChange={(e) => setForm({ ...form, study_schedule_weekday: e.target.value })} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>Study (Weekend)</label>
								<input type="text" placeholder="e.g. 10 AM - 12 PM" value={form.study_schedule_weekend} onChange={(e) => setForm({ ...form, study_schedule_weekend: e.target.value })} className={inputClass} />
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Creating..." : "Register Student"}</button>
					</div>
				</form>
			</Modal>

			{/* View Student Profile Modal */}
			<Modal open={!!viewStudent} onClose={() => setViewStudent(null)} title={`Student Profile — ${viewStudent?.full_name || ""}`} maxWidth="max-w-xl">
				{viewStudent?.profile && (
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400 to-purple-500 text-xl font-bold text-white">
								{viewStudent.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
							</div>
							<div>
								<h3 className="text-lg font-bold text-zinc-900 dark:text-white">{viewStudent.full_name}</h3>
								<p className="text-sm text-zinc-500">{viewStudent.email}</p>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							{[
								{ label: "Class", value: `${viewStudent.profile.class || "—"}${viewStudent.profile.section ? ` - ${viewStudent.profile.section}` : ""}` },
								{ label: "Age", value: viewStudent.profile.age || "—" },
								{ label: "House", value: viewStudent.profile.house || "—" },
								{ label: "Class Teacher", value: viewStudent.profile.class_teacher || "—" },
								{ label: "Learning Style", value: viewStudent.profile.learning_style || "—" },
								{ label: "Sleep Time", value: viewStudent.profile.sleep_time || "—" },
							].map((item) => (
								<div key={item.label} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
									<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</p>
									<p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">{item.value}</p>
								</div>
							))}
						</div>
						{[
							{ label: "Interests", data: viewStudent.profile.interests, color: "indigo" },
							{ label: "Strengths", data: viewStudent.profile.strengths, color: "green" },
							{ label: "Favorite Subjects", data: viewStudent.profile.favorite_subjects, color: "purple" },
							{ label: "Academic Goals", data: viewStudent.profile.academic_goals, color: "blue" },
							{ label: "Growth Areas", data: viewStudent.profile.growth_areas, color: "yellow" },
						].filter((a) => a.data?.length).map((arr) => (
							<div key={arr.label}>
								<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">{arr.label}</p>
								<div className="flex flex-wrap gap-1.5">
									{arr.data.map((item, i) => <Badge key={i} color={arr.color}>{item}</Badge>)}
								</div>
							</div>
						))}
						{viewStudent.profile.fun_fact && (
							<div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
								<p className="text-xs font-medium text-amber-600 dark:text-amber-400">🎉 Fun Fact</p>
								<p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">{viewStudent.profile.fun_fact}</p>
							</div>
						)}
					</div>
				)}
			</Modal>
		</div>
	);
}
