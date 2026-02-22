"use client";

import { useMemo, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "date" | "checkbox";
  required?: boolean;
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
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const initialForm = useMemo(() => {
    const start: Record<string, any> = {};
    for (const field of fields) {
      start[field.name] = field.type === "checkbox" ? false : "";
    }
    return start;
  }, [fields]);

  const [form, setForm] = useState<Record<string, any>>(initialForm);

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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(body.error || "Failed to save record.");
      setSubmitting(false);
      return;
    }

    setItems((prev) => [body.item ?? payload, ...prev]);
    setForm(initialForm);
    setMessage("Saved successfully.");
    setSubmitting(false);
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">{title}</p>
      <h1 className="font-serif text-4xl text-jpm-navy">{title} Management</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-3xl">{description}</p>

      <form onSubmit={handleSubmit} className="card p-6 mt-8 space-y-4">
        <h2 className="font-serif text-2xl text-jpm-navy">Create New</h2>
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
          <button disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : "Save"}
          </button>
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
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id ?? index} className="border-b border-jpm-border/70">
                {columns.map((column) => (
                  <td key={column.key} className="p-4">
                    {String(item[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
