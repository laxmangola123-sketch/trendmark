import React, { useEffect, useState } from "react";
import api from "../lib/api";

function sideClasses(side) {
  return side === "BUY" ? "text-laser" : "text-blaze";
}

function changeClasses(change) {
  return change >= 0 ? "text-laser" : "text-blaze";
}

export default function SignalsList({ locked }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSignals = async () => {
    try {
      const res = await api.get("/signals");
      setSignals(res.data.signals || []);
    } catch (err) {
      console.error("Failed to load signals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();

    const interval = setInterval(() => {
      loadSignals();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lg:col-span-2 card-tactical rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="tag-uppercase text-white/50">
          Live US Market Signals
        </div>

        <div className="text-xs text-laser">
          Auto Refresh • 30s
        </div>
      </div>

      {loading ? (
        <div className="text-white/50 py-10 text-center">
          Loading live market...
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((s) => (
            <div
              key={s.symbol}
              className="flex items-center justify-between border border-white/5 rounded-lg p-4 bg-black/20 hover:border-volt transition"
            >
              <div>
                <div className="font-heading font-bold text-lg">
                  {s.symbol}
                </div>

                <div className="text-xs text-white/50">
                  {s.name}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-white/50">
                  Price
                </div>

                <div className="font-mono text-lg">
                  ${Number(s.price).toFixed(2)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-white/50">
                  Change
                </div>

                <div
                  className={`font-bold ${changeClasses(
                    s.change_pct
                  )}`}
                >
                  {Number(s.change_pct).toFixed(2)}%
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`tag-uppercase ${sideClasses(
                    s.signal
                  )}`}
                >
                  {s.signal}
                </div>

                <div className="text-xs text-white/40 mt-1">
                  {new Date(s.updated_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {locked && (
        <div className="mt-5 text-xs text-white/50 italic">
          Upgrade membership to unlock premium AI signals,
          market analysis, portfolio tracking and advanced
          trading tools.
        </div>
      )}
    </div>
  );
}