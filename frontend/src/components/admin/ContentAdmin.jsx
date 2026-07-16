import React, { useEffect, useState } from "react";
import { api, getToken } from "../../lib/api";
import { toast } from "sonner";
import { Trash2, Plus, Upload } from "lucide-react";

const SECTIONS = [
  "portfolio",
  "markets",
  "analytics",
  "watchlist",
];

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

export default function ContentAdmin() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    section: "portfolio",
    title: "",
    description: "",
  });

  const [file, setFile] = useState(null);

  const load = async () => {
    try {

      const { data } = await api.get("/api/admin/content");

      console.log("Content API:", data);

      if (Array.isArray(data)) {
        setItems(data);
      } else if (Array.isArray(data.items)) {
        setItems(data.items);
      } else if (Array.isArray(data.content)) {
        setItems(data.content);
      } else if (Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        setItems([]);
      }

    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please choose an image.");
      return;
    }

    setUploading(true);

    try {

      const fd = new FormData();

      fd.append("section", form.section);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("image", file);

      const res = await fetch(
        `${BACKEND}/api/admin/content`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`
          },
          body: fd,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Upload failed"
        );
      }

      toast.success("Content uploaded");

      setForm({
        section: form.section,
        title: "",
        description: "",
      });

      setFile(null);
      setShowForm(false);

      load();

    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    try {
      await api.delete(`/api/admin/content/${item.id}`);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
        err?.message ||
        "Delete failed"
      );
    }
  };

  return (
    <div
      className="space-y-5"
      data-testid="admin-content-section"
    >

      <div className="flex justify-between items-center">

        <div className="text-sm text-white/60">
          Upload research images, chart snapshots or infographics.
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-3 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={14} />

          {showForm ? "Cancel" : "Add Content"}
        </button>

      </div>

      {showForm && (

        <form
          onSubmit={submit}
          className="card-tactical rounded-xl p-5 space-y-4"
        >

          <div className="grid md:grid-cols-3 gap-3">

            <div>

              <label className="block text-sm mb-1">
                Section
              </label>

              <select
                value={form.section}
                onChange={(e) =>
                  setForm({
                    ...form,
                    section: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded"
              >

                {SECTIONS.map((s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {s}
                  </option>
                ))}

              </select>

            </div>

            <div className="md:col-span-2">

              <label className="block text-sm mb-1">
                Title
              </label>

              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm mb-1">
              Description
            </label>

            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded"
            />

          </div>

          <div>

            <label className="block text-sm mb-1">
              Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] || null
                )
              }
            />

          </div>

          <button
            type="submit"
            disabled={uploading}
            className="btn-primary px-4 py-2 rounded flex items-center gap-2"
          >
            <Upload size={14} />

            {uploading
              ? "Uploading..."
              : "Publish"}

          </button>

        </form>

      )}

      {loading && (
        <div className="text-white/50">
          Loading...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(items) &&
          items.map((it) => (
            <div
              key={it.id}
              className="card-tactical rounded-xl overflow-hidden"
              data-testid={`admin-content-item-${it.id}`}
            >
              <img
                src={`${BACKEND}${it.image_url}`}
                alt={it.title}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">

                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 min-w-0">

                    <div className="tag-uppercase text-volt text-[10px]">
                      {it.section}
                    </div>

                    <div className="font-heading font-bold text-base truncate">
                      {it.title}
                    </div>

                  </div>

                  <button
                    onClick={() => remove(it)}
                    className="text-blaze hover:text-blaze/80 p-1"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>

                {it.description && (
                  <div className="text-white/60 text-xs mt-2 line-clamp-2">
                    {it.description}
                  </div>
                )}

                <div className="text-[10px] text-white/40 mt-2 font-mono">
                  Posted{" "}
                  {it.created_at
                    ? new Date(it.created_at).toLocaleDateString()
                    : "-"}
                  {" · "}
                  by {it.created_by || "Admin"}
                </div>

              </div>
            </div>
          ))}
      </div>

      {!loading &&
        Array.isArray(items) &&
        items.length === 0 && (
          <div className="text-center py-8 text-white/50">
            No content published yet.
          </div>
        )}

    </div>
  );
}
