"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import { ALLOWED_ROLES, GRADING_SYSTEMS } from "./constants";
import { calcGrade } from "./helpers";
import ExamModal from "./components/ExamModal";
import ExamManager from "./components/ExamManager";
import MarksEntry from "./components/MarksEntry";
import BulkUpload from "./components/BulkUpload";
import PDFGenerator from "./components/PDFGenerator";

export default function ReportCardsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* ── shared state ── */
  const [classes, setClasses] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [tab, setTab] = useState("enter");

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ exam_name: "", exam_type: "Quarterly", academic_year: "2025-26", grading_system: "cbse" });

  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([{ name: "Mathematics", max_marks: 100 }]);
  const [marksMap, setMarksMap] = useState({});
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /* ── guards ── */
  useEffect(() => {
    if (!loading && !user) router.push("/login");
    else if (!loading && user && !ALLOWED_ROLES.includes(user.role)) router.push("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && ALLOWED_ROLES.includes(user.role) && user.school_id) fetchInitialData();
  }, [user]);

  /* ── data fetching ── */
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const { data: sessions } = await supabase
        .from("academic_sessions").select("*")
        .eq("school_id", user.school_id).eq("is_active", true).limit(1);
      const session = sessions?.[0] || null;
      setActiveSession(session);

      const { data: school } = await supabase
        .from("schools")
        .select("school_name, city, state, affiliation_board, logo_url, contact_phone, contact_email")
        .eq("id", user.school_id).single();
      setSchoolInfo(school);

      if (session) {
        if (user.role === "faculty") {
          const { data: fa } = await supabase
            .from("faculty_assignments")
            .select("class_id, classes(id, class_name, section)")
            .eq("faculty_id", user.id).eq("session_id", session.id).eq("is_active", true);
          const unique = [];
          const seen = new Set();
          (fa || []).forEach((a) => {
            if (a.classes && !seen.has(a.classes.id)) { seen.add(a.classes.id); unique.push(a.classes); }
          });
          setClasses(unique);
        } else {
          const { data: allC } = await supabase
            .from("classes").select("*")
            .eq("school_id", user.school_id).eq("session_id", session.id)
            .eq("is_active", true).order("class_name");
          setClasses(allC || []);
        }
      }
      await fetchExams();
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const fetchExams = async () => {
    const { data } = await supabase.from("report_card_exams").select("*")
      .eq("school_id", user.school_id).order("created_at", { ascending: false });
    setExams(data || []);
  };

  const fetchStudents = useCallback(async (classId) => {
    if (!classId || !activeSession) return;
    const { data } = await supabase
      .from("class_students")
      .select("student_id, users!class_students_student_id_fkey(id, full_name, email)")
      .eq("class_id", classId).eq("session_id", activeSession.id).eq("is_active", true);
    const list = (data || [])
      .filter((d) => d.users)
      .map((d) => ({ id: d.users.id, full_name: d.users.full_name, email: d.users.email }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
    setStudents(list);
  }, [activeSession]);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
      if (selectedExamId) fetchSavedMarks(selectedExamId, selectedClassId);
    } else { setStudents([]); }
  }, [selectedClassId, fetchStudents]);

  const fetchSavedMarks = async (examId, classId) => {
    const { data } = await supabase.from("report_card_marks").select("*")
      .eq("exam_id", examId).eq("class_id", classId);
    if (data && data.length > 0) {
      const map = {};
      const subSet = new Map();
      data.forEach((m) => {
        map[`${m.student_id}-${m.subject_name}`] = m.obtained_marks;
        if (!subSet.has(m.subject_name)) subSet.set(m.subject_name, m.max_marks);
      });
      setMarksMap(map);
      const subs = [];
      subSet.forEach((max, name) => subs.push({ name, max_marks: max }));
      if (subs.length > 0) setSubjects(subs);
    } else { setMarksMap({}); }
  };

  useEffect(() => {
    if (selectedExamId && selectedClassId) fetchSavedMarks(selectedExamId, selectedClassId);
  }, [selectedExamId]);

  /* ── exam handlers ── */
  const handleCreateExam = async () => {
    if (!examForm.exam_name.trim()) { setError("Enter exam name"); return; }
    const { error: err } = await supabase.from("report_card_exams").insert({
      school_id: user.school_id, exam_name: examForm.exam_name.trim(),
      exam_type: examForm.exam_type, academic_year: examForm.academic_year,
      grading_system: examForm.grading_system, created_by: user.id,
    });
    if (err) { setError(err.message); }
    else {
      setSuccess("Exam created!");
      setShowExamModal(false);
      setExamForm({ exam_name: "", exam_type: "Quarterly", academic_year: "2025-26", grading_system: "cbse" });
      await fetchExams();
    }
  };

  const handleDeleteExam = async (id) => {
    if (!confirm("Delete this exam and ALL its marks data?")) return;
    await supabase.from("report_card_marks").delete().eq("exam_id", id);
    await supabase.from("report_card_exams").delete().eq("id", id);
    setSuccess("Exam deleted");
    if (selectedExamId === id) setSelectedExamId("");
    await fetchExams();
  };

  /* ── subject helpers ── */
  const addSubject = () => setSubjects([...subjects, { name: "", max_marks: 100 }]);
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i, field, value) => {
    const copy = [...subjects];
    copy[i] = { ...copy[i], [field]: field === "max_marks" ? parseInt(value) || 0 : value };
    setSubjects(copy);
  };

  const updateMark = (studentId, subjectName, value) => {
    setMarksMap((prev) => ({ ...prev, [`${studentId}-${subjectName}`]: value === "" ? "" : parseFloat(value) || 0 }));
  };

  /* ── save marks (manual entry) ── */
  const handleSaveMarks = async () => {
    if (!selectedExamId) { setError("Please select an exam first"); return; }
    if (!selectedClassId) { setError("Please select a class"); return; }
    if (subjects.some((s) => !s.name.trim())) { setError("All subject names are required"); return; }
    setSaving(true); setError("");
    try {
      await supabase.from("report_card_marks").delete().eq("exam_id", selectedExamId).eq("class_id", selectedClassId);
      const rows = [];
      for (const st of students) {
        for (const sub of subjects) {
          const key = `${st.id}-${sub.name}`;
          const obtained = marksMap[key] !== undefined && marksMap[key] !== "" ? parseFloat(marksMap[key]) : null;
          if (obtained === null) continue;
          const pct = sub.max_marks > 0 ? (obtained / sub.max_marks) * 100 : 0;
          const exam = exams.find((e) => e.id === selectedExamId);
          const gradeInfo = calcGrade(pct, exam?.grading_system || "cbse");
          rows.push({
            exam_id: selectedExamId, school_id: user.school_id, class_id: selectedClassId,
            student_id: st.id, student_name: st.full_name, subject_name: sub.name,
            max_marks: sub.max_marks, obtained_marks: obtained,
            percentage: parseFloat(pct.toFixed(2)), grade: gradeInfo.grade, grade_point: gradeInfo.gp,
          });
        }
      }
      if (rows.length === 0) { setError("No marks entered"); setSaving(false); return; }
      const { error: insErr } = await supabase.from("report_card_marks").insert(rows);
      if (insErr) throw insErr;
      setSuccess(`Saved marks for ${students.length} students across ${subjects.length} subjects!`);
      await fetchSavedMarks(selectedExamId, selectedClassId);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  /* ── render helpers ── */
  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const tabCls = (base, active) =>
    `${base} ${active ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`;

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading report cards...</p>
        </div>
      </div>
    );
  }

  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Report Card Generator</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Create exams, enter marks, generate professional PDF report cards</p>
          </div>
          <button onClick={() => setShowExamModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Exam
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
            <button onClick={() => setError("")} className="float-right font-bold">&times;</button>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            {success}
            <button onClick={() => setSuccess("")} className="float-right font-bold">&times;</button>
          </div>
        )}

        {/* Exam selector */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Select Exam</label>
          {exams.length === 0 ? (
            <p className="text-sm text-zinc-500">No exams created yet. Click &quot;New Exam&quot; to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {exams.map((e) => (
                <button key={e.id} onClick={() => setSelectedExamId(e.id)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    selectedExamId === e.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-800"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}>
                  <span className="font-semibold">{e.exam_name}</span>
                  <span className="ml-2 text-xs opacity-60">{e.exam_type} - {e.academic_year}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs + content */}
        {selectedExamId && (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {[
                { key: "enter", label: "Enter Marks" },
                { key: "bulk", label: "Bulk CSV Upload" },
                { key: "generated", label: "Generate PDFs" },
                { key: "exams", label: "Manage Exams" },
              ].map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={tabCls("rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all", tab === t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "enter" && (
              <MarksEntry
                classes={classes} selectedClassId={selectedClassId} setSelectedClassId={setSelectedClassId}
                students={students} subjects={subjects} addSubject={addSubject}
                removeSubject={removeSubject} updateSubject={updateSubject}
                marksMap={marksMap} updateMark={updateMark} onSave={handleSaveMarks}
                saving={saving} selectedExam={selectedExam} calcGrade={calcGrade}
              />
            )}

            {tab === "bulk" && (
              <BulkUpload
                classes={classes} subjects={subjects} setSubjects={setSubjects}
                selectedExamId={selectedExamId} exams={exams} user={user}
                activeSession={activeSession} setError={setError} setSuccess={setSuccess}
              />
            )}

            {tab === "generated" && (
              <PDFGenerator
                classes={classes} selectedExamId={selectedExamId} exams={exams}
                schoolInfo={schoolInfo} setError={setError} setSuccess={setSuccess}
              />
            )}

            {tab === "exams" && (
              <ExamManager
                exams={exams} selectedExamId={selectedExamId}
                setSelectedExamId={setSelectedExamId} onDelete={handleDeleteExam}
              />
            )}
          </>
        )}
      </div>

      {showExamModal && (
        <ExamModal
          examForm={examForm} setExamForm={setExamForm}
          onSubmit={handleCreateExam} onClose={() => setShowExamModal(false)}
        />
      )}
    </div>
  );
}
