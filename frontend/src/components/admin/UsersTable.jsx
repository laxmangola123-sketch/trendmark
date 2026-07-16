import React from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

function membershipTag(u) {
  if (u.has_membership) return <span className="tag-uppercase text-laser">{u.membership_plan || "Active"}</span>;
  return <span className="tag-uppercase text-amber">Trial</span>;
}

export default function UsersTable({ users, onChange }) {
  const toggle = async (u) => {
    try {
      await api.patch(`/api/admin/users/${u.id}/status?active=${!u.is_active}`);
      toast.success(`User ${u.email} ${!u.is_active ? "activated" : "deactivated"}`);
      onChange?.();
    } catch (e) { toast.error(e?.response?.data?.detail || "Update failed"); }
  };

  return (
    <div className="card-tactical rounded-xl overflow-hidden" data-testid="admin-users-table">
      <table className="w-full text-sm">
        <thead className="bg-black/40 text-white/60">
          <tr>
            <th className="text-left px-4 py-3 tag-uppercase">Email</th>
            <th className="text-left px-4 py-3 tag-uppercase">Name</th>
            <th className="text-left px-4 py-3 tag-uppercase">Membership</th>
            <th className="text-left px-4 py-3 tag-uppercase">Credits</th>
            <th className="text-left px-4 py-3 tag-uppercase">Trial</th>
            <th className="text-left px-4 py-3 tag-uppercase">Amount</th>
            <th className="text-left px-4 py-3 tag-uppercase">KYC</th>
            <th className="text-left px-4 py-3 tag-uppercase">Status</th>
            <th className="text-left px-4 py-3 tag-uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-white/5" data-testid={`admin-user-row-${u.email}`}>
              <td className="px-4 py-3">{u.email}{u.is_admin && <span className="ml-2 tag-uppercase text-volt">ADMIN</span>}</td>
              <td className="px-4 py-3 text-white/70">{u.name}</td>
              <td className="px-4 py-3">{membershipTag(u)}</td>
              <td className="px-4 py-3 font-mono">{u.credits}</td>
              <td className="px-4 py-3 font-mono">{u.trial_days_left}d</td>
              <td className="px-4 py-3 font-mono">${u.membership_amount || 0}</td>
              <td className="px-4 py-3"><span className={`tag-uppercase ${u.kyc_status === 'approved' ? 'text-laser' : u.kyc_status === 'pending' ? 'text-amber' : u.kyc_status === 'rejected' ? 'text-blaze' : 'text-white/40'}`}>{u.kyc_status || 'none'}</span></td>
              <td className="px-4 py-3"><span className={`tag-uppercase ${u.is_active ? 'text-laser' : 'text-blaze'}`}>{u.is_active ? "Active" : "Deactivated"}</span></td>
              <td className="px-4 py-3">
                {!u.is_admin && (
                  <button data-testid={`toggle-user-${u.email}`} onClick={() => toggle(u)} className="btn-outline px-3 py-1 rounded-md text-xs">
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={9} className="px-4 py-6 text-center text-white/50">No users yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
