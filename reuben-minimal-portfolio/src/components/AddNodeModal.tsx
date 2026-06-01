import { useState } from "react";
import { X } from "lucide-react";
import type { ArchiveNode, ArchiveNodeType } from "../types/archive";

type AddNodeModalProps = {
  parent: ArchiveNode;
  onClose: () => void;
  onSave: (node: ArchiveNode) => void;
};

export function AddNodeModal({ parent, onClose, onSave }: AddNodeModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("custom");
  const [nodeType, setNodeType] = useState<Exclude<ArchiveNodeType, "center">>(
    "item",
  );
  const [icon, setIcon] = useState("sparkles");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: `${parent.id}-${Date.now()}`,
      label: title.trim(),
      type: nodeType,
      category: category.trim() || "custom",
      icon: icon.trim() || "sparkles",
      image: image.trim() || undefined,
      description: description.trim() || "New archive item.",
      collapsed: nodeType === "folder" ? true : undefined,
      children: nodeType === "folder" ? [] : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-6 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#071211]/95 p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Add child node
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-100">
              {parent.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 grid gap-4">
          <Field label="Title">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="archive-input"
              placeholder="New node title"
            />
          </Field>
          <Field label="Category / Type">
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="archive-input"
              placeholder="idea, course, project..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Node type">
              <select
                value={nodeType}
                onChange={(event) =>
                  setNodeType(event.target.value as Exclude<ArchiveNodeType, "center">)
                }
                className="archive-input"
              >
                <option value="item">Archive item</option>
                <option value="folder">Subfolder</option>
              </select>
            </Field>
            <Field label="Icon key">
              <input
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                className="archive-input"
                placeholder="sparkles"
              />
            </Field>
          </div>
          <Field label="Short description">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="archive-input min-h-24 resize-none"
              placeholder="Why this belongs in the archive"
            />
          </Field>
          <Field label="Optional image URL">
            <input
              value={image}
              onChange={(event) => setImage(event.target.value)}
              className="archive-input"
              placeholder="https://..."
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-2xl border border-cyan-300/40 bg-cyan-300/15 px-4 py-3 text-sm font-semibold text-cyan-100"
          >
            Add Node
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
