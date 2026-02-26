"use client";

import { useState } from "react";
import { supabase } from "../../../utils/supabase";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { GRADING_SYSTEMS, REPORT_TEMPLATES, TEMPLATE_STYLES } from "../constants";
import { calcGrade } from "../helpers";

export default function PDFGenerator({ classes, selectedExamId, exams, schoolInfo, setError, setSuccess }) {
  const [genClassId, setGenClassId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const handleGeneratePDFs = async () => {
    if (!selectedExamId) { setError("Select an exam"); return; }
    if (!genClassId) { setError("Select a class to generate"); return; }
    setGenerating(true); setError("");
    try {
      const { data: marks } = await supabase.from("report_card_marks").select("*")
        .eq("exam_id", selectedExamId).eq("class_id", genClassId);
      if (!marks || marks.length === 0) {
        setError("No marks found for this exam + class. Enter/upload marks first.");
        setGenerating(false); return;
      }

      const exam = exams.find((e) => e.id === selectedExamId);
      const clsObj = classes.find((c) => c.id === genClassId);
      const style = TEMPLATE_STYLES[selectedTemplate] || TEMPLATE_STYLES.classic;

      /* Group by student — works for both manual (student_id) and CSV (student_name) */
      const studentMap = {};
      marks.forEach((m) => {
        const key = m.student_id || m.student_name;
        if (!studentMap[key]) studentMap[key] = { name: m.student_name, subjects: [] };
        studentMap[key].subjects.push(m);
      });

      const studentKeys = Object.keys(studentMap);
      for (let idx = 0; idx < studentKeys.length; idx++) {
        const student = studentMap[studentKeys[idx]];
        const doc = new jsPDF();
        const pw = doc.internal.pageSize.getWidth();

        /* ── HEADER BAND ── */
        doc.setFillColor(...style.headerBg);
        doc.rect(0, 0, pw, 36, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(schoolInfo?.school_name || "School Report Card", pw / 2, 14, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text([schoolInfo?.city, schoolInfo?.state].filter(Boolean).join(", ") || "", pw / 2, 21, { align: "center" });
        doc.text(`${exam?.exam_name || "Exam"} | ${exam?.exam_type || ""} | ${exam?.academic_year || ""}`, pw / 2, 28, { align: "center" });
        doc.setFontSize(8);
        doc.text(`Board: ${schoolInfo?.affiliation_board || "N/A"}`, pw / 2, 34, { align: "center" });

        /* ── STUDENT INFO BOX ── */
        doc.setFillColor(...style.infoBg);
        doc.roundedRect(10, 42, pw - 20, 22, 3, 3, "F");
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Student:", 15, 51);
        doc.setFont("helvetica", "normal");
        doc.text(student.name, 40, 51);
        doc.setFont("helvetica", "bold");
        doc.text("Class:", pw / 2 + 10, 51);
        doc.setFont("helvetica", "normal");
        doc.text(`${clsObj?.class_name || ""} - ${clsObj?.section || ""}`, pw / 2 + 30, 51);
        doc.setFont("helvetica", "bold");
        doc.text("Grading:", 15, 59);
        doc.setFont("helvetica", "normal");
        doc.text(GRADING_SYSTEMS[exam?.grading_system || "cbse"]?.name || "CBSE", 42, 59);

        /* ── MARKS TABLE ── */
        const tableBody = student.subjects.map((s) => [
          s.subject_name, s.max_marks, s.obtained_marks,
          s.percentage.toFixed(1) + "%", s.grade, s.grade_point,
        ]);

        doc.autoTable({
          startY: 70,
          head: [["Subject", "Max Marks", "Obtained", "Percentage", "Grade", "GP"]],
          body: tableBody,
          theme: style.tableTheme,
          headStyles: { fillColor: style.headerBg, textColor: 255, fontStyle: "bold", fontSize: 10, halign: "center" },
          bodyStyles: { fontSize: 10, halign: "center" },
          alternateRowStyles: { fillColor: style.altRowBg },
          columnStyles: { 0: { halign: "left" } },
          margin: { left: 10, right: 10 },
        });

        /* ── OVERALL PERFORMANCE ── */
        const finalY = doc.lastAutoTable.finalY + 8;
        const totalObtained = student.subjects.reduce((s, m) => s + m.obtained_marks, 0);
        const totalMax = student.subjects.reduce((s, m) => s + m.max_marks, 0);
        const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        const overallGrade = calcGrade(overallPct, exam?.grading_system || "cbse");
        const avgGP = student.subjects.length > 0
          ? (student.subjects.reduce((s, m) => s + m.grade_point, 0) / student.subjects.length).toFixed(2) : "0";

        doc.setFillColor(...style.infoBg);
        doc.roundedRect(10, finalY, pw - 20, 30, 3, 3, "F");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...style.accentColor);
        doc.text("OVERALL PERFORMANCE", pw / 2, finalY + 8, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "normal");
        doc.text(`Total: ${totalObtained} / ${totalMax}`, 15, finalY + 17);
        doc.text(`Percentage: ${overallPct.toFixed(2)}%`, pw / 2 - 20, finalY + 17);
        doc.text(`Grade: ${overallGrade.grade}`, pw - 50, finalY + 17);
        doc.text(`CGPA: ${avgGP}`, 15, finalY + 25);
        doc.text(`Result: ${overallGrade.gp > 0 ? "PASS" : "FAIL"}`, pw / 2 - 20, finalY + 25);

        /* ── GRADING SCALE TABLE ── */
        const gY = finalY + 38;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(80, 80, 80);
        doc.text("Grading Scale:", 10, gY);
        const gs = GRADING_SYSTEMS[exam?.grading_system || "cbse"].grades;
        doc.autoTable({
          startY: gY + 3,
          head: [["Range", "Grade", "GP"]],
          body: gs.map((g) => [`${g.min}% - ${g.max}%`, g.grade, g.gp]),
          theme: "plain",
          headStyles: { fillColor: [230, 230, 240], textColor: [60, 60, 60], fontStyle: "bold", fontSize: 7, halign: "center" },
          bodyStyles: { fontSize: 7, halign: "center", cellPadding: 1.5 },
          margin: { left: 10, right: 10 },
          tableWidth: pw - 20,
        });

        /* ── SIGNATURES ── */
        const sigY = doc.lastAutoTable.finalY + 15;
        doc.setDrawColor(180);
        doc.setLineWidth(0.3);
        doc.line(15, sigY, 70, sigY);
        doc.line(pw / 2 - 27, sigY, pw / 2 + 27, sigY);
        doc.line(pw - 70, sigY, pw - 15, sigY);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Class Teacher", 30, sigY + 5);
        doc.text("Parent / Guardian", pw / 2 - 13, sigY + 5);
        doc.text("Principal", pw - 50, sigY + 5);

        /* ── FOOTER ── */
        const ph = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text("Generated by I-GYAN School OS", pw / 2, ph - 8, { align: "center" });
        doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pw / 2, ph - 4, { align: "center" });

        doc.save(`Report_Card_${student.name.replace(/\s+/g, "_")}_${clsObj?.class_name || ""}_${clsObj?.section || ""}.pdf`);
      }
      setSuccess(`Generated ${studentKeys.length} report card PDFs!`);
    } catch (err) {
      console.error(err);
      setError("Error generating PDFs: " + err.message);
    } finally { setGenerating(false); }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Generate PDF Report Cards</h2>

      {/* Exam info */}
      <div className="mb-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
        <p className="text-sm text-indigo-900 dark:text-indigo-200">
          <strong>Exam:</strong> {selectedExam?.exam_name} ({selectedExam?.exam_type}) |{" "}
          <strong>Year:</strong> {selectedExam?.academic_year} |{" "}
          <strong>Grading:</strong> {GRADING_SYSTEMS[selectedExam?.grading_system]?.name}
        </p>
      </div>

      {/* Class selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Select Class</label>
        <select value={genClassId} onChange={(e) => setGenClassId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
          <option value="">-- Select Class --</option>
          {classes.map((c) => (<option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>))}
        </select>
      </div>

      {/* Template selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Report Card Template</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REPORT_TEMPLATES.map((tmpl) => (
            <button key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                selectedTemplate === tmpl.id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 ring-2 ring-indigo-200 dark:ring-indigo-800"
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              }`}>
              {/* Color swatch */}
              <div className="mb-2 h-3 w-full rounded-full" style={{ backgroundColor: tmpl.color }} />
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{tmpl.name}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">{tmpl.desc}</p>
              {selectedTemplate === tmpl.id && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-xs">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button onClick={handleGeneratePDFs} disabled={generating || !genClassId}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {generating ? (
          <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating PDFs...</>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate &amp; Download All PDFs
          </>
        )}
      </button>

      {/* Grading scale reference */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Grading Scale Reference</h3>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-300">Range</th>
                <th className="px-3 py-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">Grade</th>
                <th className="px-3 py-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {GRADING_SYSTEMS[selectedExam?.grading_system || "cbse"].grades.map((g, i) => (
                <tr key={i}>
                  <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">{g.min}% - {g.max}%</td>
                  <td className="px-3 py-1.5 text-center font-semibold text-zinc-900 dark:text-white">{g.grade}</td>
                  <td className="px-3 py-1.5 text-center text-zinc-600 dark:text-zinc-400">{g.gp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
