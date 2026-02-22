"use client";

import { useEffect, useMemo, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "date" | "checkbox" | "select";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

type CrudManagerProps = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  rows: Record<string, any>[];
  columns: { key: string; label: string }[];
};

export default function CrudManager({
  title,
  description,
  endpoint,
  fields,
  rows,
  columns,
}: CrudManagerProps) {
  const [items, setItems] = useState(rows);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = useMemo(() => {
    const start: Record<string, any> = {};
    for (const field of fields) {
      start[field.name] = field.type === "checkbox" ? false : "";
    }
    return start;
  }, [fields]);

  const [form, setForm] = useState<Record<string, any>>(initialForm);

  useEffect(() => {
    setItems(rows);
  }, [rows]);

  useEffect(() => {
    const loadItems = async () => {
      setLoadingItems(true);
      const response = await fetch(endpoint, { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(body.items)) {
        setItems(body.items);
      }
      setLoadingItems(false);
    };

    loadItems();
  }, [endpoint]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const beginEdit = (item: Record<string, any>) => {
    const next: Record<string, any> = {};
    for (const field of fields) {
      const rawValue = item[field.name];
      if (field.type === "checkbox") {
        next[field.name] = Boolean(rawValue);
        continue;
      }
      if (field.type === "date") {
        if (!rawValue) {
          next[field.name] = "";
        } else {
          const asDate = new Date(rawValue);
          next[field.name] = Number.isNaN(asDate.getTime())
            ? String(rawValue).slice(0, 10)
            : asDate.toISOString().slice(0, 10);
        }
        continue;
      }
      next[field.name] = rawValue ?? "";
    }

    setForm(next);
    setEditingId(String(item.id));
    setMessage(`Editing record ${item.id}`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = { ...form };
    for (const field of fields) {
      if (field.type === "number" && payload[field.name] !== "") {
        payload[field.name] = Number(payload[field.name]);
      }
    }

    const target = editingId ? `${endpoint}/${editingId}` : endpoint;
    const response = await fetch(target, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(body.error || "Failed to save record.");
      setSubmitting(false);
      return;
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((item) => (String(item.id) === editingId ? (body.item ?? item) : item)),
      );
      setMessage("Updated successfully.");
    } else {
      setItems((prev) => [body.item ?? payload, ...prev]);
      setMessage("Created successfully.");
    }

    resetForm();
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this record permanently?");
    if (!confirmed) return;

    setDeletingId(id);
    setMessage(null);

    const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(body.error || "Delete failed.");
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => String(item.id) !== id));
    if (editingId === id) {
      resetForm();
    }
    setMessage("Deleted successfully.");
    setDeletingId(null);
  };

  const renderValue = (value: unknown) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const isBusy = submitting || !!deletingId;

  const heading = editingId ? "Edit Record" : "Create New";
  const submitLabel = editingId ? "Update" : "Save";
  const submitBusyLabel = editingId ? "Updating..." : "Saving...";

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">{title}</p>
      <h1 className="font-serif text-4xl text-jpm-navy">{title} Management</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-3xl">{description}</p>

      <form onSubmit={handleSubmit} className="card p-6 mt-8 space-y-4">
        <h2 className="font-serif text-2xl text-jpm-navy">{heading}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-jpm-muted">
                {field.label}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  className="border border-jpm-border rounded-sm px-3 py-2 text-sm"
                  value={form[field.name]}
                  required={field.required}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                />
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={!!form[field.name]}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.name]: event.target.checked }))
                  }
                />
              ) : field.type === "select" ? (
                <select
                  className="border border-jpm-border rounded-sm px-3 py-2 text-sm"
                  value={form[field.name]}
                  required={field.required}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                >
                  <option value="">Select</option>
                  {(field.options ?? []).map((option) => (
                    <option key={`${field.name}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  className="border border-jpm-border rounded-sm px-3 py-2 text-sm"
                  value={form[field.name]}
                  required={field.required}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                />
              )}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button disabled={isBusy} className="btn-primary">
            {submitting ? submitBusyLabel : submitLabel}
          </button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={resetForm} disabled={isBusy}>
              Cancel Edit
            </button>
          )}
          {message && <p className="text-sm text-jpm-muted">{message}</p>}
        </div>
      </form>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-jpm-border text-left">
              {columns.map((column) => (
                <th key={column.key} className="p-4">
                  {column.label}
                </th>
              ))}
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loadingItems ? (
              <tr>
                <td className="p-4 text-jpm-muted" colSpan={columns.length + 1}>
                  No records yet.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id ?? index} className="border-b border-jpm-border/70">
                  {columns.map((column) => (
                    <td key={column.key} className="p-4">
                      {renderValue(item[column.key])}
                    </td>
                  ))}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => beginEdit(item)}
                        disabled={isBusy}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleDelete(String(item.id))}
                        disabled={isBusy || deletingId === String(item.id)}
                      >
                        {deletingId === String(item.id) ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
