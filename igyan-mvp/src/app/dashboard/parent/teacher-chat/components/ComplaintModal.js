"use client";

import { useState } from "react";

const COMPLAINT_TYPES = [
  { value: "general", label: "General" },
  { value: "academic", label: "Academic" },
  { value: "behavior", label: "Behavior" },
  { value: "homework", label: "Homework" },
  { value: "facility", label: "Facility" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-zinc-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "critical", label: "Critical", color: "bg-red-500" },
];

export default function ComplaintModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    complaint_type: "general",
    priority: "medium",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    setForm({ subject: "", description: "", complaint_type: "general", priority: "medium" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 shadow-xl" style={{ background: 'var(--dashboard-surface-solid)', border: '1px solid var(--dashboard-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>🚩 File a Complaint</h3>
          <button onClick={onClose} className="text-xl hover:opacity-70" style={{ color: 'var(--dashboard-muted)' }}>✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--dashboard-text)' }}>Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief subject of complaint"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-heading)', outlineColor: '#ef4444' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--dashboard-text)' }}>Type</label>
              <select
                value={form.complaint_type}
                onChange={(e) => setForm({ ...form, complaint_type: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-heading)' }}
              >
                {COMPLAINT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--dashboard-text)' }}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-heading)' }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--dashboard-text)' }}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the issue in detail..."
              rows={4}
              className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
              style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-heading)', outlineColor: '#ef4444' }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.subject.trim() || !form.description.trim() || submitting}
              className="rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
