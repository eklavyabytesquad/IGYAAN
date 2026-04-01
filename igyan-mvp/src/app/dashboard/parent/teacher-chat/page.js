"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/utils/auth_context";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import TeacherInfoCard from "./components/TeacherInfoCard";
import ComplaintModal from "./components/ComplaintModal";
import { MESSAGE_FLAGS } from "./components/constants";

export default function TeacherChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--dashboard-primary)' }}></div></div>}>
      <TeacherChatContent />
    </Suspense>
  );
}

function TeacherChatContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "chat";
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [classTeacher, setClassTeacher] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [hwMessage, setHwMessage] = useState("");

  // Set initial tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Fetch children linked to this parent
  useEffect(() => {
    if (user?.id) fetchChildren();
  }, [user]);

  // When child is selected, fetch class teacher
  useEffect(() => {
    if (selectedChild?.id) {
      setClassTeacher(null);
      setConversation(null);
      setMessages([]);
      fetchClassTeacher();
    }
  }, [selectedChild]);

  // When conversation ready, fetch data
  useEffect(() => {
    if (conversation?.id) {
      fetchMessages();
      fetchCallLogs();
      fetchComplaints();
    }
  }, [conversation]);

  // ─── Realtime: Subscribe to new messages in active conversation ───
  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel(`parent-msgs-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "parent_teacher_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            // Skip if already in state (our own optimistic message)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Replace temp optimistic message from the same sender with real one
            const cleaned = prev.filter(
              (m) =>
                !(m.id?.toString().startsWith("temp-") &&
                  m.sender_id === newMsg.sender_id &&
                  m.message_text === newMsg.message_text)
            );
            return [...cleaned, newMsg];
          });
          // If incoming message is from teacher, mark as read
          if (newMsg.sender_id !== user?.id) {
            supabase
              .from("parent_teacher_messages")
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq("id", newMsg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // ─── FETCH CHILDREN via parent_student_assignments ───
  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from("parent_student_assignments")
        .select(`
          id,
          relationship,
          student_id,
          student:student_id (
            id,
            full_name,
            email,
            phone,
            school_id
          )
        `)
        .eq("parent_id", user.id);

      if (error) throw error;

      const childList = (data || [])
        .filter((d) => d.student)
        .map((d) => ({
          id: d.student.id,
          name: d.student.full_name,
          email: d.student.email || "",
          phone: d.student.phone || "",
          school_id: d.student.school_id,
          relationship: d.relationship,
        }));

      setChildren(childList);
      if (childList.length > 0) setSelectedChild(childList[0]);
      else setLoading(false);
    } catch (err) {
      console.error("Error fetching children:", err);
      setChildren([]);
      setLoading(false);
    }
  };

  // ─── FETCH CLASS TEACHER via class_students → faculty_assignments ───
  // ALL queries are filtered by school_id so teachers from other schools never appear
  const fetchClassTeacher = async () => {
    setLoading(true);
    setClassTeacher(null);
    try {
      // Determine the school_id — use the child's school or the parent's school
      const schoolId = selectedChild?.school_id || user?.school_id;
      if (!schoolId) {
        console.error("No school_id found for child or parent");
        setLoading(false);
        return;
      }

      // Step 1: Find the child's active class enrollment IN THIS SCHOOL
      const { data: enrollments, error: enrollErr } = await supabase
        .from("class_students")
        .select(`
          id,
          class_id,
          session_id,
          school_id,
          classes (
            id,
            class_name,
            section,
            school_id
          )
        `)
        .eq("student_id", selectedChild.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (enrollErr || !enrollments || enrollments.length === 0) {
        console.warn("No active enrollment found for student");
        setLoading(false);
        return;
      }

      // Filter enrollments to match the parent/child's school
      const enrollment = enrollments.find(
        (e) => e.school_id === schoolId || e.classes?.school_id === schoolId
      ) || null;

      if (!enrollment) {
        console.warn("No enrollment found in this school for student");
        setLoading(false);
        return;
      }

      const classId = enrollment.class_id;
      const sessionId = enrollment.session_id;
      const className = `${enrollment.classes?.class_name || ""} - ${enrollment.classes?.section || ""}`;

      // Step 2: Find the class teacher from faculty_assignments
      // MUST match school_id + class_id + assignment_type = 'class_teacher'
      const { data: teacherAssignment } = await supabase
        .from("faculty_assignments")
        .select(`
          id,
          faculty_id,
          school_id,
          teacher:faculty_id (
            id,
            full_name,
            email,
            phone,
            school_id
          )
        `)
        .eq("class_id", classId)
        .eq("school_id", schoolId)
        .eq("assignment_type", "class_teacher")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (teacherAssignment?.teacher && teacherAssignment.teacher.school_id === schoolId) {
        const t = teacherAssignment.teacher;
        const teacher = {
          id: t.id,
          name: t.full_name || "Class Teacher",
          email: t.email || "",
          phone: t.phone || "",
          className,
        };
        setClassTeacher(teacher);
        await findOrCreateConversation(teacher.id, classId);
        setLoading(false);
        return;
      }

      // Fallback: Also match session_id + school_id
      const { data: fallback } = await supabase
        .from("faculty_assignments")
        .select(`
          id,
          faculty_id,
          school_id,
          teacher:faculty_id (
            id,
            full_name,
            email,
            phone,
            school_id
          )
        `)
        .eq("class_id", classId)
        .eq("session_id", sessionId)
        .eq("school_id", schoolId)
        .eq("assignment_type", "class_teacher")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (fallback?.teacher && fallback.teacher.school_id === schoolId) {
        const t = fallback.teacher;
        const teacher = {
          id: t.id,
          name: t.full_name || "Class Teacher",
          email: t.email || "",
          phone: t.phone || "",
          className,
        };
        setClassTeacher(teacher);
        await findOrCreateConversation(teacher.id, classId);
        setLoading(false);
        return;
      }

      // No class teacher found for this school
      console.warn("No class teacher assigned for class:", classId, "in school:", schoolId);
      setClassTeacher(null);
    } catch (err) {
      console.error("Error fetching class teacher:", err);
      setClassTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  // ─── FIND OR CREATE CONVERSATION ───
  const findOrCreateConversation = async (teacherId, classId) => {
    try {
      // Determine school_id with multiple fallbacks
      let schoolId = user.school_id || selectedChild?.school_id;

      // If still no school_id, fetch from teacher's user record
      if (!schoolId) {
        const { data: teacherUser } = await supabase
          .from("users")
          .select("school_id")
          .eq("id", teacherId)
          .maybeSingle();
        if (teacherUser?.school_id) schoolId = teacherUser.school_id;
      }

      // Check existing conversation (match by parent + teacher + student)
      const { data: existing, error: selectErr } = await supabase
        .from("parent_teacher_conversations")
        .select("*")
        .eq("parent_id", user.id)
        .eq("teacher_id", teacherId)
        .eq("student_id", selectedChild.id)
        .maybeSingle();

      if (selectErr) {
        console.error("Error checking existing conversation:", selectErr);
      }

      if (existing) {
        setConversation(existing);
        return;
      }

      if (!schoolId) {
        console.error("Cannot create conversation: school_id is missing. User:", user.id);
        return;
      }

      // Create new conversation using upsert to handle race conditions / unique constraint
      const { data: newConv, error } = await supabase
        .from("parent_teacher_conversations")
        .upsert(
          {
            school_id: schoolId,
            parent_id: user.id,
            teacher_id: teacherId,
            student_id: selectedChild.id,
            class_id: classId || null,
          },
          { onConflict: "school_id,parent_id,teacher_id,student_id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Upsert conversation failed:", error);
        // Final fallback: re-fetch in case another request created it
        const { data: retry } = await supabase
          .from("parent_teacher_conversations")
          .select("*")
          .eq("parent_id", user.id)
          .eq("teacher_id", teacherId)
          .eq("student_id", selectedChild.id)
          .maybeSingle();
        if (retry) {
          setConversation(retry);
          return;
        }
        throw error;
      }
      setConversation(newConv);
    } catch (err) {
      console.error("Error with conversation:", err?.message || err?.code || JSON.stringify(err));
    }
  };

  // ─── FETCH MESSAGES ───
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("parent_teacher_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from("parent_teacher_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", user.id)
        .eq("is_read", false);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchCallLogs = async () => {
    try {
      const { data } = await supabase
        .from("parent_teacher_call_logs")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setCallLogs(data || []);
    } catch (err) {
      console.error("Error fetching call logs:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await supabase
        .from("parent_complaints")
        .select("*")
        .eq("parent_id", user.id)
        .eq("student_id", selectedChild.id)
        .order("created_at", { ascending: false });
      setComplaints(data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  // ─── SEND MESSAGE ───
  const sendMessage = async (text, flag) => {
    if (!text.trim() || !conversation?.id) return;
    setSending(true);

    const flagConfig = MESSAGE_FLAGS[flag];

    // Optimistic: add message to state immediately so it appears in chat
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      school_id: user.school_id || selectedChild?.school_id,
      sender_id: user.id,
      sender_role: "parent",
      message_text: text,
      flag: flag,
      flag_label: flag !== "general" ? flagConfig.label : null,
      is_read: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { error } = await supabase.from("parent_teacher_messages").insert({
        conversation_id: conversation.id,
        school_id: user.school_id || selectedChild?.school_id,
        sender_id: user.id,
        sender_role: "parent",
        message_text: text,
        flag: flag,
        flag_label: flag !== "general" ? flagConfig.label : null,
      });

      if (error) throw error;

      // Update conversation
      await supabase
        .from("parent_teacher_conversations")
        .update({
          last_message_at: new Date().toISOString(),
          unread_teacher: (conversation.unread_teacher || 0) + 1,
        })
        .eq("id", conversation.id);

      // Realtime will deliver the message — no need to refetch
    } catch (err) {
      console.error("Error sending message:", err?.message || err?.code || JSON.stringify(err));
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  // ─── REQUEST CALLBACK ───
  const requestCallback = async () => {
    if (!conversation?.id) {
      alert("No conversation active. Please wait for teacher assignment.");
      return;
    }
    try {
      await supabase.from("parent_teacher_call_logs").insert({
        conversation_id: conversation.id,
        school_id: user.school_id || selectedChild?.school_id,
        caller_id: user.id,
        caller_role: "parent",
        call_type: "callback_request",
        call_status: "requested",
      });

      await supabase.from("parent_teacher_messages").insert({
        conversation_id: conversation.id,
        school_id: user.school_id || selectedChild?.school_id,
        sender_id: user.id,
        sender_role: "parent",
        message_text: "📞 Callback requested — Please call me at your earliest convenience.",
        flag: "urgent",
        flag_label: "CALLBACK",
      });

      fetchCallLogs();
      fetchMessages();
      alert("✅ Callback request sent to class teacher!");
    } catch (err) {
      console.error("Error requesting callback:", err);
    }
  };

  // ─── SUBMIT COMPLAINT ───
  const submitComplaint = async (form) => {
    try {
      const { error } = await supabase.from("parent_complaints").insert({
        school_id: user.school_id || selectedChild?.school_id,
        parent_id: user.id,
        student_id: selectedChild.id,
        teacher_id: classTeacher?.id || null,
        complaint_type: form.complaint_type,
        subject: form.subject,
        description: form.description,
        priority: form.priority,
      });

      if (error) throw error;

      // Also send as flagged message in chat
      if (conversation?.id) {
        await supabase.from("parent_teacher_messages").insert({
          conversation_id: conversation.id,
          school_id: user.school_id || selectedChild?.school_id,
          sender_id: user.id,
          sender_role: "parent",
          message_text: `🚩 COMPLAINT: ${form.subject}\n\n${form.description}`,
          flag: "complaint",
          flag_label: "COMPLAINT",
        });
        fetchMessages();
      }

      setShowComplaintModal(false);
      fetchComplaints();
      alert("✅ Complaint submitted successfully!");
    } catch (err) {
      console.error("Error submitting complaint:", err);
      alert("Error submitting complaint. Please try again.");
    }
  };

  // ─── SEND HW QUERY ───
  const sendHwQuery = async () => {
    if (!hwMessage.trim()) return;
    await sendMessage(hwMessage.trim(), "homework");
    setHwMessage("");
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // ─── TAB CONFIG ───
  const tabs = [
    { key: "chat", label: "💬 Chat", desc: "Direct messages" },
    { key: "call", label: "📞 Call", desc: "Call & callback" },
    { key: "complaint", label: "🚩 Complaint", desc: "File complaints" },
    { key: "homework", label: "📚 Homework", desc: "HW queries" },
  ];

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--dashboard-primary)' }}></div>
          <p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>Loading class teacher info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--dashboard-heading)' }}>
            👨‍🏫 Class Teacher Communication
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--dashboard-muted)' }}>
            Chat, call, or raise concerns directly with your child&apos;s class teacher
          </p>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>Child:</label>
            <select
              value={selectedChild?.id || ""}
              onChange={(e) => {
                const child = children.find((c) => c.id === e.target.value);
                setSelectedChild(child);
              }}
              className="rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-heading)', outlineColor: 'var(--dashboard-primary)' }}
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {children.length === 1 && selectedChild && (
          <div className="rounded-lg px-3 py-1.5 text-sm" style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }}>
            👧 {selectedChild.name}
          </div>
        )}
      </div>

      {/* Teacher Info Card */}
      <TeacherInfoCard classTeacher={classTeacher} onRequestCallback={requestCallback} />

      {/* If no teacher assigned, show message and block all tabs */}
      {!classTeacher && !loading && (
        <div className="rounded-xl border-2 border-dashed p-10 text-center space-y-4" style={{ borderColor: 'var(--dashboard-border)', background: 'var(--dashboard-surface-muted)' }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'color-mix(in srgb, #f59e0b 15%, transparent)' }}>
            <span className="text-4xl">👨‍🏫</span>
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
            No Class Teacher Assigned Yet
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--dashboard-muted)' }}>
            A class teacher has not been assigned to {selectedChild?.name || "your child"}&apos;s class in your school yet.
            Please contact your school administration to assign a class teacher.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm" style={{ background: 'color-mix(in srgb, #f59e0b 10%, transparent)', border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)', color: '#f59e0b' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            Chat, call, complaint, and homework features will be available once a teacher is assigned.
          </div>
        </div>
      )}

      {/* Tab Navigation — only show when teacher is assigned */}
      {classTeacher && (<>
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--dashboard-surface-muted)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
            style={
              activeTab === tab.key
                ? { background: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-heading)', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                : { color: 'var(--dashboard-muted)' }
            }
          >
            <span className="block">{tab.label}</span>
            <span className="block text-xs opacity-70">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* ════════════════ CHAT TAB ════════════════ */}
      {activeTab === "chat" && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
          <ChatMessages
            messages={messages}
            userId={user?.id}
            classTeacherName={classTeacher?.name}
            formatTime={formatTime}
          />
          <ChatInput onSend={sendMessage} sending={sending} />
        </div>
      )}

      {/* ════════════════ CALL TAB ════════════════ */}
      {activeTab === "call" && (
        <div className="space-y-4">
          {/* Quick Call Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classTeacher?.phone ? (
              <a
                href={`tel:${classTeacher.phone}`}
                className="flex flex-col items-center gap-3 rounded-xl p-6 transition-colors hover:opacity-90"
                style={{ border: '2px solid color-mix(in srgb, var(--dashboard-primary) 40%, transparent)', background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)' }}
              >
                <span className="text-4xl">📞</span>
                <span className="font-semibold" style={{ color: 'var(--dashboard-primary)' }}>Voice Call</span>
                <span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>{classTeacher.phone}</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl p-6 opacity-50" style={{ border: '2px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)' }}>
                <span className="text-4xl">📞</span>
                <span className="font-semibold" style={{ color: 'var(--dashboard-muted)' }}>No Phone</span>
                <span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Phone not available</span>
              </div>
            )}
            <a
              href={
                classTeacher?.phone
                  ? `https://wa.me/${classTeacher.phone.replace(/[^0-9]/g, "")}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-3 rounded-xl p-6 transition-colors ${
                classTeacher?.phone
                  ? "hover:opacity-90"
                  : "opacity-50 pointer-events-none"
              }`}
              style={{ border: '2px solid color-mix(in srgb, #10b981 40%, transparent)', background: 'color-mix(in srgb, #10b981 8%, transparent)' }}
            >
              <span className="text-4xl">💬</span>
              <span className="font-semibold" style={{ color: '#10b981' }}>WhatsApp</span>
              <span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Open in WhatsApp</span>
            </a>
            <button
              onClick={requestCallback}
              className="flex flex-col items-center gap-3 rounded-xl p-6 transition-colors hover:opacity-90"
              style={{ border: '2px solid color-mix(in srgb, #3b82f6 40%, transparent)', background: 'color-mix(in srgb, #3b82f6 8%, transparent)' }}
            >
              <span className="text-4xl">🔔</span>
              <span className="font-semibold" style={{ color: '#3b82f6' }}>Request Callback</span>
              <span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Teacher will call you back</span>
            </button>
          </div>

          {/* Call History */}
          <div className="rounded-xl" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--dashboard-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>📋 Call History</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--dashboard-border)' }}>
              {callLogs.length === 0 ? (
                <div className="p-8 text-center text-sm" style={{ color: 'var(--dashboard-muted)' }}>No call history yet</div>
              ) : (
                callLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {log.call_type === "callback_request"
                          ? "🔔"
                          : log.call_type === "video"
                          ? "📹"
                          : "📞"}
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--dashboard-heading)' }}>
                          {log.call_type === "callback_request" ? "Callback Request" : "Call"}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                          {formatDate(log.created_at)} • {formatTime(log.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={
                        log.call_status === "completed"
                          ? { background: 'color-mix(in srgb, #10b981 15%, transparent)', color: '#10b981' }
                          : log.call_status === "requested"
                          ? { background: 'color-mix(in srgb, #3b82f6 15%, transparent)', color: '#3b82f6' }
                          : log.call_status === "missed"
                          ? { background: 'color-mix(in srgb, #ef4444 15%, transparent)', color: '#ef4444' }
                          : { background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-muted)' }
                      }
                    >
                      {log.call_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ COMPLAINT TAB ════════════════ */}
      {activeTab === "complaint" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>🚩 My Complaints</h3>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="rounded-lg text-white px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
              style={{ background: '#ef4444' }}
            >
              + File New Complaint
            </button>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="rounded-xl p-8 text-center text-sm" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-muted)' }}>
                No complaints filed yet
              </div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl p-4"
                  style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                            c.priority === "critical"
                              ? "bg-red-500"
                              : c.priority === "high"
                              ? "bg-orange-500"
                              : c.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-zinc-500"
                          }`}
                        >
                          {c.priority.toUpperCase()}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={
                            c.status === "open"
                              ? { background: 'color-mix(in srgb, #3b82f6 15%, transparent)', color: '#3b82f6' }
                              : c.status === "in_progress"
                              ? { background: 'color-mix(in srgb, #f59e0b 15%, transparent)', color: '#f59e0b' }
                              : c.status === "resolved"
                              ? { background: 'color-mix(in srgb, #10b981 15%, transparent)', color: '#10b981' }
                              : c.status === "escalated"
                              ? { background: 'color-mix(in srgb, #ef4444 15%, transparent)', color: '#ef4444' }
                              : { background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-muted)' }
                          }
                        >
                          {c.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-muted)' }}>
                          {c.complaint_type}
                        </span>
                      </div>
                      <h4 className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{c.subject}</h4>
                      <p className="text-sm mt-1" style={{ color: 'var(--dashboard-text)' }}>{c.description}</p>
                      {c.resolution_notes && (
                        <div className="mt-2 rounded-lg p-2" style={{ background: 'color-mix(in srgb, #10b981 10%, transparent)', border: '1px solid color-mix(in srgb, #10b981 30%, transparent)' }}>
                          <p className="text-xs" style={{ color: '#10b981' }}>
                            <strong>✅ Resolution:</strong> {c.resolution_notes}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--dashboard-muted)' }}>{formatDate(c.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <ComplaintModal
            isOpen={showComplaintModal}
            onClose={() => setShowComplaintModal(false)}
            onSubmit={submitComplaint}
          />
        </div>
      )}

      {/* ════════════════ HOMEWORK TAB ════════════════ */}
      {activeTab === "homework" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📚</span>
              <h3 className="font-semibold text-blue-700 dark:text-blue-400">Homework Queries</h3>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Send homework-related questions directly to the class teacher. Messages are tagged with{" "}
              <strong className="text-blue-700 dark:text-blue-400">HW</strong> flag for quick identification.
            </p>
          </div>

          {/* Quick HW message sender */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <h4 className="font-medium text-zinc-900 dark:text-white">Send Homework Query</h4>
            <textarea
              value={hwMessage}
              onChange={(e) => setHwMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendHwQuery();
                }
              }}
              placeholder="E.g., What is the homework for Maths today? / My child didn't understand the Science assignment..."
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <button
                onClick={sendHwQuery}
                disabled={sending || !hwMessage.trim()}
                className="rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 text-sm font-medium transition-colors flex items-center gap-2"
              >
                📚 Send as HW Query
                {sending && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* HW-flagged messages history */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div className="border-b border-zinc-200 dark:border-zinc-700 px-4 py-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">📝 Previous HW Queries</h3>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {messages.filter((m) => m.flag === "homework").length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-sm">No homework queries yet</div>
              ) : (
                messages
                  .filter((m) => m.flag === "homework")
                  .map((msg) => (
                    <div key={msg.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs font-bold">
                          📚 HW
                        </span>
                        <span className="text-xs text-zinc-400">
                          {msg.sender_id === user?.id ? "You" : classTeacher?.name || "Teacher"} •{" "}
                          {formatDate(msg.created_at)} {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {msg.message_text}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
