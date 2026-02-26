"use client";

import { useState, useRef } from "react";
import { supabase } from "../../../utils/supabase";
import { calcGrade } from "../helpers";
import { generateSampleCsv, downloadCsvFile } from "../helpers";

export default function BulkUpload({ classes, subjects, setSubjects, selectedExamId, exams, user, setError, setSuccess }) {
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkParsed, setBulkParsed] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Upload CSV file ── */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (text) {
        setBulkCsv(text);
        setSuccess("CSV file loaded! Click 'Parse CSV' to continue.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── Download sample CSV ── */
  const handleDownloadSample = () => {
    downloadCsvFile(generateSampleCsv(), "sample_report_card.csv");
  };

  /* ── Parse CSV text ── */
  const handleParseCsv = () => {
    setError("");
    if (!bulkCsv.trim()) { setError("Paste CSV data or upload a CSV file"); return; }
    const lines = bulkCsv.trim().split("\n").map((l) => l.split(",").map((c) => c.trim()));
    if (lines.length < 2) { setError("CSV must have header + at least 1 row"); return; }
    const header = lines[0];
    if (header.length < 2) { setError("CSV header must have: StudentName, Subject1, Subject2, ..."); return; }
    const subjectNames = header.slice(1);
    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (row.length < 2 || !row[0]) continue;
      const entry = { studentName: row[0], marks: {} };
      subjectNames.forEach((sub, j) => { entry.marks[sub] = parseFloat(row[j + 1]) || 0; });
      parsed.push(entry);
    }
    setBulkParsed(parsed);
    setSubjects(subjectNames.map((n) => ({ name: n, max_marks: 100 })));
    setSuccess(`Parsed ${parsed.length} student records with ${subjectNames.length} subjects`);
  };

  /* ── Save directly — NO student-name matching ── */
  const handleBulkSave = async () => {
    if (!selectedExamId) { setError("Select an exam first"); return; }
    if (!bulkClassId) { setError("Select a class for bulk upload"); return; }
    if (bulkParsed.length === 0) { setError("Parse CSV data first"); return; }
    setSaving(true); setError("");
    try {
      /* remove old marks for this exam + class */
      await supabase.from("report_card_marks").delete()
        .eq("exam_id", selectedExamId).eq("class_id", bulkClassId);

      const exam = exams.find((e) => e.id === selectedExamId);
      const rows = [];

      for (const entry of bulkParsed) {
        for (const sub of subjects) {
          const obtained = entry.marks[sub.name] || 0;
          const pct = sub.max_marks > 0 ? (obtained / sub.max_marks) * 100 : 0;
          const gradeInfo = calcGrade(pct, exam?.grading_system || "cbse");
          rows.push({
            exam_id: selectedExamId,
            school_id: user.school_id,
            class_id: bulkClassId,
            student_name: entry.studentName,
            subject_name: sub.name,
            max_marks: sub.max_marks,
            obtained_marks: obtained,
            percentage: parseFloat(pct.toFixed(2)),
            grade: gradeInfo.grade,
            grade_point: gradeInfo.gp,
          });
        }
      }

      if (rows.length === 0) { setError("No data to save"); setSaving(false); return; }
      const { error: insErr } = await supabase.from("report_card_marks").insert(rows);
      if (insErr) throw insErr;
      setSuccess(`Saved ${rows.length} records for ${bulkParsed.length} students!`);
      setBulkParsed([]); setBulkCsv("");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const updateSubject = (i, field, value) => {
    const copy = [...subjects];
    copy[i] = { ...copy[i], [field]: field === "max_marks" ? parseInt(value) || 0 : value };
    setSubjects(copy);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Bulk CSV Upload</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        Upload or paste CSV with header: <span className="font-mono">StudentName,Subject1,Subject2,...</span>
        <br />Data is saved directly &mdash; no student name matching required.
      </p>

      {/* Class */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class</label>
        <select value={bulkClassId} onChange={(e) => setBulkClassId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
          <option value="">-- Select Class --</option>
          {classes.map((c) => (<option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>))}
        </select>
      </div>

      {/* File upload + Sample download */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload CSV File
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />

        <button onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Sample CSV
        </button>
      </div>

      {/* Max-marks editor (after parse) */}
      {subjects.length > 0 && bulkParsed.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">Max Marks per Subject (edit if needed)</label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((sub, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <span className="text-zinc-700 dark:text-zinc-300">{sub.name}:</span>
                <input type="number" value={sub.max_marks}
                  onChange={(e) => updateSubject(i, "max_marks", e.target.value)}
                  className="w-16 rounded border border-zinc-300 px-2 py-1 text-center text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea value={bulkCsv} onChange={(e) => setBulkCsv(e.target.value)} rows={10}
        placeholder={"StudentName,Mathematics,Science,English,Hindi\nRahul Sharma,85,90,78,88\nPriya Singh,92,88,95,79"}
        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white placeholder:text-zinc-400" />

      {/* Action buttons */}
      <div className="mt-3 flex flex-wrap gap-3">
        <button onClick={handleParseCsv}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-500 transition-colors">
          Parse CSV
        </button>
        {bulkParsed.length > 0 && (
          <button onClick={handleBulkSave} disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : `Save ${bulkParsed.length} Records`}
          </button>
        )}
      </div>

      {/* Preview table */}
      {bulkParsed.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-300">Student</th>
                {subjects.map((s) => (
                  <th key={s.name} className="px-3 py-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {bulkParsed.map((entry, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-white">{entry.studentName}</td>
                  {subjects.map((s) => (
                    <td key={s.name} className="px-3 py-2 text-center text-zinc-600 dark:text-zinc-400">{entry.marks[s.name] ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sample data hint */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">Sample CSV Format</p>
        <pre className="text-[10px] text-amber-700 dark:text-amber-300 font-mono whitespace-pre-wrap">
{`StudentName,Mathematics,Science,English,Hindi,Social Studies
Rahul Sharma,85,90,78,88,92
Priya Singh,92,88,95,79,85
Amit Kumar,76,82,68,91,73`}
        </pre>
      </div>
    </div>
  );
}
