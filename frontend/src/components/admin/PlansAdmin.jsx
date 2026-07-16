import React, { useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Trash2, Save, Plus } from "lucide-react";

const EMPTY = { id: "", name: "", price: 0, credits: 0, features: [], whatsapp_url: "", popular: false, active: true };

function PlanRow({ plan, onDelete, onSave }) {
  const [draft, setDraft] = useState({ ...plan, features: (plan.features || []).join("\n") });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...draft, price: Number(draft.price), credits: Number(draft.credits),
        features: draft.features.split("\n").map(s => s.trim()).filter(Boolean),
      };
      await onSave(payload);
      toast.success(`Plan ${draft.id} saved`);
    } catch (e) { toast.error(e?.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="card-tactical rounded-xl p-5 space-y-3" data-testid={`admin-plan-${plan.id}`}>
      <div className="flex justify-between items-center">
        <div className="font-heading font-bold text-lg">{plan.name} <span className="text-white/40 text-sm">/ id: {plan.id}</span></div>
        <button onClick={() => onDelete(plan)} className="text-blaze hover:text-blaze/80 p-1" title="Delete"><Trash2 size={16}/></button>
      </div>
      <div className="grid md:grid-cols-4 gap-3 text-sm">
        <Text label="Name" v={draft.name} on={(v) => setDraft({...draft, name: v})}/>
        <Text label="Price ($)" v={draft.price} on={(v) => setDraft({...draft, price: v})}/>
        <Text label="Credits" v={draft.credits} on={(v) => setDraft({...draft, credits: v})}/>
        <Text label="WhatsApp URL" v={draft.whatsapp_url} on={(v) => setDraft({...draft, whatsapp_url: v})}/>
      </div>
      <div>
        <label className="tag-uppercase text-white/50 block mb-2 text-xs">Features (one per line)</label>
        <textarea value={draft.features} onChange={(e) => setDraft({...draft, features: e.target.value})} rows={4} className="w-full px-3 py-2 rounded-md text-sm"/>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!draft.popular} onChange={(e) => setDraft({...draft, popular: e.target.checked})}/>Popular</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!draft.active} onChange={(e) => setDraft({...draft, active: e.target.checked})}/>Active</label>
      </div>
      <button onClick={save} disabled={saving} data-testid={`save-plan-${plan.id || 'new'}`} className="btn-primary px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2">
        <Save size={14}/> {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}

function Text({ label, v, on }) {
  return (
    <div>
      <label className="tag-uppercase text-white/50 block mb-1 text-xs">{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm"/>
    </div>
  );
}

export default function PlansAdmin({ plans, onChange }) {
  const [adding, setAdding] = useState(false);

  const create = async (payload) => {
    await api.post("/api/admin/plans", payload);
    onChange?.();
    setAdding(false);
  };
  const update = async (payload) => { await api.put(`/api/admin/plans/${payload.id}`, payload); onChange?.(); };
  const remove = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    try { await api.delete(`/api/admin/plans/${plan.id}`); toast.success("Deleted"); onChange?.(); }
    catch (e) { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-4" data-testid="admin-plans-section">
      <div className="flex justify-end">
        <button onClick={() => setAdding(true)} data-testid="admin-add-plan" className="btn-primary px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2">
          <Plus size={14}/> Add plan
        </button>
      </div>
      {adding && <PlanRow plan={EMPTY} onSave={create} onDelete={() => setAdding(false)}/>}
      {plans.map(p => <PlanRow key={p.id} plan={p} onSave={update} onDelete={remove}/>)}
    </div>
  );
}
