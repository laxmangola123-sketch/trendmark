import React from "react";

export default function EmailsTable({ emails }) {

  const list =
    Array.isArray(emails)
      ? emails
      : Array.isArray(emails?.emails)
        ? emails.emails
        : Array.isArray(emails?.data)
          ? emails.data
          : [];

  return (
    <div
      className="card-tactical rounded-xl overflow-hidden"
      data-testid="admin-emails-table"
    >
      <table className="w-full text-sm">
        <thead className="bg-black/40 text-white/60">
          <tr>
            <th className="text-left px-4 py-3 tag-uppercase">To</th>
            <th className="text-left px-4 py-3 tag-uppercase">Subject</th>
            <th className="text-left px-4 py-3 tag-uppercase">Sent</th>
            <th className="text-left px-4 py-3 tag-uppercase">Status</th>
          </tr>
        </thead>

        <tbody>
          {list.map((e, index) => (
            <tr
              key={e.id || index}
              className="border-t border-white/5"
            >
              <td className="px-4 py-3">
                {e.to_email || e.email || "-"}
              </td>

              <td className="px-4 py-3">
                {e.subject || "-"}
              </td>

              <td className="px-4 py-3 text-white/50 text-xs">
                {e.sent_at
                  ? new Date(e.sent_at).toLocaleString()
                  : "-"}
              </td>

              <td className="px-4 py-3">
                <span className="tag-uppercase text-laser">
                  {e.status || "sent"}
                </span>
              </td>
            </tr>
          ))}

          {list.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-6 text-center text-white/50"
              >
                No emails found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="p-4 text-xs text-white/40 border-t border-white/5">
        Note: emails are currently{" "}
        <b className="text-amber">MOCKED</b> — logged to DB &
        backend logs.
      </div>
    </div>
  );
}