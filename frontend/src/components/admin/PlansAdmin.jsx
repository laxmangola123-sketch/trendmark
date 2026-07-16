import React, { useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Trash2, Save, Plus } from "lucide-react";

const EMPTY = {
  id: "",
  name: "",
  price: 0,
  credits: 0,
  features: [],
  whatsapp_url: "",
  popular: false,
  active: true,
};

function Text({ label, v, on }) {
  return (
    <div>
      <label className="tag-uppercase text-white/50 block mb-1 text-xs">
        {label}
      </label>

      <input
        value={v}
        onChange={(e) => on(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm"
      />
    </div>
  );
}

function PlanRow({ plan, onSave, onDelete }) {
  const [draft, setDraft] = useState({
    ...plan,
    features: Array.isArray(plan.features)
      ? plan.features.join("\n")
      : "",
  });

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    try {
      await onSave({
        ...draft,
        price: Number(draft.price),
        credits: Number(draft.credits),
        features: draft.features
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
      });

      toast.success("Plan saved");

    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
        e?.message ||
        "Save failed"
      );
    }

    setSaving(false);
  };

  return (
    <div className="card-tactical rounded-xl p-5 space-y-4">

      <div className="flex justify-between">

        <h3 className="font-bold">
          {draft.name || "New Plan"}
        </h3>

        {plan.id && (
          <button
            onClick={() => onDelete(plan)}
            className="text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}

      </div>

      <div className="grid md:grid-cols-2 gap-3">

        <Text
          label="ID"
          v={draft.id}
          on={(v) => setDraft({ ...draft, id: v })}
        />

        <Text
          label="Name"
          v={draft.name}
          on={(v) => setDraft({ ...draft, name: v })}
        />

        <Text
          label="Price"
          v={draft.price}
          on={(v) => setDraft({ ...draft, price: v })}
        />

        <Text
          label="Credits"
          v={draft.credits}
          on={(v) => setDraft({ ...draft, credits: v })}
        />

        <Text
          label="WhatsApp URL"
          v={draft.whatsapp_url}
          on={(v) =>
            setDraft({
              ...draft,
              whatsapp_url: v,
            })
          }
        />

      </div>

      <div>

        <label className="tag-uppercase text-white/50 text-xs">
          Features
        </label>

        <textarea
          rows={5}
          value={draft.features}
          onChange={(e) =>
            setDraft({
              ...draft,
              features: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-md"
        />

      </div>

      <div className="flex gap-5">

        <label>
          <input
            type="checkbox"
            checked={draft.popular}
            onChange={(e) =>
              setDraft({
                ...draft,
                popular: e.target.checked,
              })
            }
          />

          Popular
        </label>

        <label>
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) =>
              setDraft({
                ...draft,
                active: e.target.checked,
              })
            }
          />

          Active
        </label>

      </div>

      <button
        onClick={save}
        disabled={saving}
        className="btn-primary px-4 py-2 rounded flex items-center gap-2"
      >
        <Save size={14} />

        {saving ? "Saving..." : "Save"}
      </button>

    </div>
  );
}

export default function PlansAdmin({
  plans = [],
  onChange,
}) {

  const [adding, setAdding] = useState(false);

  const plansList = Array.isArray(plans)
    ? plans
    : plans?.plans || [];

  const create = async (payload) => {
    await api.post("/admin/plans", payload);
    toast.success("Plan created");
    setAdding(false);
    onChange?.();
  };

  const update = async (payload) => {
    await api.put(`/admin/plans/${payload.id}`, payload);
    toast.success("Plan updated");
    onChange?.();
  };

  const remove = async (plan) => {

    if (!window.confirm(`Delete ${plan.name}?`))
      return;

    await api.delete(`/admin/plans/${plan.id}`);

    toast.success("Plan deleted");

    onChange?.();
  };

  return (
    <div
      className="space-y-4"
      data-testid="admin-plans-section"
    >

      <div className="flex justify-end">

        <button
          onClick={() => setAdding(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded"
        >
          <Plus size={14} />
          Add Plan
        </button>

      </div>

      {adding && (
        <PlanRow
          plan={EMPTY}
          onSave={create}
          onDelete={() => setAdding(false)}
        />
      )}

      {plansList.length === 0 ? (

        <div className="text-center text-white/50 py-8">
          No plans available.
        </div>

      ) : (

        plansList.map((p) => (
          <PlanRow
            key={p.id}
            plan={p}
            onSave={update}
            onDelete={remove}
          />
        ))

      )}

    </div>
  );
}