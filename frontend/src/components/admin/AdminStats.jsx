import React from "react";
import { Users, Crown, TimerReset, DollarSign, Mail, UserX, Clock } from "lucide-react";
import { motion } from "framer-motion";

function Stat({ icon: Icon, label, value, tone = "text-white", testId }) {
  return (
    <div className="card-tactical rounded-xl p-5" data-testid={testId}>
      <div className="tag-uppercase text-white/50 mb-2 flex items-center gap-2">
        <Icon size={14} />
        {label}
      </div>

      <div className={`font-heading font-black text-3xl tracking-tight ${tone}`}>
        {value}
      </div>
    </div>
  );
}

export default function AdminStats({ stats }) {

  const s = stats?.stats || stats || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10"
    >
      <Stat
        testId="admin-stat-users"
        icon={Users}
        label="Total users"
        value={s.total_users || 0}
      />

      <Stat
        testId="admin-stat-members"
        icon={Crown}
        label="Active members"
        value={s.active_members || 0}
        tone="text-volt"
      />

      <Stat
        testId="admin-stat-trial"
        icon={TimerReset}
        label="Trial users"
        value={s.trial_users || 0}
        tone="text-amber"
      />

      <Stat
        testId="admin-stat-inactive"
        icon={UserX}
        label="Deactivated"
        value={s.inactive_users || 0}
        tone="text-blaze"
      />

      <Stat
        testId="admin-stat-revenue"
        icon={DollarSign}
        label="Revenue"
        value={`$${s.total_revenue || 0}`}
        tone="text-laser"
      />

      <Stat
        testId="admin-stat-payments"
        icon={Mail}
        label="Payments"
        value={s.payments_count || 0}
      />

      <Stat
        testId="admin-stat-pending"
        icon={Clock}
        label="Pending"
        value={s.pending_payments || 0}
        tone="text-amber"
      />
    </motion.div>
  );
}