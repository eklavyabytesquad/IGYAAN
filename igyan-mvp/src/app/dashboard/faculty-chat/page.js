"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/utils/auth_context";
import { MESSAGE_FLAGS } from "../parent/teacher-chat/components/constants";

export default function FacultyChatPage() {
  const { user } = useAuth();

  // ─── STATE ───
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [classParents, setClassParents] = useState([]); // All parent-student pairs
  const [conversations, setConversations] = useState([]); // Existing conversations
  const [contacts, setContacts] = useState([]); // Merged list for sidebar
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageFlag, setMessageFlag] = useState("general");
  const [filterFlag, setFilterFlag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── INIT: Check class teacher status ───
  useEffect(() => {
    if (user?.id) checkClassTeacherStatus();
  }, [user]);

  // ─── When classes loaded → fetch parents + conversations ───
  useEffect(() => {
    if (assignedClasses.length > 0) {
      fetchClassParents();
      fetchConversations();
    }
  }, [assignedClasses]);

  // ─── Merge parents + conversations into contacts ───
  useEffect(() => {
    if (classParents.length === 0 && conversations.length === 0) return;

    const merged = classParents.map((parent) => {
      const conv = conversations.find(
        (c) => c.parent_id === parent.parentId && c.student_id === parent.studentId
      );
      return {
        ...parent,
        conversationId: conv?.id || null,
        conversation: conv || null,
        unreadTeacher: conv?.unread_teacher || 0,
        lastMessageAt: conv?.last_message_at || null,
      };
    });

    // Also add any conversations whose parents aren't in classParents
    // (e.g., from a previous session or different assignment)
    conversations.forEach((conv) => {
      const alreadyMerged = merged.find(
        (m) => m.parentId === conv.parent_id && m.studentId === conv.student_id
      );
      if (!alreadyMerged) {
        merged.push({
          parentId: conv.parent_id,
          parentName: conv.parent?.full_name || "Parent",
          parentEmail: conv.parent?.email || "",
          parentPhone: conv.parent?.phone || "",
          studentId: conv.student_id,
          studentName: conv.student?.full_name || "Student",
          classId: conv.class_id,
          className: "",
          relationship: "",
          conversationId: conv.id,
          conversation: conv,
          unreadTeacher: conv.unread_teacher || 0,
          lastMessageAt: conv.last_message_at || null,
        });
      }
    });

    // Sort: unread first → recent messages → alphabetical
    merged.sort((a, b) => {
      if (a.unreadTeacher > 0 && b.unreadTeacher === 0) return -1;
      if (b.unreadTeacher > 0 && a.unreadTeacher === 0) return 1;
      if (a.lastMessageAt && b.lastMessageAt)
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return (a.parentName || "").localeCompare(b.parentName || "");
    });

    setContacts(merged);
  }, [classParents, conversations]);

  // ─── When conversation is active → fetch messages ───
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages();
      markMessagesRead();
    }
  }, [activeConversation]);

  // ─── Realtime: Subscribe to new messages in active conversation ───
  useEffect(() => {
    if (!activeConversation?.id) return;

    const channel = supabase
      .channel(`faculty-msgs-${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "parent_teacher_messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
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
          // If incoming message is from the other side, mark as read
          if (newMsg.sender_id !== user?.id) {
            markMessagesRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  // ─── Realtime: Subscribe to conversation updates for sidebar unread counts ───
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`faculty-convos-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "parent_teacher_conversations",
          filter: `teacher_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new;
          // Update sidebar unread counts
          setContacts((prev) =>
            prev.map((c) =>
              c.conversationId === updated.id
                ? {
                    ...c,
                    unreadTeacher: updated.unread_teacher || 0,
                    lastMessageAt: updated.last_message_at || c.lastMessageAt,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ═══════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════

  const checkClassTeacherStatus = async () => {
    setLoading(true);
    try {
      const { data: assignments, error } = await supabase
        .from("faculty_assignments")
        .select(`
          id,
          class_id,
          session_id,
          classes:class_id (
            id,
            class_name,
            section
          )
        `)
        .eq("faculty_id", user.id)
        .eq("assignment_type", "class_teacher")
        .eq("is_active", true);

      if (error) throw error;

      if (assignments && assignments.length > 0) {
        setIsClassTeacher(true);
        setAssignedClasses(
          assignments.map((a) => ({
            id: a.class_id,
            name: `${a.classes?.class_name || "Class"} - ${a.classes?.section || ""}`,
            sessionId: a.session_id,
          }))
        );
      } else {
        // Fallback: faculty_profiles
        const { data: profile } = await supabase
          .from("faculty_profiles")
          .select("user_id, is_class_teacher, class, section")
          .eq("user_id", user.id)
          .eq("is_class_teacher", true)
          .maybeSingle();

        if (profile) {
          setIsClassTeacher(true);
          setAssignedClasses([
            {
              id: null,
              name: `${profile.class || ""} - ${profile.section || ""}`,
              sessionId: null,
            },
          ]);
        } else {
          setIsClassTeacher(false);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error checking class teacher status:", err);
      setLoading(false);
    }
  };

  // ─── Fetch ALL parents of students in the teacher's classes ───
  const fetchClassParents = async () => {
    try {
      const classIds = assignedClasses.map((c) => c.id).filter(Boolean);
      if (classIds.length === 0) {
        setLoading(false);
        return;
      }

      // Step 1: Get active students in these classes
      const { data: studentRows, error: studErr } = await supabase
        .from("class_students")
        .select(`
          student_id,
          class_id,
          classes:class_id (class_name, section),
          student:student_id (id, full_name)
        `)
        .in("class_id", classIds)
        .eq("status", "active");

      if (studErr) throw studErr;
      if (!studentRows || studentRows.length === 0) {
        setClassParents([]);
        setLoading(false);
        return;
      }

      const studentIds = [...new Set(studentRows.map((s) => s.student_id))];

      // Step 2: Get parents for these students
      const { data: parentLinks, error: parentErr } = await supabase
        .from("parent_student_assignments")
        .select(`
          parent_id,
          student_id,
          relationship,
          parent:parent_id (id, full_name, email, phone)
        `)
        .in("student_id", studentIds);

      if (parentErr) throw parentErr;

      // Step 3: Build parent-student list with class info
      const parentList = (parentLinks || [])
        .filter((pl) => pl.parent)
        .map((pl) => {
          const studentInfo = studentRows.find((s) => s.student_id === pl.student_id);
          return {
            parentId: pl.parent.id,
            parentName: pl.parent.full_name || "Parent",
            parentEmail: pl.parent.email || "",
            parentPhone: pl.parent.phone || "",
            studentId: pl.student_id,
            studentName: studentInfo?.student?.full_name || "Student",
            classId: studentInfo?.class_id,
            className: `${studentInfo?.classes?.class_name || ""} - ${studentInfo?.classes?.section || ""}`,
            relationship: pl.relationship || "",
          };
        });

      setClassParents(parentList);
    } catch (err) {
      console.error("Error fetching class parents:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch existing conversations ───
  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("parent_teacher_conversations")
        .select(`
          id,
          school_id,
          parent_id,
          teacher_id,
          student_id,
          class_id,
          unread_teacher,
          unread_parent,
          last_message_at,
          parent:parent_id (id, full_name, email, phone),
          student:student_id (id, full_name)
        `)
        .eq("teacher_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  // ─── Select a contact & ensure conversation exists ───
  const selectContact = async (contact) => {
    setSelectedContact(contact);
    setMessages([]);
    setFilterFlag("all");

    if (contact.conversationId && contact.conversation) {
      // Conversation already exists
      setActiveConversation(contact.conversation);
    } else {
      // Create conversation for this parent-student pair
      setLoadingChat(true);
      try {
        const schoolId = user.school_id;

        // First check if one already exists (race condition guard)
        const { data: existing } = await supabase
          .from("parent_teacher_conversations")
          .select("*")
          .eq("parent_id", contact.parentId)
          .eq("teacher_id", user.id)
          .eq("student_id", contact.studentId)
          .maybeSingle();

        if (existing) {
          setActiveConversation(existing);
          // Update contact in list
          setContacts((prev) =>
            prev.map((c) =>
              c.parentId === contact.parentId && c.studentId === contact.studentId
                ? { ...c, conversationId: existing.id, conversation: existing }
                : c
            )
          );
          setLoadingChat(false);
          return;
        }

        if (!schoolId) {
          console.error("Cannot create conversation: school_id is missing");
          setLoadingChat(false);
          return;
        }

        const { data: newConv, error } = await supabase
          .from("parent_teacher_conversations")
          .upsert(
            {
              school_id: schoolId,
              parent_id: contact.parentId,
              teacher_id: user.id,
              student_id: contact.studentId,
              class_id: contact.classId || null,
            },
            { onConflict: "school_id,parent_id,teacher_id,student_id" }
          )
          .select()
          .single();

        if (error) throw error;

        setActiveConversation(newConv);
        // Update contact in list
        setContacts((prev) =>
          prev.map((c) =>
            c.parentId === contact.parentId && c.studentId === contact.studentId
              ? { ...c, conversationId: newConv.id, conversation: newConv }
              : c
          )
        );
      } catch (err) {
        console.error("Error creating conversation:", err?.message || err?.code || JSON.stringify(err));
      } finally {
        setLoadingChat(false);
      }
    }
  };

  // ─── Fetch messages ───
  const fetchMessages = async () => {
    if (!activeConversation?.id) return;
    try {
      const { data, error } = await supabase
        .from("parent_teacher_messages")
        .select("*")
        .eq("conversation_id", activeConversation.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // ─── Mark messages read ───
  const markMessagesRead = async () => {
    if (!activeConversation?.id) return;
    try {
      await supabase
        .from("parent_teacher_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("conversation_id", activeConversation.id)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      await supabase
        .from("parent_teacher_conversations")
        .update({ unread_teacher: 0 })
        .eq("id", activeConversation.id);

      // Update local state
      setContacts((prev) =>
        prev.map((c) =>
          c.conversationId === activeConversation.id
            ? { ...c, unreadTeacher: 0 }
            : c
        )
      );
    } catch (err) {
      console.error("Error marking messages read:", err);
    }
  };

  // ═══════════════════════════════════════════════
  // SEND MESSAGE — optimistic
  // ═══════════════════════════════════════════════

  const sendMessage = async () => {
    if (!messageText.trim() || !activeConversation?.id) return;
    setSending(true);

    const text = messageText.trim();
    const flag = messageFlag;
    const flagConfig = MESSAGE_FLAGS[flag];

    // Optimistic add
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      school_id: user.school_id,
      sender_id: user.id,
      sender_role: "faculty",
      message_text: text,
      flag: flag,
      flag_label: flag !== "general" ? flagConfig.label : null,
      is_read: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageText("");
    setMessageFlag("general");

    try {
      const { error } = await supabase.from("parent_teacher_messages").insert({
        conversation_id: activeConversation.id,
        school_id: user.school_id || activeConversation.school_id,
        sender_id: user.id,
        sender_role: "faculty",
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
          unread_parent: (activeConversation.unread_parent || 0) + 1,
        })
        .eq("id", activeConversation.id);

      // Update local contact lastMessageAt for sorting
      setContacts((prev) =>
        prev.map((c) =>
          c.conversationId === activeConversation.id
            ? { ...c, lastMessageAt: new Date().toISOString() }
            : c
        )
      );

      // Realtime will deliver the message — no need to refetch
    } catch (err) {
      console.error("Error sending message:", err?.message || err?.code || JSON.stringify(err));
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // Filtered contacts by search
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.parentName || "").toLowerCase().includes(q) ||
      (c.studentName || "").toLowerCase().includes(q)
    );
  });

  // Filtered messages by flag
  const filteredMessages =
    filterFlag === "all"
      ? messages
      : messages.filter((m) => m.flag === filterFlag);

  // ═══════════════════════════════════════════════
  // NOT A CLASS TEACHER
  // ═══════════════════════════════════════════════

  if (!loading && !isClassTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <span className="text-4xl">👨‍🏫</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Class Teacher Access Only
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Parent messaging is available only for faculty members assigned as
            class teachers. If you believe this is an error, please contact your
            school administrator.
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-sm text-zinc-500">Loading parent conversations...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            💬 Parent Messages
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Communicate with parents of your class students
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {assignedClasses.map((cls, i) => (
            <span
              key={i}
              className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
            >
              🏫 {cls.name}
            </span>
          ))}
          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs text-zinc-500">
            {contacts.length} parent{contacts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ════════ MAIN CHAT LAYOUT ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* ──── LEFT: Contact / Parent List ──── */}
        <div className="lg:col-span-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                placeholder="Search parents or students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <span className="text-3xl mb-2">📭</span>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {searchQuery
                    ? "No matching parents found"
                    : "No parents found for your classes. Parents will appear here once students are enrolled."}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact, idx) => {
                const isSelected =
                  selectedContact?.parentId === contact.parentId &&
                  selectedContact?.studentId === contact.studentId;
                const hasUnread = contact.unreadTeacher > 0;
                const hasConversation = !!contact.conversationId;

                return (
                  <button
                    key={`${contact.parentId}-${contact.studentId}-${idx}`}
                    onClick={() => selectContact(contact)}
                    className={`w-full flex items-start gap-3 p-3 border-b border-zinc-100 dark:border-zinc-800 transition-colors text-left ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-l-indigo-500"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                          : hasUnread
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                          : "bg-gradient-to-br from-zinc-400 to-zinc-500 dark:from-zinc-600 dark:to-zinc-700"
                      }`}
                    >
                      {contact.parentName?.charAt(0)?.toUpperCase() || "P"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            hasUnread
                              ? "text-zinc-900 dark:text-white"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {contact.parentName}
                        </p>
                        {contact.lastMessageAt ? (
                          <span className="text-xs text-zinc-400 whitespace-nowrap">
                            {formatRelativeTime(contact.lastMessageAt)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        👧 {contact.studentName}
                        {contact.className && (
                          <span className="text-zinc-400 dark:text-zinc-500">
                            {" "}
                            • {contact.className}
                          </span>
                        )}
                      </p>
                      {contact.relationship && (
                        <p className="text-[10px] text-zinc-400 capitalize">
                          {contact.relationship}
                        </p>
                      )}
                    </div>

                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="shrink-0 flex items-center justify-center h-5 min-w-5 rounded-full bg-indigo-500 text-white text-xs font-bold px-1.5">
                        {contact.unreadTeacher}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Stats footer */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                {contacts.length} parent{contacts.length !== 1 ? "s" : ""}
              </span>
              <span>
                {contacts.reduce((acc, c) => acc + (c.unreadTeacher || 0), 0)}{" "}
                unread
              </span>
            </div>
          </div>
        </div>

        {/* ──── RIGHT: Chat Area ──── */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          {!selectedContact ? (
            /* No contact selected */
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <span className="text-5xl mb-3">💬</span>
              <p className="text-sm font-medium">
                Select a parent to start chatting
              </p>
              <p className="text-xs mt-1">
                All parents of your class students are listed on the left
              </p>
            </div>
          ) : loadingChat ? (
            /* Loading chat */
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
              <p className="text-sm">Setting up conversation...</p>
            </div>
          ) : (
            <>
              {/* ─── Chat Header ─── */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {selectedContact.parentName?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {selectedContact.parentName}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Parent of {selectedContact.studentName}
                      {selectedContact.className && (
                        <> • {selectedContact.className}</>
                      )}
                      {selectedContact.parentPhone && (
                        <> • {selectedContact.parentPhone}</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick actions + filter */}
                <div className="flex items-center gap-2">
                  {selectedContact.parentPhone && (
                    <a
                      href={`tel:${selectedContact.parentPhone}`}
                      className="rounded-lg bg-green-500 hover:bg-green-600 text-white p-2 transition-colors"
                      title="Call parent"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFilterFlag("all")}
                      className={`rounded-full px-2 py-1 text-xs font-medium transition-all ${
                        filterFlag === "all"
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      All
                    </button>
                    {Object.entries(MESSAGE_FLAGS)
                      .filter(([key]) => key !== "general")
                      .map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => setFilterFlag(key)}
                          className={`rounded-full px-2 py-1 text-xs font-medium transition-all ${
                            filterFlag === key
                              ? val.color + " ring-2 ring-offset-1"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {val.icon}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* ─── Messages ─── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                    <span className="text-4xl mb-2">💬</span>
                    <p className="text-sm">
                      {filterFlag !== "all"
                        ? `No ${MESSAGE_FLAGS[filterFlag]?.label || ""} messages`
                        : "No messages yet. Send the first message!"}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    const flagInfo =
                      MESSAGE_FLAGS[msg.flag] || MESSAGE_FLAGS.general;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMe
                              ? "bg-indigo-500 text-white rounded-br-md"
                              : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-bl-md"
                          }`}
                        >
                          {/* Sender label */}
                          {!isMe && (
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">
                              {selectedContact.parentName}
                            </p>
                          )}

                          {/* Flag badge */}
                          {msg.flag !== "general" && (
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold mb-1 ${
                                isMe ? "bg-white/20 text-white" : flagInfo.color
                              }`}
                            >
                              {flagInfo.icon} {flagInfo.label}
                            </span>
                          )}

                          <p className="text-sm whitespace-pre-wrap">
                            {msg.message_text}
                          </p>

                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span
                              className={`text-xs ${
                                isMe ? "text-indigo-100" : "text-zinc-400"
                              }`}
                            >
                              {formatTime(msg.created_at)}
                            </span>
                            {isMe && msg.is_read && (
                              <span className="text-xs text-indigo-100">✓✓</span>
                            )}
                            {isMe && !msg.is_read && (
                              <span className="text-xs text-indigo-200">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ─── Message Input ─── */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-900">
                {/* Flag selector */}
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    Tag:
                  </span>
                  {Object.entries(MESSAGE_FLAGS).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setMessageFlag(key)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap ${
                        messageFlag === key
                          ? key === "general"
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                            : val.color +
                              " ring-2 ring-offset-1 ring-current"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {val.icon} {val.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a reply to the parent..."
                    rows={2}
                    className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !messageText.trim()}
                    className="rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white p-3 transition-colors"
                  >
                    {sending ? (
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          strokeDasharray="60"
                          strokeDashoffset="20"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
