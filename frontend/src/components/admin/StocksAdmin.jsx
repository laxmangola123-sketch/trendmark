import React, { useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Save, Trash2, Plus } from "lucide-react";

const EMPTY = {
  symbol: "",
  name: "",
  price: 0,
  change_pct: 0,
};

function Row({ stock, onSave, onDelete }) {
  const [draft, setDraft] = useState(stock);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    try {
      await onSave({
        ...draft,
        price: Number(draft.price),
        change_pct: Number(draft.change_pct),
      });

      toast.success(`Saved ${draft.symbol}`);

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
    <tr className="border-t border-white/5">

      <td className="px-3 py-2">
        <input
          value={draft.symbol}
          onChange={(e) =>
            setDraft({
              ...draft,
              symbol: e.target.value.toUpperCase(),
            })
          }
          className="w-24 px-2 py-1 rounded"
        />
      </td>

      <td className="px-3 py-2">
        <input
          value={draft.name}
          onChange={(e) =>
            setDraft({
              ...draft,
              name: e.target.value,
            })
          }
          className="w-full px-2 py-1 rounded"
        />
      </td>

      <td className="px-3 py-2">
        <input
          type="number"
          value={draft.price}
          onChange={(e) =>
            setDraft({
              ...draft,
              price: e.target.value,
            })
          }
          className="w-24 px-2 py-1 rounded"
        />
      </td>

      <td className="px-3 py-2">
        <input
          type="number"
          value={draft.change_pct}
          onChange={(e) =>
            setDraft({
              ...draft,
              change_pct: e.target.value,
            })
          }
          className="w-24 px-2 py-1 rounded"
        />
      </td>

      <td className="px-3 py-2 flex gap-2">

        <button
          onClick={save}
          disabled={saving}
          className="btn-primary px-3 py-1 rounded"
        >
          <Save size={12} />
          {saving ? "..." : "Save"}
        </button>

        {stock.id && (
          <button
            onClick={() => onDelete(stock)}
            className="text-red-500"
          >
            <Trash2 size={15} />
          </button>
        )}

      </td>

    </tr>
  );
}

export default function StocksAdmin({ stocks = [], onChange }) {

  const [adding, setAdding] = useState(false);

  // ✅ convert object → array
  const stocksList = Array.isArray(stocks)
    ? stocks
    : stocks?.stocks || [];

  const create = async (payload) => {
    await api.post("/admin/stocks", payload);
    onChange?.();
    setAdding(false);
  };

  const update = async (payload) => {
    await api.put(`/admin/stocks/${payload.id}`, payload);
    onChange?.();
  };

  const remove = async (stock) => {

    if (!window.confirm(`Delete ${stock.symbol}?`)) return;

    await api.delete(`/admin/stocks/${stock.id}`);

    toast.success("Deleted");

    onChange?.();
  };

  return (
    <div className="card-tactical rounded-xl overflow-hidden">

      <div className="flex justify-between items-center p-4">

        <button
          onClick={() => setAdding(true)}
          className="btn-primary flex items-center gap-2 px-3 py-2"
        >
          <Plus size={14} />
          Add Stock
        </button>

      </div>

      <table className="w-full">

        <thead>

          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>Change %</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {adding && (
            <Row
              stock={EMPTY}
              onSave={create}
              onDelete={() => setAdding(false)}
            />
          )}

          {stocksList.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="text-center py-6 text-white/50"
              >
                No stocks found.
              </td>
            </tr>
          )}

          {stocksList.map((s) => (
            <Row
              key={s.id || s.symbol}
              stock={s}
              onSave={update}
              onDelete={remove}
            />
          ))}

        </tbody>

      </table>

    </div>
  );
}