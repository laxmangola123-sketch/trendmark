import React from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { FileText } from "lucide-react";

const STATUS_TONE = {
  approved: "text-laser",
  pending: "text-amber",
  rejected: "text-blaze",
};

export default function KycAdmin({ items, onChange }) {

  // Fix: handle API object response
  const kycItems = Array.isArray(items)
    ? items
    : items?.items || items?.data || items?.results || [];

  const setStatus = async (item, status) => {
    try {
      await api.patch(
        `/api/admin/kyc/${item.id}/status?status=${status}`
      );

      toast.success(`${item.user_email}: ${status}`);
      onChange?.();

    } catch (e) {
      toast.error(
        e?.response?.data?.detail || "Update failed"
      );
    }
  };

  const backend = process.env.REACT_APP_BACKEND_URL || "";

  return (
    <div
      className="card-tactical rounded-xl overflow-hidden"
      data-testid="admin-kyc-section"
    >
      <table className="w-full text-sm">

        <thead className="bg-black/40 text-white/60">
          <tr>
            <th className="text-left px-3 py-2 tag-uppercase">User</th>
            <th className="text-left px-3 py-2 tag-uppercase">Full name</th>
            <th className="text-left px-3 py-2 tag-uppercase">DOB</th>
            <th className="text-left px-3 py-2 tag-uppercase">Passport</th>
            <th className="text-left px-3 py-2 tag-uppercase">Address</th>
            <th className="text-left px-3 py-2 tag-uppercase">Document</th>
            <th className="text-left px-3 py-2 tag-uppercase">Status</th>
            <th className="text-left px-3 py-2 tag-uppercase">Action</th>
          </tr>
        </thead>


        <tbody>

          {kycItems.map((k) => (
            <tr
              key={k.id}
              className="border-t border-white/5"
            >

              <td className="px-3 py-2">
                {k.user_email}
              </td>

              <td className="px-3 py-2">
                {k.full_name}
              </td>

              <td className="px-3 py-2 font-mono">
                {k.dob}
              </td>

              <td className="px-3 py-2 font-mono">
                {k.passport_number}
              </td>

              <td className="px-3 py-2 text-white/60 text-xs">
                {k.address_line1}, {k.address_city}, {k.address_state} {k.address_zip}
              </td>

              <td className="px-3 py-2">
                {k.document_url ? (
                  <a
                    href={`${backend}${k.document_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-volt hover:text-white flex items-center gap-1"
                  >
                    <FileText size={14} />
                    PDF
                  </a>
                ) : (
                  "No document"
                )}
              </td>


              <td className="px-3 py-2">
                <span className={`tag-uppercase ${STATUS_TONE[k.status] || "text-white/50"}`}>
                  {k.status}
                </span>
              </td>


              <td className="px-3 py-2 flex gap-1">

                {k.status !== "approved" && (
                  <button
                    onClick={() => setStatus(k, "approved")}
                    className="btn-primary px-2 py-1 rounded text-xs"
                  >
                    Approve
                  </button>
                )}

                {k.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(k, "rejected")}
                    className="btn-outline px-2 py-1 rounded text-xs"
                  >
                    Reject
                  </button>
                )}

              </td>

            </tr>
          ))}


          {kycItems.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-white/50">
                No KYC submissions yet.
              </td>
            </tr>
          )}

        </tbody>

      </table>
    </div>
  );
}