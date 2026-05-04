"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ChecklistItem = {
  id?: string;
  content: string;
  checked: boolean;
};

export default function NewChecklistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checklistId = searchParams.get("id");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(checklistId));

  useEffect(() => {
    const loadChecklist = async () => {
      if (!checklistId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .select("id, title")
        .eq("id", checklistId)
        .single();

      if (checklistError) {
        setError(checklistError.message);
        setIsLoading(false);
        return;
      }

      const { data: checklistItems, error: itemsError } = await supabase
        .from("checklist_items")
        .select("id, content, checked")
        .eq("checklist_id", checklistId)
        .order("created_at", { ascending: true });

      if (itemsError) {
        setError(itemsError.message);
        setIsLoading(false);
        return;
      }

      setTitle(checklist.title ?? "");
      setItems((checklistItems ?? []).map((item) => ({ ...item })));
      setIsLoading(false);
    };

    void loadChecklist();
  }, [checklistId]);

  const addItem = () => {
    setItems((current) => [...current, { content: "", checked: false }]);
  };

  const updateItem = (index: number, field: "content" | "checked", value: string | boolean) => {
    setItems((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, currentIndex) => currentIndex !== index));
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

    const cleanedItems = items
      .map((item) => ({ ...item, content: item.content.trim() }))
      .filter((item) => item.content.length > 0);

    let activeChecklistId = checklistId;

    if (activeChecklistId) {
      const { error: updateError } = await supabase
        .from("checklists")
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeChecklistId)
        .eq("user_id", user.id);

      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }
    } else {
      const { data: insertedChecklist, error: insertError } = await supabase
        .from("checklists")
        .insert({
          user_id: user.id,
          title,
        })
        .select("id")
        .single();

      if (insertError || !insertedChecklist) {
        setError(insertError?.message || "Unable to save checklist.");
        setIsSubmitting(false);
        return;
      }

      activeChecklistId = insertedChecklist.id;
    }

    const { error: deleteOldItemsError } = await supabase
      .from("checklist_items")
      .delete()
      .eq("checklist_id", activeChecklistId);

    if (deleteOldItemsError) {
      setError(deleteOldItemsError.message);
      setIsSubmitting(false);
      return;
    }

    if (cleanedItems.length > 0) {
      const { error: insertItemsError } = await supabase
        .from("checklist_items")
        .insert(
          cleanedItems.map((item) => ({
            checklist_id: activeChecklistId,
            content: item.content,
            checked: item.checked,
          }))
        );

      if (insertItemsError) {
        setError(insertItemsError.message);
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
        <p className="text-zinc-600">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {checklistId ? "Edit checklist" : "New checklist"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Add checklist items, edit them anytime, and save to your dashboard.
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
              placeholder="Weekend errands"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700">Checklist items</p>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500">
                  No items yet. Click Add item to start.
                </p>
              ) : null}
              {items.map((item, index) => (
                <div
                  key={item.id ?? `new-item-${index}`}
                  className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(event) =>
                      updateItem(index, "checked", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                  />
                  <input
                    type="text"
                    value={item.content}
                    onChange={(event) =>
                      updateItem(index, "content", event.target.value)
                    }
                    className="flex-1 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none"
                    placeholder={`Item ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                    aria-label={`Delete item ${index + 1}`}
                    title="Delete item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={addItem}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              Add item
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
            >
              {isSubmitting ? "Saving..." : "Save checklist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
