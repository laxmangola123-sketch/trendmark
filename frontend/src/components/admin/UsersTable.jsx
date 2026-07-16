import React from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

function membershipTag(u) {
  if (u.has_membership) {
    return (
      <span className="tag-uppercase text-laser">
        {u.membership_plan || "Active"}
      </span>
    );
  }

  return (
    <span className="tag-uppercase text-amber">
      Trial
    </span>
  );
}

export default function UsersTable({ users = [], onChange }) {

  // ✅ Always convert to array
  const usersList = Array.isArray(users)
    ? users
    : users?.users || [];

  const toggle = async (u) => {
    try {
      await api.patch(`/admin/users/${u.id}/status`, {
        active: !u.is_active,
      });

      toast.success(
        `User ${u.email} ${!u.is_active ? "activated" : "deactivated"
        }`
      );

      onChange?.();

    } catch (e) {
      toast.error(
        e?.message ||
        e?.response?.data?.detail ||
        "Update failed"
      );
    }
  };

  return (
    <div
      className="card-tactical rounded-xl overflow-hidden"
      data-testid="admin-users-table"
    >
      <table className="w-full text-sm">
        <thead className="bg-black/40 text-white/60">
          <tr>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Membership</th>
            <th className="text-left px-4 py-3">Credits</th>
            <th className="text-left px-4 py-3">Trial</th>
            <th className="text-left px-4 py-3">Amount</th>
            <th className="text-left px-4 py-3">KYC</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Action</th>
          </tr>
        </thead>

        <tbody>

          {usersList.length === 0 && (
            <tr>
              <td
                colSpan="9"
                className="text-center py-8 text-white/50"
              >
                No users found.
              </td>
            </tr>
          )}

          {usersList.map((u) => (
            <tr
              key={u.id}
              className="border-t border-white/10"
            >
              <td className="px-4 py-3">
                {u.email}

                {u.is_admin && (
                  <span className="ml-2 text-blue-400 text-xs">
                    ADMIN
                  </span>
                )}
              </td>

              <td className="px-4 py-3">
                {u.name}
              </td>

              <td className="px-4 py-3">
                {membershipTag(u)}
              </td>

              <td className="px-4 py-3">
                {u.credits}
              </td>

              <td className="px-4 py-3">
                {u.trial_days_left}
              </td>

              <td className="px-4 py-3">
                ${u.membership_amount || 0}
              </td>

              <td className="px-4 py-3">
                {u.kyc_status || "none"}
              </td>

              <td className="px-4 py-3">
                {u.is_active ? "Active" : "Inactive"}
              </td>

              <td className="px-4 py-3">

                {!u.is_admin && (
                  <button
                    onClick={() => toggle(u)}
                    className="btn-outline px-3 py-1 rounded"
                  >
                    {u.is_active
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                )}

              </td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
}