import React from "react";

export default function EmailsTable({ emails = [] }) {
  return (
    <div className="card-tactical rounded-xl overflow-hidden" data-testid="admin-emails-table">
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
          {emails.map((e) => (
            <tr key={e.id} className="border-t border-white/5">
              <td className="px-4 py-3">{e.to_email}</td>
              <td className="px-4 py-3">{e.subject}</td>
              <td className="px-4 py-3 text-white/50 text-xs">{e.sent_at?.slice(0, 16).replace("T", " ")}</td>
              <td className="px-4 py-3 tag-uppercase text-laser">{e.status}</td>
            </tr>
          ))}
          {emails.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-6 text-center text-white/50">No emails sent yet.</td></tr>
          )}
        </tbody>
      </table>
      <div className="p-4 text-xs text-white/40 border-t border-white/5">
        Note: emails are currently <b className="text-amber">MOCKED</b> — logged to DB &amp; backend logs. Connect SendGrid/Resend to send real messages.
      </div>
    </div>
  );
}
