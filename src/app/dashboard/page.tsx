"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Note = {
  id: string;
  title: string;
  content: string | null;
  updated_at: string | null;
};

type Checklist = {
  id: string;
  title: string;
  created_at: string | null;
};

const toPlainText = (value: string | null) =>
  (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const hasSelectedNotes = useMemo(() => selectedNotes.length > 0, [selectedNotes.length]);
  const hasSelectedChecklists = useMemo(
    () => selectedChecklists.length > 0,
    [selectedChecklists.length]
  );

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const [{ data: notesData, error: notesError }, { data: checklistsData, error: checklistsError }] =
        await Promise.all([
          supabase
            .from("notes")
            .select("id, title, content, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false }),
          supabase
            .from("checklists")
            .select("id, title, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (notesError || checklistsError) {
        setError(notesError?.message || checklistsError?.message || "Unable to load dashboard.");
        setLoading(false);
        return;
      }

      setNotes(notesData ?? []);
      setChecklists(checklistsData ?? []);
      setLoading(false);
    };

    void loadDashboard();
  }, [router]);

  const toggleSelected = (
    id: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((itemId) => itemId !== id)
        : [...selected, id]
    );
  };

  const handleDeleteSelectedNotes = async () => {
    if (!hasSelectedNotes) {
      return;
    }

    setIsDeleting(true);
    setError("");

    const { error: notesDeleteError } = await supabase
      .from("notes")
      .delete()
      .in("id", selectedNotes);

    if (notesDeleteError) {
      setError(notesDeleteError.message);
      setIsDeleting(false);
      return;
    }

    setNotes((currentNotes) =>
      currentNotes.filter((note) => !selectedNotes.includes(note.id))
    );
    setSelectedNotes([]);
    setIsDeleting(false);
  };

  const handleDeleteSelectedChecklists = async () => {
    if (!hasSelectedChecklists) {
      return;
    }

    setIsDeleting(true);
    setError("");

    const { error: itemsDeleteError } = await supabase
      .from("checklist_items")
      .delete()
      .in("checklist_id", selectedChecklists);

    if (itemsDeleteError) {
      setError(itemsDeleteError.message);
      setIsDeleting(false);
      return;
    }

    const { error: checklistsDeleteError } = await supabase
      .from("checklists")
      .delete()
      .in("id", selectedChecklists);

    if (checklistsDeleteError) {
      setError(checklistsDeleteError.message);
      setIsDeleting(false);
      return;
    }

    setChecklists((currentChecklists) =>
      currentChecklists.filter(
        (checklist) => !selectedChecklists.includes(checklist.id)
      )
    );
    setSelectedChecklists([]);
    setIsDeleting(false);
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    setError("");

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      setIsSigningOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Dashboard</h1>
            <p className="mt-1 text-zinc-600">
              View, create, and manage your notes and checklists.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">Notes</h2>
              <div className="flex items-center gap-2">
                <Link
                  href="/notes/new"
                  aria-label="Add new note"
                  title="Add new note"
                  className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 transition hover:bg-zinc-100"
                >
                  <PlusIcon />
                </Link>
                <button
                  type="button"
                  onClick={handleDeleteSelectedNotes}
                  disabled={!hasSelectedNotes || isDeleting}
                  aria-label="Delete selected notes"
                  title="Delete selected notes"
                  className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-zinc-500">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note.id)}
                      onChange={() =>
                        toggleSelected(note.id, selectedNotes, setSelectedNotes)
                      }
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <Link
                      href={`/notes/new?id=${note.id}`}
                      className="min-w-0 flex-1 rounded-md outline-none transition hover:bg-zinc-100/60 focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      <p className="font-medium text-zinc-900">
                        {note.title || "Untitled note"}
                      </p>
                      <p className="mt-1 truncate text-sm text-zinc-600">
                        {toPlainText(note.content) || "No content yet."}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">Checklists</h2>
              <div className="flex items-center gap-2">
                <Link
                  href="/checklists/new"
                  aria-label="Add new checklist"
                  title="Add new checklist"
                  className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 transition hover:bg-zinc-100"
                >
                  <PlusIcon />
                </Link>
                <button
                  type="button"
                  onClick={handleDeleteSelectedChecklists}
                  disabled={!hasSelectedChecklists || isDeleting}
                  aria-label="Delete selected checklists"
                  title="Delete selected checklists"
                  className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            {checklists.length === 0 ? (
              <p className="text-sm text-zinc-500">No checklists yet.</p>
            ) : (
              <ul className="space-y-3">
                {checklists.map((checklist) => (
                  <li
                    key={checklist.id}
                    className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChecklists.includes(checklist.id)}
                      onChange={() =>
                        toggleSelected(
                          checklist.id,
                          selectedChecklists,
                          setSelectedChecklists
                        )
                      }
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <Link
                      href={`/checklists/new?id=${checklist.id}`}
                      className="min-w-0 flex-1 rounded-md outline-none transition hover:bg-zinc-100/60 focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      <p className="font-medium text-zinc-900">
                        {checklist.title || "Untitled checklist"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
