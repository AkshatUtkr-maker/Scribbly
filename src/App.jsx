import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ─── helpers ────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const fmtDate = (ts) =>
  ts
    ? new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

// ─── styles ─────────────────────────────────────────────────
const style = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body, #root { min-height: 100vh; background: #0e0e0e; color: #e8e4dc; font-family: 'DM Mono', monospace; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1a1a1a; }
::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 3px; }

.app { min-height: 100vh; display: flex; flex-direction: column; }

/* NAV */
.nav { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 2rem; border-bottom: 1px solid #222; background: #0e0e0e; position: sticky; top: 0; z-index: 100; }
.nav-logo { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #e8e4dc; letter-spacing: -0.02em; cursor: pointer; }
.nav-logo span { color: #c9b99a; font-style: italic; }
.nav-actions { display: flex; gap: 0.75rem; align-items: center; }

/* BUTTONS */
.btn { padding: 0.5rem 1.1rem; border-radius: 6px; font-family: 'DM Mono', monospace; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; letter-spacing: 0.04em; }
.btn-ghost { background: transparent; border-color: #333; color: #999; }
.btn-ghost:hover { border-color: #555; color: #e8e4dc; }
.btn-primary { background: #c9b99a; border-color: #c9b99a; color: #0e0e0e; font-weight: 500; }
.btn-primary:hover { background: #d4c5ab; }
.btn-danger { background: transparent; border-color: #5a2020; color: #c06060; }
.btn-danger:hover { background: #2a1010; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.72rem; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* HERO */
.hero { padding: 5rem 2rem 4rem; text-align: center; border-bottom: 1px solid #1a1a1a; }
.hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; color: #e8e4dc; letter-spacing: -0.03em; margin-bottom: 1rem; }
.hero h1 em { color: #c9b99a; font-style: italic; }
.hero p { color: #666; font-size: 0.88rem; letter-spacing: 0.05em; max-width: 400px; margin: 0 auto 2rem; line-height: 1.8; }
.hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

/* MAIN LAYOUT */
.main { display: grid; grid-template-columns: 280px 1fr; flex: 1; min-height: 0; }
.sidebar { border-right: 1px solid #1a1a1a; padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; max-height: calc(100vh - 65px); position: sticky; top: 65px; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 0 0.5rem 0.75rem; border-bottom: 1px solid #1a1a1a; margin-bottom: 0.25rem; }
.sidebar-header span { font-size: 0.72rem; color: #555; letter-spacing: 0.08em; }
.note-item { padding: 0.85rem 1rem; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
.note-item:hover { background: #161616; border-color: #252525; }
.note-item.active { background: #1a1815; border-color: #3a3020; }
.note-item-title { font-size: 0.84rem; color: #e8e4dc; margin-bottom: 0.3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-item-meta { display: flex; gap: 0.5rem; align-items: center; font-size: 0.7rem; color: #444; }
.badge { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.65rem; letter-spacing: 0.04em; }
.badge-pub  { background: #1a2e1a; color: #5a9a5a; border: 1px solid #253525; }
.badge-priv { background: #1e1e28; color: #5a5a9a; border: 1px solid #28283a; }
.badge-anon { background: #2a2010; color: #9a7a3a; border: 1px solid #3a3015; }

/* EDITOR */
.editor-pane { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto; }
.editor-toolbar { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; padding-bottom: 1.25rem; border-bottom: 1px solid #1a1a1a; }
.editor-title { width: 100%; background: transparent; border: none; outline: none; font-family: 'DM Serif Display', serif; font-size: 2.2rem; color: #e8e4dc; letter-spacing: -0.02em; caret-color: #c9b99a; }
.editor-title::placeholder { color: #2a2a2a; }
.editor-body { width: 100%; background: transparent; border: none; outline: none; font-family: 'DM Mono', monospace; font-size: 0.88rem; color: #b0a898; line-height: 1.9; resize: none; min-height: 400px; caret-color: #c9b99a; }
.editor-body::placeholder { color: #2a2a2a; }
.visibility-toggle { display: flex; gap: 0.5rem; align-items: center; }
.vis-btn { padding: 0.4rem 0.9rem; border-radius: 5px; font-size: 0.72rem; cursor: pointer; transition: all 0.15s; font-family: 'DM Mono', monospace; letter-spacing: 0.04em; border: 1px solid #252525; background: transparent; color: #555; }
.vis-btn.active-pub  { background: #1a2e1a; color: #5a9a5a; border-color: #253525; }
.vis-btn.active-priv { background: #1e1e28; color: #5a5a9a; border-color: #28283a; }

/* MODALS */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: #141414; border: 1px solid #2a2a2a; border-radius: 12px; padding: 2rem; width: 90%; max-width: 480px; }
.modal h3 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; margin-bottom: 0.5rem; }
.modal p { color: #555; font-size: 0.8rem; margin-bottom: 1.5rem; line-height: 1.7; }
.link-box { display: flex; gap: 0.5rem; align-items: center; background: #0e0e0e; border: 1px solid #2a2a2a; border-radius: 6px; padding: 0.6rem 0.8rem; margin-bottom: 1.5rem; }
.link-box span { font-size: 0.75rem; color: #777; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }

/* AUTH FORM */
.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.input-group { display: flex; flex-direction: column; gap: 0.4rem; }
.input-group label { font-size: 0.72rem; color: #666; letter-spacing: 0.06em; }
.input-field { background: #0e0e0e; border: 1px solid #252525; border-radius: 6px; padding: 0.65rem 0.9rem; font-family: 'DM Mono', monospace; font-size: 0.83rem; color: #e8e4dc; outline: none; transition: border-color 0.15s; width: 100%; }
.input-field:focus { border-color: #444; }
.input-field::placeholder { color: #333; }
.auth-error { background: #1e0f0f; border: 1px solid #3a1a1a; border-radius: 5px; padding: 0.55rem 0.9rem; font-size: 0.75rem; color: #c06060; }

/* PUBLIC FEED */
.feed { padding: 2rem; max-width: 780px; margin: 0 auto; width: 100%; }
.feed-header { margin-bottom: 2rem; }
.feed-header h2 { font-family: 'DM Serif Display', serif; font-size: 1.8rem; margin-bottom: 0.4rem; }
.feed-header p { color: #555; font-size: 0.8rem; }
.feed-grid { display: flex; flex-direction: column; gap: 1rem; }
.feed-card { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; padding: 1.5rem; cursor: pointer; transition: all 0.2s; }
.feed-card:hover { border-color: #2e2e2e; background: #141414; }
.feed-card-title { font-family: 'DM Serif Display', serif; font-size: 1.3rem; margin-bottom: 0.5rem; color: #e8e4dc; }
.feed-card-preview { font-size: 0.83rem; color: #555; line-height: 1.7; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.feed-card-footer { display: flex; justify-content: space-between; align-items: center; }
.feed-card-author { font-size: 0.72rem; color: #444; }

/* NOTE VIEWER */
.note-view { padding: 2rem; max-width: 720px; margin: 0 auto; width: 100%; }
.note-view-title { font-family: 'DM Serif Display', serif; font-size: 2.5rem; margin-bottom: 0.75rem; letter-spacing: -0.02em; line-height: 1.2; }
.note-view-meta { display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #1a1a1a; font-size: 0.75rem; color: #444; flex-wrap: wrap; }
.note-view-body { font-size: 0.92rem; line-height: 2; color: #9a9088; white-space: pre-wrap; }
.ai-toolbar { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.75rem 1rem; background: #111; border: 1px solid #1e1e1e; border-radius: 8px; margin-top: 2.5rem; }
.ai-toolbar span { font-size: 0.72rem; color: #444; margin-right: 0.5rem; }
.ai-response { background: #111; border: 1px solid #1e1e1e; border-left: 3px solid #c9b99a; border-radius: 8px; padding: 1.25rem 1.5rem; font-size: 0.85rem; color: #9a9088; line-height: 1.8; white-space: pre-wrap; margin-top: 1rem; }

/* EMPTY STATE */
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; text-align: center; gap: 1rem; }
.empty-icon { font-size: 3rem; opacity: 0.15; }
.empty h3 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #444; }
.empty p { font-size: 0.8rem; color: #333; max-width: 300px; line-height: 1.8; }

/* TOAST */
.toast { position: fixed; bottom: 2rem; right: 2rem; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 7px; padding: 0.7rem 1.2rem; font-size: 0.77rem; color: #888; z-index: 300; animation: fadeup 0.2s ease; }
@keyframes fadeup { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 680px) {
  .main { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
`;

// ─── component ───────────────────────────────────────────────
export default function App() {
  const [view, setView]           = useState("home");
  const [session, setSession]     = useState(null);           // real Supabase session
  const [user, setUser]           = useState(null);           // shortcut to session.user
  const [myNotes, setMyNotes]     = useState([]);             // only THIS user's notes
  const [pubNotes, setPubNotes]   = useState([]);             // public feed
  const [activeNote, setActiveNote] = useState(null);
  const [editNote, setEditNote]   = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [showAuth, setShowAuth]   = useState(false);
  const [authMode, setAuthMode]   = useState("login");
  const [authForm, setAuthForm]   = useState({ email: "", password: "", username: "" });
  const [authErr, setAuthErr]     = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied]       = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [toast, setToast]         = useState("");

  // ── session listener ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      // when user logs out, clear their notes
      if (!sess) setMyNotes([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── load MY notes when user changes ────────────────────────
  useEffect(() => {
    if (!user) return;
    loadMyNotes();
  }, [user]);

  // ── load public feed when that view is opened ───────────────
  useEffect(() => {
    if (view === "feed") loadPubNotes();
  }, [view]);

  const loadMyNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)           // ONLY this user's notes
      .order("created_at", { ascending: false });
    if (!error && data) setMyNotes(data);
  };

  const loadPubNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    if (!error && data) setPubNotes(data);
  };

  // ── display helpers ────────────────────────────────────────
  const displayName = () =>
    user?.user_metadata?.username || user?.email?.split("@")[0] || "anonymous";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── auth ───────────────────────────────────────────────────
  const handleAuth = async () => {
    setAuthErr("");
    if (!authForm.email || !authForm.password) {
      setAuthErr("Please fill in all fields.");
      return;
    }
    setAuthLoading(true);

    if (authMode === "signup") {
      if (!authForm.username.trim()) {
        setAuthErr("Please choose a username.");
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: { data: { username: authForm.username } },
      });
      if (error) { setAuthErr(error.message); setAuthLoading(false); return; }
      showToast("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });
      if (error) { setAuthErr(error.message); setAuthLoading(false); return; }
    }

    setAuthLoading(false);
    setShowAuth(false);
    setAuthForm({ email: "", password: "", username: "" });
    setView("notes");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMyNotes([]);
    setEditNote(null);
    setActiveNote(null);
    setView("home");
  };

  // ── notes CRUD ─────────────────────────────────────────────
  const createNewNote = () => {
    const note = {
      id: genId(),
      title: "",
      body: "",
      visibility: "private",
      is_anon: false,
      author: displayName(),
      created_at: new Date().toISOString(),
      user_id: user?.id ?? null,
    };
    setEditNote(note);
    setActiveNote(null);   // clear sidebar highlight — this is a brand new note
    setView("editor");
  };

  const saveNote = async () => {
    if (!editNote) return;
    setSaving(true);

    const payload = {
      id: editNote.id,
      title: editNote.title || "Untitled",
      body: editNote.body,
      visibility: editNote.visibility,
      is_anon: editNote.is_anon,
      author: editNote.is_anon ? "anonymous" : displayName(),
      user_id: user?.id ?? null,
    };

    const { error } = await supabase.from("notes").upsert(payload);
    if (error) {
      showToast("Error saving: " + error.message);
      setSaving(false);
      return;
    }

    // refresh sidebar list so the saved note appears immediately
    if (user) await loadMyNotes();
    setActiveNote(editNote);
    showToast("Saved ✓");
    setSaving(false);
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) { showToast("Delete failed: " + error.message); return; }
    setMyNotes(myNotes.filter(n => n.id !== id));
    setPubNotes(pubNotes.filter(n => n.id !== id));
    setEditNote(null);
    setActiveNote(null);
    showToast("Note deleted");
  };

  // ── share ──────────────────────────────────────────────────
  const copyLink = () => {
    // uses the actual deployed URL, not a hardcoded placeholder
    const url = `${window.location.origin}/note/${shareModal.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── AI tools ───────────────────────────────────────────────
  const handleAI = async (action) => {
    if (!viewingNote) return;
    setAiLoading(true);
    setAiResponse("");
    const prompts = {
      summarize: `Summarize this note concisely in 2-3 sentences:\n\n${viewingNote.title}\n\n${viewingNote.body}`,
      continue:  `Continue writing this note in the same style and voice, adding 2-3 more paragraphs:\n\n${viewingNote.title}\n\n${viewingNote.body}`,
      improve:   `Suggest 3 specific improvements to this note's writing (be constructive and brief):\n\n${viewingNote.title}\n\n${viewingNote.body}`,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompts[action] }],
        }),
      });
      const data = await res.json();
      setAiResponse(data.content?.map(b => b.text || "").join("") || "No response.");
    } catch {
      setAiResponse("Could not connect to AI. Please try again.");
    }
    setAiLoading(false);
  };

  const openNote = (note) => {
    setViewingNote(note);
    setAiResponse("");
    setView("read");
  };

  // ─── render ────────────────────────────────────────────────
  return (
    <>
      <style>{style}</style>
      <div className="app">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo" onClick={() => setView("home")}>
             <span>chatter</span>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => setView("feed")}>public feed</button>
            {user ? (
              <>
                <button className="btn btn-ghost" onClick={() => setView("notes")}>my notes</button>
                <button className="btn btn-ghost btn-sm" onClick={signOut}>sign out</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => { setAuthMode("login"); setShowAuth(true); }}>sign in</button>
                <button className="btn btn-primary" onClick={() => { setAuthMode("signup"); setShowAuth(true); }}>sign up</button>
              </>
            )}
            <button className="btn btn-primary" onClick={createNewNote}>+ new note</button>
          </div>
        </nav>

        {/* HOME */}
        {view === "home" && (
          <div className="hero">
            <h1>Say it out loud.<br /><em>Or don't.</em></h1>
            <p>Scribbly is your corner of the internet. Write publicly, stay anonymous, or keep it to yourself.</p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={createNewNote}>start writing →</button>
              <button className="btn btn-ghost" onClick={() => setView("feed")}>browse public notes</button>
            </div>
          </div>
        )}

        {/* PUBLIC FEED */}
        {view === "feed" && (
          <div style={{ flex: 1 }}>
            <div className="feed">
              <div className="feed-header">
                <h2>Public Notes</h2>
                <p>{pubNotes.length} notes shared with the world</p>
              </div>
              <div className="feed-grid">
                {pubNotes.length === 0 && (
                  <div className="empty">
                    <div className="empty-icon">📭</div>
                    <h3>Nothing here yet</h3>
                    <p>Be the first to share a note publicly.</p>
                    <button className="btn btn-primary" onClick={createNewNote}>write something</button>
                  </div>
                )}
                {pubNotes.map(note => (
                  <div key={note.id} className="feed-card" onClick={() => openNote(note)}>
                    <div className="feed-card-title">{note.title || "Untitled"}</div>
                    <div className="feed-card-preview">{note.body}</div>
                    <div className="feed-card-footer">
                      <span className="feed-card-author">
                        {note.is_anon ? "anonymous" : `@${note.author}`} · {fmtDate(note.created_at)}
                      </span>
                      <span className={`badge ${note.is_anon ? "badge-anon" : "badge-pub"}`}>
                        {note.is_anon ? "anon" : "public"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* READ VIEW */}
        {view === "read" && viewingNote && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div className="note-view">
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setView("feed")}>← back</button>
                {/* only show edit/share if this note belongs to the logged-in user */}
                {user && viewingNote.user_id === user.id && (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      setEditNote({ ...viewingNote });
                      setActiveNote(viewingNote);
                      setView("editor");
                    }}>edit</button>
                    {viewingNote.visibility === "public" && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setShareModal(viewingNote)}>share link</button>
                    )}
                  </>
                )}
              </div>
              <div className="note-view-title">{viewingNote.title || "Untitled"}</div>
              <div className="note-view-meta">
                <span>{viewingNote.is_anon ? "anonymous" : `@${viewingNote.author}`}</span>
                <span>·</span>
                <span>{fmtDate(viewingNote.created_at)}</span>
                <span className={`badge ${viewingNote.is_anon ? "badge-anon" : viewingNote.visibility === "public" ? "badge-pub" : "badge-priv"}`}>
                  {viewingNote.is_anon ? "anon" : viewingNote.visibility}
                </span>
              </div>
              <div className="note-view-body">{viewingNote.body}</div>
              <div className="ai-toolbar">
                <span>AI TOOLS</span>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAI("summarize")} disabled={aiLoading}>summarize</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAI("continue")}  disabled={aiLoading}>continue writing</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAI("improve")}   disabled={aiLoading}>suggest improvements</button>
              </div>
              {aiLoading && <div className="ai-response" style={{ color: "#444" }}>thinking...</div>}
              {aiResponse && <div className="ai-response">{aiResponse}</div>}
            </div>
          </div>
        )}

        {/* NOTES + EDITOR */}
        {(view === "notes" || view === "editor") && (
          <div className="main" style={{ flex: 1 }}>
            <aside className="sidebar">
              <div className="sidebar-header">
                <span>{user ? `@${displayName()}` : "anonymous"}</span>
                <button className="btn btn-ghost btn-sm" onClick={createNewNote}>+</button>
              </div>
              {!user && (
                <div style={{ padding: "1rem 0.5rem", color: "#444", fontSize: "0.77rem", lineHeight: 1.9 }}>
                  <a onClick={() => { setAuthMode("login"); setShowAuth(true); }}
                     style={{ color: "#c9b99a", cursor: "pointer" }}>Sign in</a> to save notes across devices.
                </div>
              )}
              {myNotes.length === 0 && user && (
                <div style={{ padding: "1.5rem 0.5rem", color: "#333", fontSize: "0.78rem", lineHeight: 1.8 }}>
                  No notes yet. Hit + to create one.
                </div>
              )}
              {myNotes.map(note => (
                <div
                  key={note.id}
                  className={`note-item ${activeNote?.id === note.id ? "active" : ""}`}
                  onClick={() => { setActiveNote(note); setEditNote({ ...note }); setView("editor"); }}
                >
                  <div className="note-item-title">{note.title || "Untitled"}</div>
                  <div className="note-item-meta">
                    <span className={`badge ${note.visibility === "public" ? "badge-pub" : "badge-priv"}`}>
                      {note.visibility}
                    </span>
                    <span>{fmtDate(note.created_at)}</span>
                  </div>
                </div>
              ))}
            </aside>

            <div className="editor-pane">
              {editNote ? (
                <>
                  <div className="editor-toolbar">
                    <div className="visibility-toggle">
                      <button
                        className={`vis-btn ${editNote.visibility === "public" ? "active-pub" : ""}`}
                        onClick={() => setEditNote({ ...editNote, visibility: "public" })}
                      >public</button>
                      <button
                        className={`vis-btn ${editNote.visibility === "private" ? "active-priv" : ""}`}
                        onClick={() => setEditNote({ ...editNote, visibility: "private" })}
                      >private</button>
                    </div>
                    <label style={{ fontSize: "0.72rem", color: "#444", cursor: "pointer", display: "flex", gap: "0.4rem", alignItems: "center", marginLeft: "0.5rem" }}>
                      <input
                        type="checkbox"
                        checked={editNote.is_anon}
                        onChange={e => setEditNote({ ...editNote, is_anon: e.target.checked })}
                        style={{ accentColor: "#c9b99a" }}
                      />
                      post anonymously
                    </label>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                      {editNote.visibility === "public" && activeNote?.id === editNote.id && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setShareModal(editNote)}>share link</button>
                      )}
                      {activeNote?.id === editNote.id && (
                        <button className="btn btn-ghost btn-sm btn-danger" onClick={() => deleteNote(editNote.id)}>delete</button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={saveNote} disabled={saving}>
                        {saving ? "saving…" : "save"}
                      </button>
                    </div>
                  </div>
                  <input
                    className="editor-title"
                    placeholder="Note title..."
                    value={editNote.title}
                    onChange={e => setEditNote({ ...editNote, title: e.target.value })}
                  />
                  <textarea
                    className="editor-body"
                    placeholder="Start writing your note..."
                    value={editNote.body}
                    onChange={e => setEditNote({ ...editNote, body: e.target.value })}
                  />
                </>
              ) : (
                <div className="empty">
                  <div className="empty-icon">✍️</div>
                  <h3>Select or create a note</h3>
                  <p>Pick a note from the sidebar or start a fresh one.</p>
                  <button className="btn btn-primary" onClick={createNewNote}>new note</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUTH MODAL */}
        {showAuth && (
          <div className="modal-overlay" onClick={() => { setShowAuth(false); setAuthErr(""); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>{authMode === "login" ? "Welcome back" : "Create account"}</h3>
              <p>{authMode === "login" ? "Sign in to access your notes." : "Join  Chatter — it's free."}</p>
              {authErr && <div className="auth-error">{authErr}</div>}
              <div className="auth-form">
                {authMode === "signup" && (
                  <div className="input-group">
                    <label>USERNAME</label>
                    <input className="input-field" placeholder="your_username"
                      value={authForm.username}
                      onChange={e => setAuthForm({ ...authForm, username: e.target.value })} />
                  </div>
                )}
                <div className="input-group">
                  <label>EMAIL</label>
                  <input className="input-field" type="email" placeholder="you@example.com"
                    value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handleAuth()} />
                </div>
                <div className="input-group">
                  <label>PASSWORD</label>
                  <input className="input-field" type="password" placeholder="••••••••"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handleAuth()} />
                </div>
                <button className="btn btn-primary" onClick={handleAuth} disabled={authLoading}>
                  {authLoading ? "please wait…" : authMode === "login" ? "sign in" : "create account"}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: "0.75rem" }}
                  onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthErr(""); }}>
                  {authMode === "login" ? "no account? sign up" : "have an account? sign in"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE MODAL */}
        {shareModal && (
          <div className="modal-overlay" onClick={() => setShareModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Share this note</h3>
              <p>Anyone with this link can read your note. It also appears in the public feed.</p>
              <div className="link-box">
                <span>{window.location.origin}/note/{shareModal.id}</span>
                <button className="btn btn-ghost btn-sm" onClick={copyLink}>
                  {copied ? "copied!" : "copy"}
                </button>
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setShareModal(null)}>done</button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && <div className="toast">{toast}</div>}

      </div>
    </>
  );
}
