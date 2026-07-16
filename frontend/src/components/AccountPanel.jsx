import React from "react";

function Row({ label, value, testId }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span data-testid={testId}>{value}</span>
    </div>
  );
}

export default function AccountPanel({ user, onRefresh }) {
  return (
    <div className="card-tactical rounded-xl p-6">
      <div className="tag-uppercase text-white/50 mb-3">Account</div>
      <div className="space-y-3 text-sm">
        <Row label="Email" value={user.email} testId="account-email" />
        <Row label="Joined" value={user.created_at?.slice(0, 10)} />
        <Row label="Trial ends" value={user.trial_ends_at?.slice(0, 10)} />
        {user.membership_started_at && (
          <Row label="Membership since" value={user.membership_started_at.slice(0, 10)} />
        )}
      </div>
      <button
        onClick={onRefresh}
        className="mt-5 btn-outline w-full py-2 rounded-md text-xs"
        data-testid="refresh-account"
      >
        Refresh
      </button>
    </div>
  );
}
