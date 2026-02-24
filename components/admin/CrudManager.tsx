"use client";

import { useEffect, useMemo, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "date" | "checkbox" | "select" | "image";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

type Column = {
  key: string;
  label: string;
  type?: "text" | "date" | "boolean" | "image";
};

type CrudManagerProps = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  rows: Record<string, any>[];
  columns: Column[];
  uploadFolder?: string;
};

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];

function isLikelyImageUrl(value: string) {
  const lower = value.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.includes(ext));
}

function isIsoLikeDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}/.test(value) || value.includes("T");
}

function formatCell(column: Column, value: unknown) {
  if (column.type === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (column.type === "date" && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string" && isIsoLikeDate(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default function CrudManager({
  title,
  description,
  endpoint,
  fields,
  rows,
  columns,
  uploadFolder = "admin",
}: CrudManagerProps) {
  const [items, setItems] = useState(rows);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

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
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        const body = await response.json().catch(() => ({}));
        if (response.ok && Array.isArray(body.items)) {
          setItems(body.items);
        }
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, [endpoint]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      columns.some((column) => String(item[column.key] ?? "").toLowerCase().includes(term)),
    );
  }, [items, columns, search]);

  const isBusy = submitting || !!deletingId || !!uploadingField;
  const heading = editingId ? "Edit Record" : "Create New";
  const submitLabel = editingId ? "Update" : "Save";
  const submitBusyLabel = editingId ? "Updating..." : "Saving...";

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
    setMessageType(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setMessageType(null);

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
      setMessageType("error");
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

    setMessageType("success");
    resetForm();
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this record permanently?");
    if (!confirmed) return;

    setDeletingId(id);
    setMessage(null);
    setMessageType(null);

    const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(body.error || "Delete failed.");
      setMessageType("error");
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => String(item.id) !== id));
    if (editingId === id) {
      resetForm();
    }
    setMessage("Deleted successfully.");
    setMessageType("success");
    setDeletingId(null);
  };

  const uploadImage = async (fieldName: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("Only image files are allowed.");
      setMessageType("error");
      return;
    }

    setUploadingField(fieldName);
    setMessage(null);
    setMessageType(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", uploadFolder);

    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.url) {
        setMessage(body.error || "Image upload failed.");
        setMessageType("error");
        return;
      }

      setForm((prev) => ({ ...prev, [fieldName]: body.url }));
      setMessage("Image uploaded successfully.");
      setMessageType("success");
    } catch {
      setMessage("Image upload failed due to network error.");
      setMessageType("error");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="text-white">
      <p className="text-[10px] uppercase tracking-[0.2em] text-jpm-gold mb-2">{title}</p>
      <h1 className="font-serif text-4xl">{title} Management</h1>
      <p className="mt-4 text-sm text-white/45 max-w-3xl">{description}</p>

      <form onSubmit={handleSubmit} className="card border border-white/10 bg-white/3 p-6 mt-8 space-y-4">
        <h2 className="font-serif text-2xl">{heading}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">{field.label}</span>

              {field.type === "textarea" && (
                <textarea
                  className="input-base min-h-[110px]"
                  value={form[field.name]}
                  required={field.required}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                />
              )}

              {field.type === "checkbox" && (
                <label className="inline-flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={!!form[field.name]}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [field.name]: event.target.checked }))
                    }
                  />
                  Enabled
                </label>
              )}

              {field.type === "select" && (
                <select
                  className="input-base"
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
              )}

              {field.type === "image" && (
                <div className="space-y-3">
                  <div className="relative group w-full h-32 bg-white/5 border border-white/15 rounded-sm overflow-hidden flex items-center justify-center">
                    {form[field.name] ? (
                      <>
                        <img
                          src={form[field.name]}
                          alt="Preview"
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setForm((prev) => ({ ...prev, [field.name]: "" }))}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <div className="text-white/20 flex flex-col items-center gap-1">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] uppercase">No Image</span>
                      </div>
                    )}
                  </div>

                  <label className="inline-flex items-center justify-center btn-base btn-sm btn-outline cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isBusy}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          uploadImage(field.name, file);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                    {uploadingField === field.name ? "Uploading..." : "Upload Image"}
                  </label>

                  <input
                    type="text"
                    className="input-base"
                    placeholder="Or paste image URL"
                    value={form[field.name]}
                    required={field.required}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                    }
                  />
                </div>
              )}

              {(!field.type || field.type === "text" || field.type === "number" || field.type === "date") && (
                <input
                  type={field.type || "text"}
                  className="input-base"
                  value={form[field.name]}
                  required={field.required}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button disabled={isBusy} className="btn-base btn-md btn-primary">
            {submitting ? submitBusyLabel : submitLabel}
          </button>
          {editingId && (
            <button type="button" className="btn-base btn-md btn-outline" onClick={resetForm} disabled={isBusy}>
              Cancel Edit
            </button>
          )}
          {message && (
            <p
              className={`text-sm ${messageType === "error"
                ? "text-red-300"
                : messageType === "success"
                  ? "text-emerald-300"
                  : "text-white/55"
                }`}
            >
              {message}
            </p>
          )}
        </div>
      </form>

      <div className="card border border-white/10 bg-white/3 mt-8 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-xs text-white/50">
            Showing <span className="text-white/80 font-semibold">{filteredItems.length}</span> of{" "}
            <span className="text-white/80 font-semibold">{items.length}</span> records
          </p>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search table..."
            className="input-base max-w-[260px]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.15em] text-white/40">
                {columns.map((column) => (
                  <th key={column.key} className="p-4">
                    {column.label}
                  </th>
                ))}
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingItems && (
                <tr>
                  <td className="p-4 text-white/55" colSpan={columns.length + 1}>
                    Loading records...
                  </td>
                </tr>
              )}

              {!loadingItems && filteredItems.length === 0 && (
                <tr>
                  <td className="p-4 text-white/55" colSpan={columns.length + 1}>
                    No records found.
                  </td>
                </tr>
              )}

              {!loadingItems &&
                filteredItems.map((item, index) => (
                  <tr key={item.id ?? index} className="border-b border-white/5 align-top">
                    {columns.map((column) => {
                      const raw = item[column.key];
                      const asText = raw == null ? "" : String(raw);
                      const showImage =
                        column.type === "image" ||
                        (typeof raw === "string" && asText.startsWith("http") && isLikelyImageUrl(asText));

                      return (
                        <td key={column.key} className="p-4 max-w-[280px]">
                          {showImage && typeof raw === "string" ? (
                            <a href={raw} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                              <img src={raw} alt={column.label} className="w-10 h-10 rounded-sm object-cover border border-white/15" />
                              <span className="text-xs text-jpm-gold/80 hover:text-jpm-gold">Open</span>
                            </a>
                          ) : (
                            <span className="line-clamp-3 break-words">{formatCell(column, raw)}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-base btn-sm btn-outline"
                          onClick={() => beginEdit(item)}
                          disabled={isBusy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-base btn-sm btn-danger"
                          onClick={() => handleDelete(String(item.id))}
                          disabled={isBusy || deletingId === String(item.id)}
                        >
                          {deletingId === String(item.id) ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
