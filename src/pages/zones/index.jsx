import { useEffect, useState, useCallback } from "react";
import { Plus, Search, MapPin, Pencil, Trash2, X, Check, Globe } from "lucide-react";

import Modal from "../../components/modal";
import Popup from "../../components/Popup";
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8eaed]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1a1c20] rounded-xl flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1a1c20] tracking-tight">
                {mode === "create" ? "Add New Zone" : "Edit Zone"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === "create" ? "Enter a name for the new zone" : "Update zone name"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <label className="block text-[10px] font-bold text-[#4a5060] uppercase tracking-widest mb-1.5">
            Zone Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Zone A"
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg border border-[#d0d4dc] bg-[#f7f8fa] text-sm text-[#1a1c20] focus:outline-none focus:ring-2 focus:ring-[#1a1c20]/10 focus:border-[#1a1c20] focus:bg-white transition-all placeholder-slate-300"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#e8eaed] bg-[#f7f8fa]/60 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#3a3d45] bg-white border border-[#d0d4dc] rounded-lg hover:bg-[#f7f8fa] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1a1c20] hover:bg-[#252830] rounded-lg disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
  <div className="group relative bg-white border border-[#e2e5eb] rounded-2xl px-5 py-4 hover:border-[#c8ccd4] hover:shadow-md hover:shadow-slate-100 transition-all duration-200 overflow-hidden">
    {/* Left accent bar */}
    <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-[#1a1c20] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

    <div className="flex items-center justify-between gap-3">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#f0f1f3] border border-[#e2e5eb] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-black text-[#3a3d45]">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#8a909e] shrink-0" />
          <span className="text-sm font-bold text-[#1a1c20] tracking-tight truncate">{zone.name}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
        <button
          onClick={() => onEdit(zone)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1a1c20] bg-[#f0f1f3] hover:bg-[#e5e7eb] border border-[#d8dce4] rounded-lg transition"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete(zone)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 rounded-lg transition"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-[#e2e5eb] rounded-2xl px-5 py-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#f0f1f3] rounded-xl shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <div className="w-3.5 h-3.5 bg-[#f0f1f3] rounded shrink-0" />
        <div className="h-3.5 bg-[#f0f1f3] rounded-md w-1/3" />
      </div>
    </div>
  </div>
);

// ── Main Zones Page ───────────────────────────────────────────────────────────
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a1c20] rounded-2xl flex items-center justify-center shadow-md shadow-black/10">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1a1c20] tracking-tight leading-none">Zone Management</h1>
              <p className="text-xs text-[#8a909e] mt-0.5">Configure delivery and service zones</p>
            </div>
          </div>

          {/* Summary chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0f1f3] border border-[#e2e5eb] rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-[#6a707e]" />
            <span className="text-xs font-black text-[#1a1c20]">{zones.length}</span>
            <span className="text-xs font-medium text-[#8a909e]">
              {zones.length === 1 ? "zone" : "zones"} configured
            </span>
          </div>
        </div>

        <button
          onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1c20] hover:bg-[#252830] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-black/10 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Zone
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a909e] pointer-events-none" />
        <input
          type="text"
          placeholder="Search zones…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#d0d4dc] bg-white text-sm text-[#1a1c20] placeholder-[#b0b6c2] focus:outline-none focus:ring-2 focus:ring-[#1a1c20]/10 focus:border-[#1a1c20] transition-all shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md text-[#8a909e] hover:text-[#1a1c20] hover:bg-[#f0f1f3] transition"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ── Result count ── */}
      {search && !loading && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[#8a909e]">
            {filtered.length === 0
              ? "No results for"
              : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for`}
          </span>
          <span className="text-xs font-bold text-[#1a1c20] bg-[#f0f1f3] border border-[#e2e5eb] px-2 py-0.5 rounded-lg">
            {search}
          </span>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-[#f7f8fa] border-2 border-dashed border-[#d0d4dc] rounded-2xl flex items-center justify-center mb-5">
            <MapPin className="w-6 h-6 text-[#c0c5d0]" />
          </div>
          <p className="text-sm font-bold text-[#3a3d45] mb-1.5">
            {search ? `No zones match "${search}"` : "No zones configured yet"}
          </p>
          <p className="text-xs text-[#8a909e] mb-6 max-w-xs">
            {search
              ? "Try a different search term or clear the filter."
              : "Add your first zone to start organizing your service areas."}
          </p>
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#3a3d45] bg-white border border-[#d0d4dc] rounded-xl hover:bg-[#f7f8fa] transition"
            >
              <X className="w-3.5 h-3.5" /> Clear Search
            </button>
          ) : (
            <button
              onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1c20] hover:bg-[#252830] text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Zone
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
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
