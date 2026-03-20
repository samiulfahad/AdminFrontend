import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  X,
  Building2,
  Hash,
  Activity,
  TrendingUp,
  Layers,
  RefreshCw,
} from "lucide-react";

import Modal from "../../components/modal";
import Popup from "../../components/popup";
import labService from "../../api/labService";
import zoneService from "../../api/zoneService";

// ── Constants ─────────────────────────────────────────────────────────────────
const LIMIT = 10;

const EMPTY_LAB = {
  name: "",
  labID: "",
  isActive: true,
  contact: { primary: "", secondary: "", publicEmail: "", privateEmail: "", address: "", district: "", zone: "" },
  billing: { perInvoiceFee: "", monthlyFee: "", commission: "" },
};

// ── Primitives ────────────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-[10px] font-bold text-[#4a5060] uppercase tracking-widest mb-1.5">{label}</label>
    )}
    <input
      className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#d0d4dc] bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#1a1c20]/10 focus:border-[#1a1c20] focus:bg-white transition-all placeholder-[#b0b6c2] text-[#1a1c20]"
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder }) => (
  <div>
    {label && (
      <label className="block text-[10px] font-bold text-[#4a5060] uppercase tracking-widest mb-1.5">{label}</label>
    )}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#d0d4dc] bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#1a1c20]/10 focus:border-[#1a1c20] focus:bg-white transition-all text-[#1a1c20]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

// ── Lab Form Modal ────────────────────────────────────────────────────────────
const LabModal = ({ isOpen, onClose, onSubmit, initial, mode }) => {
  const [form, setForm] = useState(EMPTY_LAB);
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      initial
        ? {
            ...initial,
            billing: {
              perInvoiceFee: initial.billing?.perInvoiceFee ?? "",
              monthlyFee: initial.billing?.monthlyFee ?? "",
              commission: initial.billing?.commission ?? "",
            },
          }
        : EMPTY_LAB,
    );
    setTab("info");
    zoneService
      .getZones()
      .then((r) => setZones((Array.isArray(r.data) ? r.data : (r.data?.data ?? [])).map((z) => z.name)))
      .catch(() => setZones([]));
  }, [isOpen, initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setC = (k) => (e) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: e.target.value } }));
  const setB = (k) => (e) => setForm((f) => ({ ...f, billing: { ...f.billing, [k]: e.target.value } }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "info", label: "Info", icon: Building2 },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={submit}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8eaed]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1a1c20] rounded-xl flex items-center justify-center shadow-sm">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#1a1c20] text-sm tracking-tight">
                {mode === "create" ? "Register New Lab" : "Edit Lab"}
              </p>
              <p className="text-[11px] text-[#8a909e]">
                {mode === "create" ? "Complete all sections below" : "Update lab information"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8a909e] hover:bg-[#f0f1f3] hover:text-[#1a1c20] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === id
                  ? "bg-[#1a1c20] text-white shadow-sm"
                  : "text-[#6a707e] hover:text-[#1a1c20] hover:bg-[#f0f1f3]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-5 min-h-[260px]">
          {tab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Lab Name *"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="City Diagnostic"
                  required
                />
                {mode === "create" ? (
                  <Input
                    label="Lab ID (5 digits) *"
                    value={form.labID}
                    onChange={(e) => setForm((f) => ({ ...f, labID: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                    placeholder="12345"
                    required
                    maxLength={5}
                  />
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-[#4a5060] uppercase tracking-widest mb-1.5">
                      Lab ID{" "}
                      <span className="normal-case font-normal tracking-normal text-[#b0b6c2]">
                        (cannot be changed)
                      </span>
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#e2e5eb] bg-[#f0f1f3] cursor-not-allowed">
                      <Hash className="w-3.5 h-3.5 text-[#b0b6c2] shrink-0" />
                      <span className="text-sm font-mono font-bold text-[#8a909e] tracking-widest">{form.labID}</span>
                      <span className="ml-auto text-[10px] font-semibold text-[#b0b6c2] uppercase tracking-wider">
                        Locked
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4a5060] uppercase tracking-widest mb-1.5">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    form.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-[#f0f1f3] text-[#6a707e] border-[#e2e5eb]"
                  }`}
                >
                  {form.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {form.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          )}
          {tab === "contact" && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Primary Phone"
                value={form.contact.primary}
                onChange={setC("primary")}
                placeholder="01700000000"
              />
              <Input
                label="Secondary Phone"
                value={form.contact.secondary}
                onChange={setC("secondary")}
                placeholder="01800000000"
              />
              <Input
                label="Public Email"
                type="email"
                value={form.contact.publicEmail}
                onChange={setC("publicEmail")}
                placeholder="lab@example.com"
              />
              <Input
                label="Private Email"
                type="email"
                value={form.contact.privateEmail}
                onChange={setC("privateEmail")}
                placeholder="private@example.com"
              />
              <Input label="District" value={form.contact.district} onChange={setC("district")} placeholder="Dhaka" />
              <Select
                label="Zone"
                value={form.contact.zone}
                onChange={setC("zone")}
                options={zones}
                placeholder="— Select zone —"
              />
              <div className="col-span-2">
                <Input
                  label="Address"
                  value={form.contact.address}
                  onChange={setC("address")}
                  placeholder="Full address"
                />
              </div>
            </div>
          )}
          {tab === "billing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Per Invoice Fee (৳)"
                  type="number"
                  value={form.billing.perInvoiceFee}
                  onChange={setB("perInvoiceFee")}
                  placeholder="0"
                />
                <Input
                  label="Monthly Fee (৳)"
                  type="number"
                  value={form.billing.monthlyFee}
                  onChange={setB("monthlyFee")}
                  placeholder="0"
                />
                <Input
                  label="Commission (%)"
                  type="number"
                  value={form.billing.commission}
                  onChange={setB("commission")}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#f0f1f3] rounded-xl border border-[#e2e5eb]">
                {[
                  { label: "Per Invoice", value: `৳${form.billing.perInvoiceFee || 0}` },
                  { label: "Monthly", value: `৳${form.billing.monthlyFee || 0}` },
                  { label: "Commission", value: `${form.billing.commission || 0}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-[9px] text-[#6a707e] font-bold uppercase tracking-widest">{label}</p>
                    <p className="text-xl font-black text-[#1a1c20] mt-1 tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8eaed] bg-[#f7f8fa]/60 rounded-b-xl">
          <div className="flex gap-1">
            {tabs.map(({ id }) => (
              <div
                key={id}
                className={`h-1 rounded-full transition-all ${tab === id ? "w-6 bg-[#1a1c20]" : "w-1.5 bg-[#e2e5eb]"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#3a3d45] bg-white border border-[#d0d4dc] rounded-lg hover:bg-[#f7f8fa] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1a1c20] hover:bg-[#252830] rounded-lg disabled:opacity-60 transition flex items-center gap-2 shadow-sm"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {mode === "create" ? "Register Lab" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// ── Lab Card ──────────────────────────────────────────────────────────────────
const LabCard = ({ lab, onEdit, onDelete, onToggleStatus }) => (
  <div className="group relative bg-white border border-[#e2e5eb] rounded-2xl overflow-hidden hover:border-[#c8ccd4] hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
    {/* Top accent bar */}
    <div className={`h-0.5 w-full ${lab.isActive ? "bg-[#1a1c20]" : "bg-[#e2e5eb]"}`} />
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              lab.isActive ? "bg-[#1a1c20]" : "bg-[#f0f1f3] border border-[#e2e5eb]"
            }`}
          >
            <FlaskConical className={`w-4 h-4 ${lab.isActive ? "text-white" : "text-[#8a909e]"}`} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#1a1c20] text-sm truncate leading-tight tracking-tight">{lab.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Hash className="w-2.5 h-2.5 text-[#b0b6c2] shrink-0" />
              <span className="text-[11px] text-[#8a909e] font-mono font-semibold tracking-wider">{lab.labID}</span>
            </div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
            lab.isActive
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-[#f0f1f3] text-[#8a909e] border border-[#e2e5eb]"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${lab.isActive ? "bg-emerald-400" : "bg-[#c0c5d0]"}`} />
          {lab.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Contact */}
      <div className="space-y-1.5 mb-4 min-h-[52px]">
        {lab.contact?.primary && (
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-[#b0b6c2] shrink-0" />
            <span className="text-xs text-[#6a707e] truncate">{lab.contact.primary}</span>
          </div>
        )}
        {lab.contact?.publicEmail && (
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-[#b0b6c2] shrink-0" />
            <span className="text-xs text-[#6a707e] truncate">{lab.contact.publicEmail}</span>
          </div>
        )}
        {(lab.contact?.district || lab.contact?.zone) && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-[#b0b6c2] shrink-0" />
            <span className="text-xs text-[#6a707e] truncate">
              {[lab.contact.district, lab.contact.zone].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}
        {!lab.contact?.primary && !lab.contact?.publicEmail && !lab.contact?.district && (
          <p className="text-xs text-[#c0c5d0] italic">No contact info</p>
        )}
      </div>

      {/* Billing strip */}
      <div className="grid grid-cols-3 gap-px bg-[#e2e5eb] rounded-xl overflow-hidden border border-[#e2e5eb] mb-4">
        {[
          { label: "Invoice", value: `৳${lab.billing?.perInvoiceFee ?? 0}` },
          { label: "Monthly", value: `৳${lab.billing?.monthlyFee ?? 0}` },
          { label: "Comm.", value: `${lab.billing?.commission ?? 0}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#f7f8fa] text-center py-2.5 px-1">
            <p className="text-[9px] text-[#8a909e] font-bold uppercase tracking-widest">{label}</p>
            <p className="text-xs font-black text-[#1a1c20] mt-0.5 tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onEdit(lab)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-[#1a1c20] bg-[#f0f1f3] hover:bg-[#e5e7eb] border border-[#d8dce4] transition"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onToggleStatus(lab)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition ${
            lab.isActive
              ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100 hover:border-amber-200"
              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100 hover:border-emerald-200"
          }`}
        >
          {lab.isActive ? <ToggleLeft className="w-3 h-3" /> : <ToggleRight className="w-3 h-3" />}
          {lab.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onDelete(lab)}
          title="Delete"
          className="w-9 flex items-center justify-center rounded-lg text-red-400 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-[#e2e5eb] rounded-2xl overflow-hidden animate-pulse">
    <div className="h-0.5 bg-[#e2e5eb]" />
    <div className="p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 bg-[#f0f1f3] rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 bg-[#f0f1f3] rounded-md w-3/5" />
          <div className="h-2.5 bg-[#f0f1f3] rounded-md w-1/4" />
        </div>
        <div className="w-16 h-6 bg-[#f0f1f3] rounded-full shrink-0" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-2.5 bg-[#f0f1f3] rounded-md w-2/5" />
        <div className="h-2.5 bg-[#f0f1f3] rounded-md w-3/5" />
        <div className="h-2.5 bg-[#f0f1f3] rounded-md w-2/5" />
      </div>
      <div className="grid grid-cols-3 gap-px bg-[#e2e5eb] rounded-xl overflow-hidden mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#f7f8fa] py-3 space-y-1.5">
            <div className="h-2 bg-[#f0f1f3] rounded mx-auto w-3/4" />
            <div className="h-3 bg-[#f0f1f3] rounded mx-auto w-1/2" />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 h-8 bg-[#f0f1f3] rounded-lg" />
        <div className="flex-1 h-8 bg-[#f0f1f3] rounded-lg" />
        <div className="w-9 h-8 bg-[#f0f1f3] rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Stat Chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ icon: Icon, label, value, color }) => {
  const colors = {
    slate: "bg-[#f0f1f3] border-[#e2e5eb] text-[#3a3d45]",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-600",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${colors[color]}`}>
      <Icon className="w-3.5 h-3.5 opacity-60" />
      <span className="text-sm font-black tracking-tight">{value}</span>
      <span className="text-xs font-medium opacity-60">{label}</span>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  const from = (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  return (
    <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#e8eaed]">
      <p className="text-xs text-[#8a909e]">
        Showing{" "}
        <span className="font-bold text-[#1a1c20]">
          {from}–{to}
        </span>{" "}
        of <span className="font-bold text-[#1a1c20]">{total}</span> labs
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#d0d4dc] text-[#6a707e] hover:bg-[#f0f1f3] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
              p === page
                ? "bg-[#1a1c20] text-white shadow-sm"
                : "border border-[#d0d4dc] text-[#6a707e] hover:bg-[#f0f1f3]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#d0d4dc] text-[#6a707e] hover:bg-[#f0f1f3] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formModal, setFormModal] = useState({ open: false, mode: "create", initial: null });
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });
  const debounceRef = useRef(null);

  const fetchLabs = useCallback(async (p, q, opts = {}) => {
    opts.isSearch ? setSearchLoading(true) : setLoading(true);
    try {
      const res = await labService.getLabs({ page: p, limit: LIMIT, labID: q.trim() });
      const d = res.data;
      setLabs(Array.isArray(d) ? d : (d.data ?? []));
      setTotal(Array.isArray(d) ? d.length : (d.total ?? 0));
      setTotalPages(Array.isArray(d) ? 1 : (d.totalPages ?? 1));
    } catch {
      showPopup("error", "Failed to load labs.");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs(1, "");
  }, [fetchLabs]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchLabs(p, search);
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchLabs(1, val, { isSearch: true });
    }, 400);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchLabs(1, "");
  };

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

  const handleCreate = async (form) => {
    try {
      await labService.createLab({
        name: form.name,
        labID: form.labID,
        contact: form.contact,
        isActive: form.isActive,
        billing: {
          perInvoiceFee: Number(form.billing.perInvoiceFee),
          monthlyFee: Number(form.billing.monthlyFee),
          commission: Number(form.billing.commission),
        },
      });
      showPopup("success", "Lab registered successfully!");
      handleClearSearch();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to create lab.");
      throw err;
    }
  };

  const handleEdit = async (form) => {
    const id = formModal.initial._id;
    try {
      await Promise.all([
        labService.updateLab(id, { name: form.name }),
        labService.updateLabContact(id, form.contact),
        labService.updateLabBilling(id, {
          perInvoiceFee: Number(form.billing.perInvoiceFee),
          monthlyFee: Number(form.billing.monthlyFee),
          commission: Number(form.billing.commission),
        }),
      ]);
      showPopup("success", "Lab updated successfully!");
      fetchLabs(page, search);
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to update lab.");
      throw err;
    }
  };

  const handleToggleStatus = (lab) =>
    showPopup("warning", `${lab.isActive ? "Deactivate" : "Activate"} "${lab.name}"?`, async () => {
      try {
        lab.isActive ? await labService.deactivateLab(lab._id) : await labService.activateLab(lab._id);
        showPopup("success", `Lab ${lab.isActive ? "deactivated" : "activated"}!`);
        fetchLabs(page, search);
      } catch {
        showPopup("error", "Failed to update status.");
      }
    });

  const handleDelete = (lab) =>
    showPopup("warning", `Delete "${lab.name}"? This cannot be undone.`, async () => {
      try {
        await labService.deleteLab(lab._id);
        showPopup("success", "Lab deleted!");
        const newPage = labs.length === 1 && page > 1 ? page - 1 : page;
        setPage(newPage);
        fetchLabs(newPage, search);
      } catch {
        showPopup("error", "Failed to delete lab.");
      }
    });

  const activeCount = labs.filter((l) => l.isActive).length;
  const isSearchMode = search.trim().length > 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1a1c20] rounded-2xl flex items-center justify-center shadow-md shadow-black/10">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1a1c20] tracking-tight leading-none">Laboratory Management</h1>
              <p className="text-xs text-[#8a909e] mt-0.5">Manage and monitor all registered labs</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-0.5">
            <StatChip icon={Layers} label="Total" value={total} color="slate" />
            <StatChip icon={Activity} label="Active" value={activeCount} color="emerald" />
            <StatChip icon={TrendingUp} label="Inactive" value={total - activeCount} color="rose" />
          </div>
        </div>

        <button
          onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1c20] hover:bg-[#252830] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-black/10 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Lab
        </button>
      </div>

      {/* ── Search ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {searchLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#6a707e] animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-[#8a909e]" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search by Lab ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#d0d4dc] bg-white text-sm text-[#1a1c20] placeholder-[#b0b6c2] focus:outline-none focus:ring-2 focus:ring-[#1a1c20]/10 focus:border-[#1a1c20] transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md text-[#8a909e] hover:text-[#1a1c20] hover:bg-[#f0f1f3] transition"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {isSearchMode && !searchLoading && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f1f3] border border-[#e2e5eb] rounded-xl">
            <span className="text-xs text-[#6a707e] font-medium">
              {total === 0 ? "No results for" : `${total} result${total !== 1 ? "s" : ""} for`}
            </span>
            <span className="text-xs font-bold text-[#1a1c20] bg-white border border-[#d0d4dc] px-2 py-0.5 rounded-lg">
              {search}
            </span>
            <button onClick={handleClearSearch} className="text-[#8a909e] hover:text-[#1a1c20] transition ml-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : labs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#f7f8fa] border-2 border-dashed border-[#d0d4dc] rounded-2xl flex items-center justify-center mb-5">
            <FlaskConical className="w-7 h-7 text-[#c0c5d0]" />
          </div>
          <p className="text-sm font-bold text-[#3a3d45] mb-1.5">
            {isSearchMode ? `No labs match "${search}"` : "No labs registered yet"}
          </p>
          <p className="text-xs text-[#8a909e] mb-6 max-w-xs">
            {isSearchMode
              ? "Try a different Lab ID or clear the search to see all labs."
              : "Register your first lab to start managing your laboratory network."}
          </p>
          {isSearchMode ? (
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#3a3d45] bg-white border border-[#d0d4dc] rounded-xl hover:bg-[#f7f8fa] transition"
            >
              <X className="w-3.5 h-3.5" /> Clear Search
            </button>
          ) : (
            <button
              onClick={() => setFormModal({ open: true, mode: "create", initial: null })}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1c20] hover:bg-[#252830] text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Register First Lab
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {labs.map((lab) => (
            <LabCard
              key={lab._id}
              lab={lab}
              onEdit={(l) => setFormModal({ open: true, mode: "edit", initial: l })}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={handlePageChange} />

      <LabModal
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
          confirmText="Yes, proceed"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default Labs;
