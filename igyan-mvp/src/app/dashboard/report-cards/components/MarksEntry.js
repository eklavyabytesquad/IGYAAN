"use client";

export default function MarksEntry({
  classes, selectedClassId, setSelectedClassId,
  students, subjects, addSubject, removeSubject, updateSubject,
  marksMap, updateMark, onSave, saving, selectedExam, calcGrade,
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Enter Marks Manually</h2>

      {/* Class selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class</label>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
          <option value="">-- Select Class --</option>
          {classes.map((c) => (<option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>))}
        </select>
      </div>

      {/* Subjects */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Subjects and Max Marks</label>
          <button onClick={addSubject} className="text-xs font-medium text-indigo-600 hover:underline">+ Add Subject</button>
        </div>
        <div className="space-y-2">
          {subjects.map((sub, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="Subject name" value={sub.name}
                onChange={(e) => updateSubject(i, "name", e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              <input type="number" placeholder="Max" value={sub.max_marks}
                onChange={(e) => updateSubject(i, "max_marks", e.target.value)}
                className="w-20 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-center dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              {subjects.length > 1 && (
                <button onClick={() => removeSubject(i)} className="text-red-500 hover:text-red-700 text-lg font-bold px-2">&times;</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Marks grid */}
      {students.length > 0 && subjects.length > 0 && subjects[0].name && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 min-w-[180px]">Student</th>
                {subjects.map((sub) => (
                  <th key={sub.name} className="px-3 py-2 text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 min-w-[90px]">
                    {sub.name}<br /><span className="text-[10px] font-normal opacity-60">Max: {sub.max_marks}</span>
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">Total</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">%</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {students.map((st) => {
                let totalObt = 0;
                let totalMax = 0;
                subjects.forEach((sub) => {
                  const v = marksMap[`${st.id}-${sub.name}`];
                  if (v !== undefined && v !== "") { totalObt += parseFloat(v) || 0; totalMax += sub.max_marks; }
                });
                const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
                const grade = calcGrade(pct, selectedExam?.grading_system || "cbse");
                return (
                  <tr key={st.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="sticky left-0 z-10 bg-white dark:bg-zinc-900 px-3 py-2 font-medium text-zinc-900 dark:text-white text-xs">{st.full_name}</td>
                    {subjects.map((sub) => (
                      <td key={sub.name} className="px-1 py-1 text-center">
                        <input type="number" min="0" max={sub.max_marks}
                          value={marksMap[`${st.id}-${sub.name}`] ?? ""}
                          onChange={(e) => updateMark(st.id, sub.name, e.target.value)}
                          className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                          placeholder="-" />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">{totalObt}/{totalMax}</td>
                    <td className="px-3 py-2 text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">{pct.toFixed(1)}%</td>
                    <td className={`px-3 py-2 text-center text-xs font-bold ${grade.gp > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{grade.grade}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {students.length === 0 && selectedClassId && (
        <p className="text-sm text-zinc-500 mt-4">No students found in selected class.</p>
      )}

      {students.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button onClick={onSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save All Marks"}
          </button>
        </div>
      )}
    </div>
  );
}
