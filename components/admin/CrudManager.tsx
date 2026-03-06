"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "date"
  | "checkbox"
  | "select"
  | "image";

type Field = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

type Column = {
  key: string;
  label: string;
  type?: "text" | "date" | "boolean" | "image";
};

type CrudRecord = Record<string, unknown>;

type CrudManagerProps = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  rows: CrudRecord[];
  columns: Column[];
  uploadFolder?: string;
};

type ApiListResponse = {
  items?: CrudRecord[];
  error?: string;
};

type ApiMutationResponse = {
  item?: CrudRecord;
  error?: string;
};

const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
];

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
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[object]";
    }
  }

  return String(value);
}

function buildInitialForm(fields: Field[]) {
  const start: CrudRecord = {};
  for (const field of fields) {
    start[field.name] = field.type === "checkbox" ? false : "";
  }
  return start;
}

function toDateInputValue(value: unknown) {
  if (!value) {
    return "";
  }
  const date = new Date(String(value));
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function mapRowToForm(fields: Field[], row: CrudRecord) {
  const next: CrudRecord = {};
  for (const field of fields) {
    const rawValue = row[field.name];
    if (field.type === "checkbox") {
      next[field.name] = Boolean(rawValue);
      continue;
    }
    if (field.type === "date") {
      next[field.name] = toDateInputValue(rawValue);
      continue;
    }
    next[field.name] = rawValue ?? "";
  }
  return next;
}

function trimString(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function maybeToNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return value;
}

function normalizeImageSrc(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Keeps create/update payloads predictable:
 * - create: omit optional empty fields so server defaults can apply
 * - update: send optional empties as null so admins can intentionally clear values
 */
function buildPayload(
  form: CrudRecord,
  fields: Field[],
  mode: "create" | "update",
) {
  const payload: CrudRecord = {};

  for (const field of fields) {
    const raw = form[field.name];

    if (field.type === "checkbox") {
      payload[field.name] = Boolean(raw);
      continue;
    }

    if (field.type === "number") {
      if (raw === "" || raw === null || raw === undefined) {
        if (field.required) {
          payload[field.name] = "";
        } else if (mode === "update") {
          payload[field.name] = null;
        }
        continue;
      }
      payload[field.name] = maybeToNumber(raw);
      continue;
    }

    const normalized = trimString(raw);
    if (normalized === "" || normalized === null || normalized === undefined) {
      if (field.required) {
        payload[field.name] = "";
      } else if (mode === "update") {
        payload[field.name] = null;
      }
      continue;
    }

    payload[field.name] = normalized;
  }

  return payload;
}

async function safeReadJson(
  response: Response,
): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
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
  const [items, setItems] = useState<CrudRecord[]>(rows);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );

  const initialForm = useMemo(() => buildInitialForm(fields), [fields]);
  const [form, setForm] = useState<CrudRecord>(initialForm);

  useEffect(() => {
    setItems(rows);
  }, [rows]);

  useEffect(() => {
    setForm(initialForm);
    setEditingId(null);
  }, [initialForm]);

  const setStatus = useCallback(
    (nextMessage: string, type: "success" | "error" | null) => {
      setMessage(nextMessage);
      setMessageType(type);
    },
    [],
  );

  const loadItems = useCallback(
    async (options?: { showLoader?: boolean; showError?: boolean }) => {
      const showLoader = options?.showLoader ?? true;
      const showError = options?.showError ?? true;

      if (showLoader) {
        setLoadingItems(true);
      }

      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        const body = (await safeReadJson(response)) as ApiListResponse;

        if (!response.ok || !Array.isArray(body.items)) {
          if (showError) {
            setStatus(body.error ?? "Failed to load records.", "error");
          }
          return false;
        }

        setItems(body.items);
        return true;
      } catch {
        if (showError) {
          setStatus("Failed to load records due to network error.", "error");
        }
        return false;
      } finally {
        if (showLoader) {
          setLoadingItems(false);
        }
      }
    },
    [endpoint, setStatus],
  );

  useEffect(() => {
    void loadItems({ showLoader: true, showError: false });
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((item) =>
      columns.some((column) =>
        String(item[column.key] ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [items, columns, search]);

  const isBusy = submitting || !!deletingId || !!uploadingField;
  const heading = editingId ? "Edit Record" : "Create New";
  const submitLabel = editingId ? "Update" : "Save";
  const submitBusyLabel = editingId ? "Updating..." : "Saving...";

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setEditingId(null);
  }, [initialForm]);

  const beginEdit = useCallback(
    (item: CrudRecord) => {
      setForm(mapRowToForm(fields, item));
      setEditingId(String(item.id ?? ""));
      setStatus(`Editing record ${item.id ?? ""}`, null);
    },
    [fields, setStatus],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setMessageType(null);

    const mode = editingId ? "update" : "create";
    const payload = buildPayload(form, fields, mode);
    const target = editingId ? `${endpoint}/${editingId}` : endpoint;

    try {
      const response = await fetch(target, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await safeReadJson(response)) as ApiMutationResponse;
      if (!response.ok) {
        setStatus(body.error ?? "Failed to save record.", "error");
        return;
      }

      if (body.item) {
        if (editingId) {
          setItems((prev) =>
            prev.map((item) =>
              String(item.id) === editingId ? body.item ?? item : item,
            ),
          );
        } else {
          setItems((prev) => [body.item as CrudRecord, ...prev]);
        }
      }

      // Pull canonical server rows after mutation so relation labels stay accurate.
      await loadItems({ showLoader: false, showError: false });

      setStatus(
        editingId ? "Updated successfully." : "Created successfully.",
        "success",
      );
      resetForm();
    } catch {
      setStatus("Failed to save record due to network error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this record permanently?");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      const body = (await safeReadJson(response)) as ApiMutationResponse;

      if (!response.ok) {
        setStatus(body.error ?? "Delete failed.", "error");
        return;
      }

      setItems((prev) => prev.filter((item) => String(item.id) !== id));
      if (editingId === id) {
        resetForm();
      }

      await loadItems({ showLoader: false, showError: false });
      setStatus("Deleted successfully.", "success");
    } catch {
      setStatus("Delete failed due to network error.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const uploadImage = async (fieldName: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus("Only image files are allowed.", "error");
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
      const body = (await safeReadJson(response)) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        setStatus(body.error ?? "Image upload failed.", "error");
        return;
      }

      setFieldValue(fieldName, body.url);
      setStatus("Image uploaded successfully.", "success");
    } catch {
      setStatus("Image upload failed due to network error.", "error");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="text-white">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-jpm-gold">
        {title}
      </p>
      <h1 className="font-serif text-4xl">{title} Management</h1>
      <p className="mt-4 max-w-3xl text-sm text-white/45">{description}</p>

      <form
        onSubmit={handleSubmit}
        className="card mt-8 space-y-4 border border-white/10 bg-white/3 p-6"
      >
        <h2 className="font-serif text-2xl">{heading}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                {field.label}
              </span>

              {field.type === "textarea" && (
                <textarea
                  className="input-base min-h-[110px]"
                  value={String(form[field.name] ?? "")}
                  required={field.required}
                  onChange={(event) =>
                    setFieldValue(field.name, event.target.value)
                  }
                />
              )}

              {field.type === "checkbox" && (
                <label className="inline-flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(event) =>
                      setFieldValue(field.name, event.target.checked)
                    }
                  />
                  Enabled
                </label>
              )}

              {field.type === "select" && (
                <select
                  className="input-base"
                  value={String(form[field.name] ?? "")}
                  required={field.required}
                  onChange={(event) =>
                    setFieldValue(field.name, event.target.value)
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
                  {(() => {
                    const previewSrc = normalizeImageSrc(form[field.name]);

                    return (
                  <div className="group relative flex h-32 w-full items-center justify-center overflow-hidden rounded-sm border border-white/15 bg-white/5">
                    {previewSrc ? (
                      <>
                        <img
                          src={previewSrc}
                          alt="Preview"
                          className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                          onClick={() => setFieldValue(field.name, "")}
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-white/20">
                        <svg
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-[10px] uppercase">No Image</span>
                      </div>
                    )}
                  </div>
                    );
                  })()}

                  <label className="btn-base btn-sm btn-outline inline-flex cursor-pointer items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isBusy}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void uploadImage(field.name, file);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                    {uploadingField === field.name
                      ? "Uploading..."
                      : "Upload Image"}
                  </label>

                  <input
                    type="text"
                    className="input-base"
                    placeholder="Or paste image URL"
                    value={String(form[field.name] ?? "")}
                    required={field.required}
                    onChange={(event) =>
                      setFieldValue(field.name, event.target.value)
                    }
                  />
                </div>
              )}

              {(!field.type ||
                field.type === "text" ||
                field.type === "number" ||
                field.type === "date") && (
                <input
                  type={field.type || "text"}
                  className="input-base"
                  value={String(form[field.name] ?? "")}
                  required={field.required}
                  onChange={(event) =>
                    setFieldValue(field.name, event.target.value)
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={isBusy} className="btn-base btn-md btn-primary">
            {submitting ? submitBusyLabel : submitLabel}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-base btn-md btn-outline"
              onClick={resetForm}
              disabled={isBusy}
            >
              Cancel Edit
            </button>
          )}
          {message && (
            <p
              className={`text-sm ${
                messageType === "error"
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

      <div className="card mt-8 border border-white/10 bg-white/3 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            Showing{" "}
            <span className="font-semibold text-white/80">
              {filteredItems.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white/80">{items.length}</span>{" "}
            records
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search table..."
              className="input-base max-w-[260px]"
            />
            <button
              type="button"
              className="btn-base btn-sm btn-outline"
              disabled={isBusy || loadingItems}
              onClick={() =>
                void loadItems({ showLoader: true, showError: true })
              }
            >
              {loadingItems ? "Refreshing..." : "Refresh"}
            </button>
          </div>
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
                  <tr key={String(item.id ?? index)} className="border-b border-white/5 align-top">
                    {columns.map((column) => {
                      const raw = item[column.key];
                      const imageSrc = normalizeImageSrc(raw);
                      const asText = raw == null ? "" : String(raw);
                      const showImage =
                        !!imageSrc &&
                        (column.type === "image" ||
                          (imageSrc.startsWith("http") &&
                            isLikelyImageUrl(imageSrc)));

                      return (
                        <td key={column.key} className="max-w-[280px] p-4">
                          {showImage && imageSrc ? (
                            <a
                              href={imageSrc}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2"
                            >
                              <img
                                src={imageSrc}
                                alt={column.label}
                                className="h-10 w-10 rounded-sm border border-white/15 object-cover"
                              />
                              <span className="text-xs text-jpm-gold/80 hover:text-jpm-gold">
                                Open
                              </span>
                            </a>
                          ) : (
                            <span className="line-clamp-3 break-words">
                              {formatCell(column, raw)}
                            </span>
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
                          onClick={() => void handleDelete(String(item.id))}
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
