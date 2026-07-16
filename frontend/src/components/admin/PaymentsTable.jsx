import React from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

const STATUS_TONE = { approved: "text-laser", rejected: "text-blaze", pending: "text-amber" };

export default function PaymentsTable({ payments = [], onChange }) {
  const approve = async (p) => {
    try {
      await api.patch(`/api/admin/payments/${p.id}/approve`);
      toast.success(`Approved ${p.user_email} · ${p.plan_name}`);
      onChange?.();
    } catch (e) { toast.error(e?.response?.data?.detail || "Approve failed"); }
  };
  const reject = async (p) => {
    try {
      await api.patch(`/api/admin/payments/${p.id}/reject`);
      toast.success("Rejected");
      onChange?.();
    } catch (e) { toast.error("Reject failed"); }
  };

  return (
    <div className="card-tactical rounded-xl overflow-hidden" data-testid="admin-payments-table">
      <table className="w-full text-sm">
        <thead className="bg-black/40 text-white/60">
          <tr>
            <th className="text-left px-4 py-3 tag-uppercase">User</th>
            <th className="text-left px-4 py-3 tag-uppercase">Plan</th>
            <th className="text-left px-4 py-3 tag-uppercase">Amount</th>
            <th className="text-left px-4 py-3 tag-uppercase">Status</th>
            <th className="text-left px-4 py-3 tag-uppercase">Date</th>
            <th className="text-left px-4 py-3 tag-uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t border-white/5">
              <td className="px-4 py-3">{p.user_email}</td>
              <td className="px-4 py-3">{p.plan_name}</td>
              <td className="px-4 py-3 font-mono text-laser">${p.amount}</td>
              <td className="px-4 py-3"><span className={`tag-uppercase ${STATUS_TONE[p.status] || "text-white/50"}`}>{p.status}</span></td>
              <td className="px-4 py-3 text-white/50 text-xs">{p.created_at?.slice(0, 16).replace("T", " ")}</td>
              <td className="px-4 py-3 flex gap-2">
                {p.status === "pending" && (
                  <>
                    <button data-testid={`approve-payment-${p.id}`} onClick={() => approve(p)} className="btn-primary px-3 py-1 rounded-md text-xs">Approve</button>
                    <button onClick={() => reject(p)} className="btn-outline px-3 py-1 rounded-md text-xs">Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-white/50">No payments yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
