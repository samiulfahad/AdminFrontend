import { useEffect, useState, useCallback } from "react";
import { Plus, Search, MapPin, Pencil, Trash2, X, Check, Globe } from "lucide-react";

import Modal from "../../components/modal";
import Popup from "../../components/popup";
import zoneService from "../../api/zoneService";

// ── Zone Form Modal ───────────────────────────────────────────────────────────
const ZoneFormModal = ({ isOpen, onClose, onSubmit, initial, mode }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setName(initial?.name || "");
  }, [isOpen, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim() });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 tracking-tight">
                {mode === "create" ? "Add New Zone" : "Edit Zone"}
              </p>
              <p className="text-[11px] text-slate-400">
                {mode === "create" ? "Enter a name for the new zone" : "Update zone name"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Zone Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dhaka North"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 focus:bg-white transition-all placeholder-slate-300"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-md hover:bg-teal-50 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {mode === "create" ? "Create Zone" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Zone Card ─────────────────────────────────────────────────────────────────
const ZoneCard = ({ zone, index, onEdit, onDelete }) => (
  <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-teal-200 hover:bg-teal-50/30 transition-all">
    {/* Index badge */}
    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
      <span className="text-[11px] font-black text-slate-400">{String(index + 1).padStart(2, "0")}</span>
    </div>

    {/* Name */}
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
      <span className="text-sm font-bold text-slate-700 tracking-tight truncate">{zone.name}</span>
    </div>

    {/* Actions — visible on hover */}
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <button
        onClick={() => onEdit(zone)}
        className="p-1.5 rounded-md text-slate-400 hover:bg-white hover:text-slate-700 hover:border hover:border-slate-200 transition"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onDelete(zone)}
        className="p-1.5 rounded-md text-slate-300 hover:bg-white hover:text-red-400 transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white animate-pulse">
    <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
    <div className="flex items-center gap-2 flex-1">
      <div className="w-3.5 h-3.5 bg-slate-100 rounded shrink-0" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState({ open: false, mode: "create", initial: null });
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await zoneService.getZones();
      setZones(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      showPopup("error", "Failed to load zones. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

  const handleCreate = async (data) => {
    try {
      await zoneService.createZone(data);
      showPopup("success", "Zone created successfully!");
      fetchZones();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to create zone.");
      throw err;
    }
  };

  const handleEdit = async (data) => {
    try {
      await zoneService.updateZone(formModal.initial._id, data);
      showPopup("success", "Zone updated successfully!");
      fetchZones();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to update zone.");
      throw err;
    }
  };

  const handleDelete = (zone) => {
    showPopup("warning", `Delete "${zone.name}"? This cannot be undone.`, async () => {
      try {
        await zoneService.deleteZone(zone._id);
        showPopup("success", "Zone deleted successfully!");
        fetchZones();
      } catch {
        showPopup("error", "Failed to delete zone.");
      }
    });
  };

  const filtered = zones.filter((z) => z.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Zone Management</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Configure delivery and service zones</p>
          </div>
        </div>

        <button
          onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-md hover:bg-teal-50 hover:border-teal-400 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Zone
        </button>
      </div>

      {/* ── Search + count bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search zones…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-slate-800 placeholder-slate-300 bg-transparent focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/60">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-400">
            {search ? (
              <>
                <span className="font-bold text-slate-600">{filtered.length}</span> of {zones.length} zones match{" "}
                <span className="font-bold text-slate-600">"{search}"</span>
              </>
            ) : (
              <>
                <span className="font-bold text-slate-600">{zones.length}</span> {zones.length === 1 ? "zone" : "zones"}{" "}
                configured
              </>
            )}
          </span>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-11 h-11 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-500 mb-1">
            {search ? `No zones match "${search}"` : "No zones configured yet"}
          </p>
          <p className="text-xs text-slate-400 mb-5 max-w-xs">
            {search
              ? "Try a different search term or clear the filter."
              : "Add your first zone to start organising service areas."}
          </p>
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              <X className="w-3.5 h-3.5" /> Clear Search
            </button>
          ) : (
            <button
              onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-md hover:bg-teal-50 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Zone
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((zone, i) => (
            <ZoneCard
              key={zone._id}
              zone={zone}
              index={i}
              onEdit={(z) => setFormModal({ open: true, mode: "edit", initial: z })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ZoneFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal((f) => ({ ...f, open: false }))}
        onSubmit={formModal.mode === "create" ? handleCreate : handleEdit}
        initial={formModal.initial}
        mode={formModal.mode}
      />

      {popup.open && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={closePopup}
          onConfirm={popup.onConfirm}
          confirmText="Yes, delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default Zones;
