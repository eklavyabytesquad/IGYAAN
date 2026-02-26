"use client";

import { GRADING_SYSTEMS } from "../constants";

export default function ExamManager({ exams, selectedExamId, setSelectedExamId, onDelete }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Manage Exams</h2>
      {exams.length === 0 ? (
        <p className="text-sm text-zinc-500">No exams yet.</p>
      ) : (
        <div className="space-y-3">
          {exams.map((e) => (
            <div key={e.id}
              className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                selectedExamId === e.id
                  ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
              }`}>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">{e.exam_name}</p>
                <p className="text-xs text-zinc-500">{e.exam_type} &mdash; {e.academic_year} &mdash; {GRADING_SYSTEMS[e.grading_system]?.name || e.grading_system}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedExamId(e.id)}
                  className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 transition-colors">
                  Select
                </button>
                <button onClick={() => onDelete(e.id)}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
