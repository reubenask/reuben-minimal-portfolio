import { useState } from "react";
import { X } from "lucide-react";
import type { ArchiveNode } from "../types/archive";

type EditNodeModalProps = {
  node: ArchiveNode;
  onClose: () => void;
  onSave: (node: ArchiveNode) => void;
};

export function EditNodeModal({ node, onClose, onSave }: EditNodeModalProps) {
  const [label, setLabel] = useState(node.label);
  const [category, setCategory] = useState(node.category);
  const [description, setDescription] = useState(node.description ?? "");
  const [period, setPeriod] = useState(node.period ?? "");
  const [image, setImage] = useState(node.image ?? "");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;

    onSave({
      ...node,
      label: label.trim(),
      category: category.trim() || node.category,
      description: description.trim() || undefined,
      period: period.trim() || undefined,
      image: image.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-6 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#071211]/95 p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Edit archive node
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-100">
              {node.label}
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
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="archive-input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="archive-input"
              />
            </Field>
            <Field label="Period">
              <input
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="archive-input"
                placeholder="2024 - Present"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="archive-input min-h-28 resize-none"
            />
          </Field>
          <Field label="Image URL">
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
            Save Changes
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
