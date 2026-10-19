import { useEffect, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
);

async function readError(response) {
  const result = await response.json().catch(() => ({}));
  return result.error || `Request failed (${response.status}).`;
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotes() {
      try {
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) throw new Error(await readError(response));
        setNotes(await response.json());
      } catch (requestError) {
        setError(requestError.message || "Could not load notes.");
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, []);

  async function saveNote(event) {
    event.preventDefault();
    const noteText = text.trim();
    if (!noteText || saving) return;

    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText }),
      });
      if (!response.ok) throw new Error(await readError(response));

      const note = await response.json();
      setNotes((currentNotes) => [note, ...currentNotes]);
      setText("");
    } catch (requestError) {
      setError(requestError.message || "Could not save your note.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id) {
    setDeletingId(id);
    setError("");
    try {
      const response = await fetch(`${API_URL}/notes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await readError(response));
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    } catch (requestError) {
      setError(requestError.message || "Could not delete the note.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Your personal space
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Quick Notes
          </h1>
          <p className="mt-3 text-slate-600">
            Capture a thought before it slips away.
          </p>
        </header>

        <form onSubmit={saveNote} className="card mb-8">
          <label htmlFor="note" className="mb-3 block font-semibold text-slate-800">
            Write a note
          </label>
          <textarea
            id="note"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What would you like to remember?"
            rows={4}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!text.trim() || saving}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? "Saving..." : "Save note"}
            </button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section aria-labelledby="notes-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="notes-heading" className="text-xl font-bold text-slate-900">
              Your notes
            </h2>
            {!loading && notes.length > 0 && (
              <span className="text-sm text-slate-500">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            )}
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500" role="status">
              Loading notes...
            </p>
          ) : notes.length === 0 ? (
            <div className="card py-10 text-center">
              <p className="font-medium text-slate-700">No notes yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Your saved notes will show up here.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li key={note.id} className="card">
                  <p className="whitespace-pre-wrap break-words text-slate-800">
                    {note.text}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <time
                      dateTime={note.createdAt}
                      className="text-sm text-slate-500"
                    >
                      {formatTimestamp(note.createdAt)}
                    </time>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      disabled={deletingId === note.id}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Delete note: ${note.text.slice(0, 40)}`}
                    >
                      {deletingId === note.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
