import React, { useEffect, useState } from "react";
import { api, getToken } from "../../lib/api";
import { toast } from "sonner";
import { Trash2, Plus, Upload } from "lucide-react";

const SECTIONS = ["portfolio", "markets", "analytics", "watchlist"];
const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function ContentAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ section: "portfolio", title: "", description: "" });
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/api/admin/content").then(({data}) => setItems(data.items)).catch(() => {});
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please choose an image file.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("section", form.section);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("image", file);
      const res = await fetch(`${BACKEND}/api/admin/content`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      toast.success(`Published to ${form.section}`);
      setForm({ section: form.section, title: "", description: "" });
      setFile(null);
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try { await api.delete(`/api/admin/content/${item.id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5" data-testid="admin-content-section">
      <div className="flex justify-between items-center">
        <div className="text-sm text-white/60">Upload research images, chart snapshots or infographics for each dashboard section.</div>
        <button data-testid="admin-content-add" onClick={() => setShowForm((v) => !v)} className="btn-primary px-3 py-1.5 rounded-md text-xs flex items-center gap-1">
          <Plus size={12}/> {showForm ? "Cancel" : "Add content"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-tactical rounded-xl p-5 space-y-4" data-testid="admin-content-form">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="tag-uppercase text-white/50 block mb-1 text-xs">Section</label>
              <select value={form.section} onChange={(e) => setForm({...form, section: e.target.value})}
                className="w-full px-3 py-2 rounded-md text-sm" data-testid="admin-content-section-select">
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="tag-uppercase text-white/50 block mb-1 text-xs">Title</label>
              <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 rounded-md text-sm" data-testid="admin-content-title"/>
            </div>
          </div>
          <div>
            <label className="tag-uppercase text-white/50 block mb-1 text-xs">Description (optional)</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 rounded-md text-sm" data-testid="admin-content-description"/>
          </div>
          <div>
            <label className="tag-uppercase text-white/50 block mb-1 text-xs">Image (PNG / JPG / WEBP / GIF)</label>
            <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-white/80" data-testid="admin-content-file"/>
          </div>
          <button type="submit" disabled={uploading} data-testid="admin-content-submit" className="btn-primary px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2">
            <Upload size={14}/> {uploading ? "Uploading..." : "Publish"}
          </button>
        </form>
      )}

      {loading && <div className="text-white/50 text-sm">Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="card-tactical rounded-xl overflow-hidden" data-testid={`admin-content-item-${it.id}`}>
            <img src={`${BACKEND}${it.image_url}`} alt={it.title} className="w-full h-40 object-cover"/>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="tag-uppercase text-volt text-[10px]">{it.section}</div>
                  <div className="font-heading font-bold text-base truncate">{it.title}</div>
                </div>
                <button onClick={() => remove(it)} className="text-blaze hover:text-blaze/80 p-1" title="Delete"><Trash2 size={14}/></button>
              </div>
              {it.description && <div className="text-white/60 text-xs mt-2 line-clamp-2">{it.description}</div>}
              <div className="text-[10px] text-white/40 mt-2 font-mono">Posted {it.created_at?.slice(0,10)} · by {it.created_by}</div>
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-white/50 text-sm text-center py-8">No content published yet.</div>
      )}
    </div>
  );
}
