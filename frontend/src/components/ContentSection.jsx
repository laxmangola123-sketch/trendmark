import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

const META = {
  portfolio: { title: "Portfolio", subtitle: "Recommended holdings and long-term positions from our analysts." },
  markets: { title: "Markets", subtitle: "Live sector snapshots, macro moves and index heat-maps." },
  analytics: { title: "Analytics", subtitle: "Deep-dive technical and fundamental research reports." },
  watchlist: { title: "Watchlist", subtitle: "Tickers we're actively monitoring for entries and exits." },
};

export default function ContentSection({ section }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const meta = META[section] || { title: section, subtitle: "" };

  useEffect(() => {
    let cancelled = false;
    api.get(`/api/content/${section}`)
      .then(({ data }) => { if (!cancelled) setItems(data.items); })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [section]);

  return (
    <div data-testid={`content-page-${section}`}>
      <div className="tag-uppercase text-volt mb-2">{section}</div>
      <h1 className="font-heading font-black text-4xl tracking-tighter mb-2">{meta.title}</h1>
      <p className="text-white/60 text-sm mb-8 max-w-2xl">{meta.subtitle}</p>

      {loading && <div className="text-white/50 text-sm">Loading...</div>}

      {!loading && items.length === 0 && (
        <div className="card-tactical rounded-xl p-10 text-center flex flex-col items-center gap-3" data-testid={`content-empty-${section}`}>
          <ImageOff className="text-white/40" size={40} />
          <div className="font-heading font-bold text-lg">Nothing published yet</div>
          <div className="text-white/50 text-sm max-w-md">Our team hasn&apos;t uploaded anything to this section. Check back soon — admins push new research here every trading day.</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <motion.article
            key={it.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card-tactical rounded-xl overflow-hidden flex flex-col"
            data-testid={`content-item-${it.id}`}
          >
            <a href={`${BACKEND}${it.image_url}`} target="_blank" rel="noreferrer" className="block bg-black">
              <img
                src={`${BACKEND}${it.image_url}`}
                alt={it.title}
                className="w-full h-52 object-cover hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </a>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-heading font-bold text-lg mb-1">{it.title}</h3>
              {it.description && <p className="text-white/60 text-sm flex-1">{it.description}</p>}
              <div className="text-[10px] text-white/40 mt-3 font-mono">Posted {it.created_at?.slice(0, 10)}</div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
