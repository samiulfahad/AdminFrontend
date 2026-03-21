import { useEffect, useState, useCallback } from "react";
import { Plus, Search, MapPin, Pencil, Trash2, X, Check, Globe } from "lucide-react";
import Modal from "../../components/modal";
import Popup from "../../components/popup";
import zoneService from "../../api/zoneService";

/* ─── Zone Form Modal ────────────────────────────────────── */

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
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <MapPin size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 tracking-tight leading-none">
                {mode === "create" ? "Add New Zone" : "Edit Zone"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {mode === "create" ? "Enter a name for the new zone" : "Update zone name"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-5">
          <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Zone Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dhaka North"
            autoFocus
            className="w-full px-3 py-2.5 text-[13.5px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10 transition-all"
          />
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-lg shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Check size={13} />
            )}
            {mode === "create" ? "Create Zone" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ─── Zone Card ──────────────────────────────────────────── */

const ZoneCard = ({ zone, index, onEdit, onDelete }) => (
  <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
      <span className="text-[11px] font-black text-slate-400">{String(index + 1).padStart(2, "0")}</span>
    </div>
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <MapPin size={13} className="text-indigo-400 shrink-0" />
      <span className="text-[13.5px] font-bold text-slate-700 tracking-tight truncate">{zone.name}</span>
    </div>
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <button
        onClick={() => onEdit(zone)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={() => onDelete(zone)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition"
      >
        <Trash2 size={13} />
      </button>
    </div>
  </div>
);

/* ─── Skeleton ───────────────────────────────────────────── */

const SkeletonCard = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white animate-pulse">
    <div className="w-8 h-8 bg-slate-100 rounded-xl shrink-0" />
    <div className="flex items-center gap-2 flex-1">
      <div className="w-3.5 h-3.5 bg-slate-100 rounded shrink-0" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────── */

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState({ open: false, mode: "create", initial: null });
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

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

  const handleDelete = (zone) =>
    showPopup("warning", `Delete "${zone.name}"? This cannot be undone.`, async () => {
      try {
        await zoneService.deleteZone(zone._id);
        showPopup("success", "Zone deleted!");
        fetchZones();
      } catch {
        showPopup("error", "Failed to delete zone.");
      }
    });

  const filtered = zones.filter((z) => z.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Globe size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Zone Management</h1>
            <p className="text-[11px] text-slate-400 mt-1">Configure delivery and service zones</p>
          </div>
        </div>
        <button
          onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all"
        >
          <Plus size={14} />
          Add Zone
        </button>
      </div>

      {/* Search card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search zones…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-[13px] text-slate-800 placeholder-slate-300 bg-transparent outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-100 text-slate-400 hover:text-slate-600 transition shrink-0 border-none cursor-pointer"
            >
              <X size={11} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/60">
          <MapPin size={11} className="text-slate-400" />
          <span className="text-[11px] text-slate-400">
            {search ? (
              <>
                <span className="font-bold text-slate-600">{filtered.length}</span> of {zones.length} match{" "}
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

      {/* List */}
      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
            <MapPin size={20} className="text-slate-300" />
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              <X size={13} />
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all"
            >
              <Plus size={13} />
              Add First Zone
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
