import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

/**
 * Marquee-style ticker that shows admin-managed stocks and their up/down %.
 * Refreshes every 60 seconds.
 */
export default function StocksTicker() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await api.get("/stocks");

        if (!cancelled) {
          setStocks(data.stocks || []);
        }
      } catch (err) {
        console.error("Failed to load stocks:", err);
      }
    };

    load();

    const timer = setInterval(load, 60000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (!stocks.length) return null;

  return (
    <div
      className="border-y border-white/10 bg-black/60 overflow-hidden"
      data-testid="stocks-ticker"
    >
      <div className="flex gap-8 animate-[marquee_40s_linear_infinite] py-3 whitespace-nowrap">
        {[...stocks, ...stocks].map((s, i) => (
          <span
            key={`${s.symbol}-${i}`}
            className="inline-flex items-center gap-2 font-mono text-sm"
          >
            <span className="text-white/90 font-bold">
              {s.symbol}
            </span>

            <span className="text-white/60">
              ${Number(s.price).toFixed(2)}
            </span>

            <span
              className={
                s.direction === "up"
                  ? "text-laser"
                  : "text-blaze"
              }
            >
              {Number(s.change_pct) >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(Number(s.change_pct)).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}