import React from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

const STATUS_TONE = {
  approved: "text-laser",
  rejected: "text-blaze",
  pending: "text-amber",
};

export default function PaymentsTable({ payments, onChange }) {

  const paymentList = Array.isArray(payments)
    ? payments
    : Array.isArray(payments?.payments)
      ? payments.payments
      : [];

  const approve = async (p) => {
    try {
      await api.patch(`/api/admin/payments/${p.id}/approve`);
      toast.success(`Approved ${p.user_email}`);
      onChange?.();
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
        e?.message ||
        "Approve failed"
      );
    }
  };

  const reject = async (p) => {
    try {
      await api.patch(`/api/admin/payments/${p.id}/reject`);
      toast.success("Payment rejected");
      onChange?.();
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
        e?.message ||
        "Reject failed"
      );
    }
  };

  return (
    <div
      className="card-tactical rounded-xl overflow-hidden"
      data-testid="admin-payments-table"
    >
      <table className="w-full text-sm">
        <thead className="bg-black/40 text-white/60">
          <tr>
            <th className="text-left px-4 py-3">User</th>
            <th className="text-left px-4 py-3">Plan</th>
            <th className="text-left px-4 py-3">Amount</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-left px-4 py-3">Action</th>
          </tr>
        </thead>

        <tbody>

          {paymentList.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-white/50"
              >
                No payments found
              </td>
            </tr>
          )}

          {paymentList.map((p) => (
            <tr
              key={p.id}
              className="border-t border-white/5"
            >
              <td className="px-4 py-3">
                {p.user_email || "-"}
              </td>

              <td className="px-4 py-3">
                {p.plan_name || "-"}
              </td>

              <td className="px-4 py-3">
                ${p.amount ?? 0}
              </td>

              <td className="px-4 py-3">
                <span
                  className={
                    STATUS_TONE[p.status] || "text-white"
                  }
                >
                  {p.status || "-"}
                </span>
              </td>

              <td className="px-4 py-3">
                {p.created_at
                  ? new Date(p.created_at).toLocaleString()
                  : "-"}
              </td>

              <td className="px-4 py-3 flex gap-2">

                {p.status === "pending" && (
                  <>
                    <button
                      className="btn-primary px-3 py-1 rounded"
                      onClick={() => approve(p)}
                    >
                      Approve
                    </button>

                    <button
                      className="btn-outline px-3 py-1 rounded"
                      onClick={() => reject(p)}
                    >
                      Reject
                    </button>
                  </>
                )}

              </td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
}