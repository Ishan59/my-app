"use client";
export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type FormattingState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  unorderedList: boolean;
  orderedList: boolean;
};

const defaultFormatting: FormattingState = {
  bold: false,
  italic: false,
  underline: false,
  unorderedList: false,
  orderedList: false,
};

export default function NewNotePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("id");
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(noteId));
  const [font, setFont] = useState("Arial");
  const [formatting, setFormatting] = useState<FormattingState>(defaultFormatting);

  const syncFormattingState = () => {
    const commandFont = (document.queryCommandValue("fontName") || "").replace(/"/g, "");

    if (commandFont) {
      setFont(commandFont);
    }

    setFormatting({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("notes")
        .select("id, title, content")
        .eq("id", noteId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      setTitle(data.title ?? "");
      const loadedContent = data.content ?? "";
      setContent(loadedContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = loadedContent;
      }
      setIsLoading(false);
    };

    void loadNote();
  }, [noteId]);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      saveSelection();
      syncFormattingState();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const applyCommand = (command: string, value?: string) => {
    if (!editorRef.current) {
      return;
    }

    restoreSelection();
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current.innerHTML);
    saveSelection();
    syncFormattingState();
  };

  const handleFontChange = (value: string) => {
    applyCommand("fontName", value);
    setFont(value);
  };

  const getToolbarButtonClass = (active: boolean) =>
    `rounded border px-2 py-1 text-sm transition ${
      active
        ? "border-zinc-900 bg-zinc-900 text-white"
        : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100"
    }`;

  const handleToolbarMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const editorHtml = editorRef.current?.innerHTML ?? content;
    setContent(editorHtml);

    if (noteId) {
      const { error: updateError } = await supabase
        .from("notes")
        .update({
          title,
          content: editorHtml,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("notes").insert({
        user_id: user.id,
        title,
        content: editorHtml,
      });

      if (insertError) {
        setError(insertError.message);
        setIsSubmitting(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {noteId ? "Edit note" : "New note"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          {noteId
            ? "Update your note and save the latest changes."
            : "Create a note and save it to your dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-zinc-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-zinc-900"
              placeholder="Meeting notes"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 p-2">
              <select
                value={font}
                onChange={(event) => handleFontChange(event.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none"
                title="Font"
                aria-label="Select font"
              >
                <option value="Arial">Arial</option>
                <option value="Inter">Inter</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Garamond">Garamond</option>
              </select>
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => applyCommand("bold")}
                className={`${getToolbarButtonClass(formatting.bold)} font-bold`}
                title="Bold"
                aria-label="Bold"
              >
                B
              </button>
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => applyCommand("italic")}
                className={`${getToolbarButtonClass(formatting.italic)} italic`}
                title="Italic"
                aria-label="Italic"
              >
                I
              </button>
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => applyCommand("underline")}
                className={`${getToolbarButtonClass(formatting.underline)} underline`}
                title="Underline"
                aria-label="Underline"
              >
                U
              </button>
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => applyCommand("insertUnorderedList")}
                className={getToolbarButtonClass(formatting.unorderedList)}
                title="Bulleted list"
                aria-label="Bulleted list"
              >
                ••
              </button>
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => applyCommand("insertOrderedList")}
                className={getToolbarButtonClass(formatting.orderedList)}
                title="Numbered list"
                aria-label="Numbered list"
              >
                1.
              </button>
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => applyCommand("undo")}
                className={getToolbarButtonClass(false)}
                title="Undo"
                aria-label="Undo"
              >
                ↶
              </button>
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => applyCommand("redo")}
                className={getToolbarButtonClass(false)}
                title="Redo"
                aria-label="Redo"
              >
                ↷
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onInput={(event) =>
                setContent((event.target as HTMLDivElement).innerHTML)
              }
              className="min-h-56 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
              style={{ fontFamily: font }}
              suppressContentEditableWarning
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isSubmitting ? "Saving..." : "Save note"}
          </button>
        </form>
      </div>
    </div>
  );
}
