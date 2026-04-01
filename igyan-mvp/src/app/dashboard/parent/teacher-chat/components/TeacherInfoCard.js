"use client";

export default function TeacherInfoCard({ classTeacher, onRequestCallback }) {
  if (!classTeacher) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)', background: 'color-mix(in srgb, #f59e0b 10%, transparent)' }}>
        <p className="text-sm" style={{ color: '#f59e0b' }}>
          ⚠️ No class teacher assigned yet. Please contact school administration.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4" style={{ border: '1px solid var(--dashboard-border)', background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: 'var(--dashboard-primary)' }}>
            {classTeacher.name?.charAt(0) || "T"}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{classTeacher.name}</h3>
            <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
              Class Teacher {classTeacher.className ? `• ${classTeacher.className}` : ""}
            </p>
            {classTeacher.email && (
              <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>{classTeacher.email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {classTeacher.phone && (
            <a
              href={`tel:${classTeacher.phone}`}
              className="flex items-center gap-2 rounded-lg text-white px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
              style={{ background: 'var(--dashboard-primary)' }}
            >
              📞 Call Now
            </a>
          )}
          {classTeacher.phone && (
            <a
              href={`https://wa.me/${classTeacher.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg text-white px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
              style={{ background: '#10b981' }}
            >
              💬 WhatsApp
            </a>
          )}
          <button
            onClick={onRequestCallback}
            className="flex items-center gap-2 rounded-lg text-white px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{ background: '#3b82f6' }}
          >
            🔔 Request Callback
          </button>
        </div>
      </div>
    </div>
  );
}
