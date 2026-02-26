"use client";

export default function TeacherInfoCard({ classTeacher, onRequestCallback }) {
  if (!classTeacher) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
        <p className="text-amber-700 dark:text-amber-400 text-sm">
          ⚠️ No class teacher assigned yet. Please contact school administration.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold">
            {classTeacher.name?.charAt(0) || "T"}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">{classTeacher.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Class Teacher {classTeacher.className ? `• ${classTeacher.className}` : ""}
            </p>
            {classTeacher.email && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{classTeacher.email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {classTeacher.phone && (
            <a
              href={`tel:${classTeacher.phone}`}
              className="flex items-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              📞 Call Now
            </a>
          )}
          {classTeacher.phone && (
            <a
              href={`https://wa.me/${classTeacher.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              💬 WhatsApp
            </a>
          )}
          <button
            onClick={onRequestCallback}
            className="flex items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            🔔 Request Callback
          </button>
        </div>
      </div>
    </div>
  );
}
