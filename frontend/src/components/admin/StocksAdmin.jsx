import React, { useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Save, Trash2, Plus } from "lucide-react";

const EMPTY = { symbol: "", name: "", price: 0, change_pct: 0 };

function Row({ stock, onSave, onDelete }) {
  const [draft, setDraft] = useState(stock);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ ...draft, price: Number(draft.price), change_pct: Number(draft.change_pct) });
      toast.success(`Saved ${draft.symbol}`);
    } catch (e) { toast.error(e?.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <tr className="border-t border-white/5" data-testid={`admin-stock-${stock.symbol || 'new'}`}>
      <td className="px-3 py-2"><input value={draft.symbol} onChange={(e) => setDraft({...draft, symbol: e.target.value.toUpperCase()})} className="w-24 px-2 py-1 rounded text-sm font-mono"/></td>
      <td className="px-3 py-2"><input value={draft.name} onChange={(e) => setDraft({...draft, name: e.target.value})} className="w-full px-2 py-1 rounded text-sm"/></td>
      <td className="px-3 py-2"><input type="number" step="0.01" value={draft.price} onChange={(e) => setDraft({...draft, price: e.target.value})} className="w-24 px-2 py-1 rounded text-sm font-mono"/></td>
      <td className="px-3 py-2"><input type="number" step="0.01" value={draft.change_pct} onChange={(e) => setDraft({...draft, change_pct: e.target.value})} className={`w-24 px-2 py-1 rounded text-sm font-mono ${Number(draft.change_pct) >= 0 ? "text-laser" : "text-blaze"}`}/></td>
      <td className="px-3 py-2 flex gap-2">
        <button onClick={save} disabled={saving} className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"><Save size={12}/>{saving ? "..." : "Save"}</button>
        {stock.id && <button onClick={() => onDelete(stock)} className="text-blaze hover:text-blaze/80 p-1" title="Delete"><Trash2 size={14}/></button>}
      </td>
    </tr>
  );
}

export default function StocksAdmin({ stocks, onChange }) {
  const [adding, setAdding] = useState(false);

  const create = async (payload) => { await api.post("/api/admin/stocks", payload); onChange?.(); setAdding(false); };
  const update = async (payload) => { await api.put(`/api/admin/stocks/${payload.id}`, payload); onChange?.(); };
  const remove = async (stock) => {
    if (!window.confirm(`Delete ${stock.symbol}?`)) return;
    await api.delete(`/api/admin/stocks/${stock.id}`); toast.success("Deleted"); onChange?.();
  };

  return (
    <div className="card-tactical rounded-xl overflow-hidden" data-testid="admin-stocks-section">
      <div className="flex justify-between items-center p-4 border-b border-white/5">
        <div className="text-sm text-white/60">Manage the live stock ticker shown on the home page.</div>
        <button data-testid="admin-add-stock" onClick={() => setAdding(true)} className="btn-primary px-3 py-1.5 rounded-md text-xs flex items-center gap-1"><Plus size={12}/>Add stock</button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-black/40 text-white/60">
          <tr>
            <th className="text-left px-3 py-2 tag-uppercase">Symbol</th>
            <th className="text-left px-3 py-2 tag-uppercase">Name</th>
            <th className="text-left px-3 py-2 tag-uppercase">Price</th>
            <th className="text-left px-3 py-2 tag-uppercase">Change %</th>
            <th className="text-left px-3 py-2 tag-uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {adding && <Row stock={EMPTY} onSave={create} onDelete={() => setAdding(false)}/>}
          {stocks.map((s) => <Row key={s.id} stock={s} onSave={update} onDelete={remove}/>)}
        </tbody>
      </table>
    </div>
  );
}
