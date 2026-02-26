"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Modal, Badge, StatCard, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, btnDanger, btnGhost, thClass, tdClass, tdBold, emptyClass, alertSuccess, alertError } from "./shared";

export default function AddStudentsTab({ schoolId, classes = [], session, onRefresh }) {
const [showModal, setShowModal] = useState(false);
const [showBulkModal, setShowBulkModal] = useState(false);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [allStudents, setAllStudents] = useState([]);
const [loadingStudents, setLoadingStudents] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [viewStudent, setViewStudent] = useState(null);
const [filterClassId, setFilterClassId] = useState("");
const [bulkCsv, setBulkCsv] = useState("");
const [bulkClassId, setBulkClassId] = useState("");
const [bulkResults, setBulkResults] = useState(null);
const [bulkSaving, setBulkSaving] = useState(false);

const [form, setForm] = useState({
full_name: "", email: "", phone: "", password: "", class_id: "",
roll_number: "", age: "", house: "", learning_style: "",
interests: "", strengths: "", growth_areas: "", academic_goals: "", favorite_subjects: "", fun_fact: "",
});

const resetForm = () => setForm({
full_name: "", email: "", phone: "", password: "", class_id: "",
roll_number: "", age: "", house: "", learning_style: "",
interests: "", strengths: "", growth_areas: "", academic_goals: "", favorite_subjects: "", fun_fact: "",
});

useEffect(() => { if (schoolId) fetchAllStudents(); }, [schoolId, filterClassId]);

const fetchAllStudents = async () => {
setLoadingStudents(true);
try {
const { data: studentsData } = await supabase.from("users").select("id, full_name, email, phone, created_at").eq("school_id", schoolId).eq("role", "student").order("full_name");
const userIds = (studentsData || []).map((u) => u.id);

let enrollments = [];
if (userIds.length > 0 && session) {
const { data: enrollData } = await supabase.from("class_students").select("student_id, class_id, roll_number, classes(id, class_name, section)").in("student_id", userIds).eq("session_id", session.id).eq("status", "active");
enrollments = enrollData || [];
}

let profiles = [];
if (userIds.length > 0) {
const { data: profData } = await supabase.from("student_profiles").select("*").in("user_id", userIds);
profiles = profData || [];
}

let merged = (studentsData || []).map((u) => {
const enrollment = enrollments.find((e) => e.student_id === u.id);
return {
...u,
profile: profiles.find((p) => p.user_id === u.id) || null,
enrollment,
className: enrollment?.classes ? enrollment.classes.class_name + "-" + enrollment.classes.section : null,
classId: enrollment?.class_id || null,
rollNumber: enrollment?.roll_number || null,
};
});

if (filterClassId) merged = merged.filter((s) => s.classId === filterClassId);
setAllStudents(merged);
} catch (err) { console.error(err); }
finally { setLoadingStudents(false); }
};

const hashPassword = async (password) => {
const encoder = new TextEncoder();
const data = encoder.encode(password);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const handleAddStudent = async (e) => {
e.preventDefault();
setSaving(true); setError(""); setSuccess("");
try {
const passwordHash = await hashPassword(form.password);
const { data: newUser, error: userErr } = await supabase.from("users").insert([{
email: form.email.trim().toLowerCase(), password_hash: passwordHash,
full_name: form.full_name.trim(), phone: form.phone || null,
school_id: schoolId, role: "student",
}]).select("id").single();
if (userErr) throw userErr;

if (form.class_id && session) {
const { error: enrollErr } = await supabase.from("class_students").insert([{
school_id: schoolId, class_id: form.class_id, student_id: newUser.id,
session_id: session.id, roll_number: form.roll_number || null,
}]);
if (enrollErr) console.warn("Enrollment warning:", enrollErr.message);
}

const selectedClass = classes.find((c) => c.id === form.class_id);
const toArray = (str) => str ? str.split(",").map((s) => s.trim()).filter(Boolean) : null;
await supabase.from("student_profiles").insert([{
user_id: newUser.id, name: form.full_name.trim(), school_id: schoolId,
age: form.age ? parseInt(form.age) : null,
class: selectedClass?.class_name || null, section: selectedClass?.section || null,
house: form.house || null, learning_style: form.learning_style || null, fun_fact: form.fun_fact || null,
interests: toArray(form.interests), strengths: toArray(form.strengths),
growth_areas: toArray(form.growth_areas), academic_goals: toArray(form.academic_goals),
favorite_subjects: toArray(form.favorite_subjects),
}]);

setSuccess("Student \"" + form.full_name + "\" created and enrolled!");
resetForm(); setShowModal(false); fetchAllStudents(); if (onRefresh) onRefresh();
} catch (err) { setError(err.message); }
finally { setSaving(false); }
};

const handleBulkUpload = async () => {
if (!bulkCsv.trim()) { setError("Please paste CSV data"); return; }
if (!bulkClassId) { setError("Please select a class for bulk upload"); return; }
if (!session) { setError("No active session found"); return; }
setBulkSaving(true); setError(""); setBulkResults(null);

const lines = bulkCsv.trim().split("\n").filter((l) => l.trim());
const startIdx = lines[0]?.toLowerCase().includes("name") || lines[0]?.toLowerCase().includes("email") ? 1 : 0;
let successCount = 0, failCount = 0;
const errors = [];

for (let i = startIdx; i < lines.length; i++) {
const cols = lines[i].split(",").map((c) => c.trim());
const [full_name, email, phone, password, roll_number] = cols;
if (!full_name || !email || !password) { failCount++; errors.push("Row " + (i+1) + ": Missing required fields (name, email, password)"); continue; }
try {
const passwordHash = await hashPassword(password);
const { data: newUser, error: userErr } = await supabase.from("users").insert([{
email: email.trim().toLowerCase(), password_hash: passwordHash,
full_name: full_name.trim(), phone: phone || null, school_id: schoolId, role: "student",
}]).select("id").single();
if (userErr) throw userErr;

await supabase.from("class_students").insert([{
school_id: schoolId, class_id: bulkClassId, student_id: newUser.id,
session_id: session.id, roll_number: roll_number || null,
}]);

const selectedClass = classes.find((c) => c.id === bulkClassId);
await supabase.from("student_profiles").insert([{
user_id: newUser.id, name: full_name.trim(), school_id: schoolId,
class: selectedClass?.class_name || null, section: selectedClass?.section || null,
}]);
successCount++;
} catch (err) { failCount++; errors.push("Row " + (i+1) + " (" + email + "): " + err.message); }
}

setBulkResults({ successCount, failCount, errors });
if (successCount > 0) { fetchAllStudents(); if (onRefresh) onRefresh(); }
setBulkSaving(false);
};

const handleDeleteStudent = async (userId) => {
if (!confirm("Delete this student? This removes their account and all data.")) return;
try {
await supabase.from("student_profiles").delete().eq("user_id", userId);
await supabase.from("class_students").delete().eq("student_id", userId);
await supabase.from("users").delete().eq("id", userId);
fetchAllStudents(); if (onRefresh) onRefresh();
} catch (err) { console.error(err); }
};

const filtered = allStudents.filter((s) => s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()));
const enrolledCount = allStudents.filter((s) => s.classId).length;

return (
<div className="space-y-6">
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
<div>
<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Student Directory</h2>
<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Register students, assign to classes, and bulk upload</p>
</div>
<div className="flex gap-2">
<button onClick={() => { setShowBulkModal(true); setError(""); setBulkResults(null); setBulkCsv(""); }} className={btnSecondary}>
<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
Bulk Upload CSV
</button>
<button onClick={() => { setShowModal(true); resetForm(); setError(""); }} className={btnPrimary}>
<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
Add Student
</button>
</div>
</div>

{success && <div className={alertSuccess}><span>&#10003;</span> {success}</div>}

<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
<StatCard icon="&#127891;" label="Total Students" value={allStudents.length} color="indigo" />
<StatCard icon="&#9989;" label="Enrolled" value={enrolledCount} color="emerald" />
<StatCard icon="&#9888;&#65039;" label="Not Enrolled" value={allStudents.length - enrolledCount} color="amber" />
<StatCard icon="&#128231;" label="Today" value={allStudents.filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString()).length} color="sky" />
</div>

<div className="flex flex-wrap items-end gap-3">
<div className="min-w-[180px]">
<label className={labelClass}>Filter by Class</label>
<select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} className={inputClass}>
<option value="">All Classes</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
<div className="relative flex-1 min-w-[200px]">
<svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
<input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500" />
</div>
</div>

<div className={cardClass + " p-0! overflow-hidden"}>
<div className="overflow-x-auto">
<table className="w-full">
<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
<tr>
<th className={thClass}>#</th><th className={thClass}>Student</th><th className={thClass}>Phone</th>
<th className={thClass}>Class</th><th className={thClass}>Roll No</th><th className={thClass}>Registered</th>
<th className={thClass + " text-right"}>Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
{loadingStudents ? (
<tr><td colSpan={7} className={emptyClass}><div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" /></td></tr>
) : filtered.length === 0 ? (
<tr><td colSpan={7} className={emptyClass}>
<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">&#127891;</div>
{searchQuery || filterClassId ? "No students match your filters." : "No students registered yet."}
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
<td className={tdClass}>{s.phone || "\u2014"}</td>
<td className={tdClass}>{s.className ? <Badge color="indigo">{s.className}</Badge> : <Badge color="zinc">Not Enrolled</Badge>}</td>
<td className={tdClass + " font-mono text-xs"}>{s.rollNumber || "\u2014"}</td>
<td className={tdClass + " text-xs"}>{new Date(s.created_at).toLocaleDateString()}</td>
<td className={tdClass + " text-right"}>
<div className="flex items-center justify-end gap-1">
{s.profile && <button onClick={() => setViewStudent(s)} className={btnGhost}>View</button>}
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
{error && <div className={alertError}><span>&#9888;</span> {error}</div>}
<form onSubmit={handleAddStudent} className="space-y-6">
<div>
<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
<span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">1</span>
Account &amp; Class
</h3>
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
<div><label className={labelClass}>Full Name <span className="text-red-500">*</span></label><input type="text" placeholder="Student full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} required /></div>
<div><label className={labelClass}>Email <span className="text-red-500">*</span></label><input type="email" placeholder="student@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required /></div>
<div><label className={labelClass}>Phone</label><input type="text" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></div>
<div><label className={labelClass}>Password <span className="text-red-500">*</span></label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} required minLength={6} /></div>
<div>
<label className={labelClass}>Assign to Class <span className="text-red-500">*</span></label>
<select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className={inputClass} required>
<option value="">-- Select Class --</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
<div><label className={labelClass}>Roll Number</label><input type="text" placeholder="e.g. 01" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} className={inputClass} /></div>
</div>
</div>
<div>
<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
<span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">2</span>
Profile Details <span className="text-xs font-normal text-zinc-400">(Optional)</span>
</h3>
<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
<div><label className={labelClass}>Age</label><input type="number" placeholder="15" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputClass} min={3} max={25} /></div>
<div><label className={labelClass}>House</label><input type="text" placeholder="e.g. Blue" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} className={inputClass} /></div>
<div><label className={labelClass}>Learning Style</label><select value={form.learning_style} onChange={(e) => setForm({ ...form, learning_style: e.target.value })} className={inputClass}><option value="">Select</option><option value="Visual">Visual</option><option value="Auditory">Auditory</option><option value="Reading/Writing">Reading/Writing</option><option value="Kinesthetic">Kinesthetic</option></select></div>
<div><label className={labelClass}>Fun Fact</label><input type="text" placeholder="Something fun" value={form.fun_fact} onChange={(e) => setForm({ ...form, fun_fact: e.target.value })} className={inputClass} /></div>
</div>
<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
<div><label className={labelClass}>Interests <span className="text-xs text-zinc-400">(comma-separated)</span></label><input type="text" placeholder="Cricket, Art, Science" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className={inputClass} /></div>
<div><label className={labelClass}>Strengths <span className="text-xs text-zinc-400">(comma-separated)</span></label><input type="text" placeholder="Math, Leadership" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className={inputClass} /></div>
</div>
</div>
<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
<button type="button" onClick={() => { setShowModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Creating..." : "Register & Enroll Student"}</button>
</div>
</form>
</Modal>

{/* Bulk Upload Modal */}
<Modal open={showBulkModal} onClose={() => { setShowBulkModal(false); setError(""); setBulkResults(null); }} title="Bulk Upload Students via CSV" maxWidth="max-w-2xl">
{error && <div className={alertError}><span>&#9888;</span> {error}</div>}
<div className="space-y-4">
<div>
<label className={labelClass}>Assign All to Class <span className="text-red-500">*</span></label>
<select value={bulkClassId} onChange={(e) => setBulkClassId(e.target.value)} className={inputClass} required>
<option value="">-- Select Class --</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
<div>
<label className={labelClass}>Paste CSV Data <span className="text-red-500">*</span></label>
<p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Format: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">full_name, email, phone, password, roll_number</code></p>
<textarea rows={8} value={bulkCsv} onChange={(e) => setBulkCsv(e.target.value)} placeholder={"full_name, email, phone, password, roll_number\nRahul Sharma, rahul@school.com, 9876543210, pass123, 01\nPriya Patel, priya@school.com, , pass456, 02"} className={inputClass + " font-mono text-xs!"} />
</div>
{bulkResults && (
<div className={"rounded-xl p-4 " + (bulkResults.failCount === 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20")}>
<div className="flex items-center gap-4 text-sm font-medium">
<span className="text-emerald-700 dark:text-emerald-400">&#9989; {bulkResults.successCount} created</span>
{bulkResults.failCount > 0 && <span className="text-red-700 dark:text-red-400">&#10060; {bulkResults.failCount} failed</span>}
</div>
{bulkResults.errors.length > 0 && (
<div className="mt-2 max-h-32 overflow-y-auto text-xs text-red-600 dark:text-red-400">
{bulkResults.errors.map((e, i) => <p key={i}>&#8226; {e}</p>)}
</div>
)}
</div>
)}
<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
<button onClick={() => { setShowBulkModal(false); setError(""); setBulkResults(null); }} className={btnSecondary}>Close</button>
<button onClick={handleBulkUpload} disabled={bulkSaving} className={btnPrimary}>{bulkSaving ? "Uploading..." : "Upload & Create Students"}</button>
</div>
</div>
</Modal>

{/* View Student Profile Modal */}
<Modal open={!!viewStudent} onClose={() => setViewStudent(null)} title={"Student Profile \u2014 " + (viewStudent?.full_name || "")} maxWidth="max-w-xl">
{viewStudent?.profile && (
<div className="space-y-4">
<div className="flex items-center gap-4">
<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400 to-purple-500 text-xl font-bold text-white">
{viewStudent.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
</div>
<div>
<h3 className="text-lg font-bold text-zinc-900 dark:text-white">{viewStudent.full_name}</h3>
<p className="text-sm text-zinc-500">{viewStudent.email}</p>
{viewStudent.className && <Badge color="indigo">{viewStudent.className}</Badge>}
</div>
</div>
<div className="grid grid-cols-2 gap-3">
{[
{ label: "Class", value: viewStudent.className || "Not Enrolled" },
{ label: "Roll No", value: viewStudent.rollNumber || "\u2014" },
{ label: "Age", value: viewStudent.profile.age || "\u2014" },
{ label: "House", value: viewStudent.profile.house || "\u2014" },
{ label: "Learning Style", value: viewStudent.profile.learning_style || "\u2014" },
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
].filter((a) => a.data?.length).map((arr) => (
<div key={arr.label}>
<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">{arr.label}</p>
<div className="flex flex-wrap gap-1.5">{arr.data.map((item, i) => <Badge key={i} color={arr.color}>{item}</Badge>)}</div>
</div>
))}
{viewStudent.profile.fun_fact && (
<div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
<p className="text-xs font-medium text-amber-600 dark:text-amber-400">&#127881; Fun Fact</p>
<p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">{viewStudent.profile.fun_fact}</p>
</div>
)}
</div>
)}
</Modal>
</div>
);
}
