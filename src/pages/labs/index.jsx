import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Search,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  X,
  Building2,
  Hash,
  Layers,
  RefreshCw,
  Check,
  TrendingUp,
  Activity,
} from "lucide-react";

import Modal from "../../components/modal";
import Popup from "../../components/popup";
import labService from "../../api/labService";
import zoneService from "../../api/zoneService";

const LIMIT = 20;

const EMPTY_LAB = {
  name: "",
  labKey: "",
  isActive: true,
  contact: {
    primary: "",
    secondary: "",
    publicEmail: "",
    privateEmail: "",
    address: "",
    district: "",
    zone: "",
    zoneId: "",
  },
  billing: { perInvoiceFee: "", monthlyFee: "", commission: "" },
};

/* ─── Shared primitives ──────────────────────────────────── */

const TextInput = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
    )}
    <input
      className="w-full px-3 py-2.5 text-[13.5px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10"
      {...props}
    />
  </div>
);

const SelectInput = ({ label, children, ...props }) => (
  <div>
    {label && (
      <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
    )}
    <select
      className="w-full px-3 py-2.5 text-[13.5px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10"
      {...props}
    >
      {children}
    </select>
  </div>
);

const SwitchToggle = ({ active, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!active)}
    className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
  >
    <span
      className={`relative inline-block w-9 h-5 rounded-full transition-colors duration-200 ${active ? "bg-indigo-500" : "bg-slate-200"}`}
    >
      <span
        className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200 ${active ? "left-[19px]" : "left-[3px]"}`}
      />
    </span>
    <span className={`text-xs font-semibold ${active ? "text-indigo-600" : "text-slate-400"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  </button>
);

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border select-none ${active ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-indigo-500" : "bg-slate-300"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

/* ─── Lab Modal ──────────────────────────────────────────── */

const LAB_TABS = [
  { id: "info", label: "Info", icon: Building2, sub: "Basic details" },
  { id: "contact", label: "Contact", icon: Phone, sub: "Phone & location" },
  { id: "billing", label: "Billing", icon: CreditCard, sub: "Fees & commission" },
];

const LabModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY_LAB);
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY_LAB);
    setTab("info");
    zoneService
      .getZones()
      .then((r) => setZones(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => setZones([]));
  }, [isOpen]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setC = (k) => (e) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: e.target.value } }));
  const setB = (k) => (e) => setForm((f) => ({ ...f, billing: { ...f.billing, [k]: e.target.value } }));

  const tabIdx = LAB_TABS.findIndex((t) => t.id === tab);
  const isLast = tabIdx === LAB_TABS.length - 1;

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col min-h-full">
        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
          {/* Title row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                <FlaskConical size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 tracking-tight leading-none">Register Lab</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Step {tabIdx + 1} of {LAB_TABS.length} — {LAB_TABS[tabIdx].sub}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            >
              <X size={14} />
            </button>
          </div>

          {/* Tab pills */}
          <div className="flex gap-1.5 px-5 pb-3">
            {LAB_TABS.map(({ id, label, icon: Icon }, i) => {
              const isActive = tab === id;
              const isComplete = i < tabIdx;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-none text-xs font-semibold transition-all cursor-pointer
                    ${isActive ? "bg-indigo-50 text-indigo-700" : isComplete ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors
                    ${isActive ? "bg-indigo-500" : isComplete ? "bg-emerald-500" : "bg-slate-200"}`}
                  >
                    <Icon size={11} className="text-white" />
                  </span>
                  <span className="font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Form body — all panels rendered, show/hide via display ── */}
        <div className="flex-1 overflow-y-auto">
          {/* INFO */}
          <div className={`${tab === "info" ? "flex" : "hidden"} flex-col gap-4 p-5`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput label="Lab Name *" value={form.name} onChange={set("name")} placeholder="City Diagnostic" />
              <TextInput
                label="Lab ID (5 digits) *"
                value={form.labKey}
                onChange={(e) => setForm((f) => ({ ...f, labKey: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                placeholder="12345"
                maxLength={5}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <div>
                <p className="text-[13px] font-semibold text-slate-700 leading-none">Lab Status</p>
                <p className="text-[11px] text-slate-400 mt-1">Toggle to activate or deactivate this lab</p>
              </div>
              <SwitchToggle active={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            </div>
          </div>

          {/* CONTACT */}
          <div className={`${tab === "contact" ? "flex" : "hidden"} flex-col gap-3 p-5`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="Primary Phone"
                value={form.contact.primary}
                onChange={setC("primary")}
                placeholder="01700000000"
              />
              <TextInput
                label="Secondary Phone"
                value={form.contact.secondary}
                onChange={setC("secondary")}
                placeholder="01800000000"
              />
              <TextInput
                label="Public Email"
                type="email"
                value={form.contact.publicEmail}
                onChange={setC("publicEmail")}
                placeholder="lab@example.com"
              />
              <TextInput
                label="Private Email"
                type="email"
                value={form.contact.privateEmail}
                onChange={setC("privateEmail")}
                placeholder="private@example.com"
              />
              <TextInput
                label="District"
                value={form.contact.district}
                onChange={setC("district")}
                placeholder="Dhaka"
              />
              <SelectInput
                label="Zone"
                value={form.contact.zoneId}
                onChange={(e) => {
                  const z = zones.find((z) => z._id === e.target.value);
                  setForm((f) => ({ ...f, contact: { ...f.contact, zone: z?.name ?? "", zoneId: e.target.value } }));
                }}
              >
                <option value="">— Select zone —</option>
                {zones.map((z) => (
                  <option key={z._id} value={z._id}>
                    {z.name}
                  </option>
                ))}
              </SelectInput>
            </div>
            <TextInput
              label="Address"
              value={form.contact.address}
              onChange={setC("address")}
              placeholder="Full address"
            />
          </div>

          {/* BILLING */}
          <div className={`${tab === "billing" ? "flex" : "hidden"} flex-col gap-4 p-5`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextInput
                label="Invoice Fee (৳)"
                type="number"
                value={form.billing.perInvoiceFee}
                onChange={setB("perInvoiceFee")}
                placeholder="0"
              />
              <TextInput
                label="Monthly Fee (৳)"
                type="number"
                value={form.billing.monthlyFee}
                onChange={setB("monthlyFee")}
                placeholder="0"
              />
              <TextInput
                label="Commission (৳)"
                type="number"
                value={form.billing.commission}
                onChange={setB("commission")}
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {[
                ["Invoice", `৳${form.billing.perInvoiceFee || 0}`, "bg-indigo-50", "text-indigo-600"],
                ["Monthly", `৳${form.billing.monthlyFee || 0}`, "bg-emerald-50", "text-emerald-600"],
                ["Commission", `৳${form.billing.commission || 0}`, "bg-amber-50", "text-amber-600"],
              ].map(([l, v, bg, color]) => (
                <div key={l} className={`${bg} text-center py-4`}>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">{l}</p>
                  <p className={`text-xl font-black mt-1 tracking-tight ${color}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={() => tabIdx > 0 && setTab(LAB_TABS[tabIdx - 1].id)}
            className={`flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition bg-transparent border-none cursor-pointer ${tabIdx === 0 ? "invisible" : ""}`}
          >
            <ChevronLeft size={15} /> Back
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-lg shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 disabled:opacity-60 transition-all"
              >
                {loading && (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                Register Lab
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTab(LAB_TABS[tabIdx + 1].id)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-lg shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all"
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Stat Card ──────────────────────────────────────────── */

const STAT_VARIANTS = {
  indigo:
    "bg-indigo-50  border-indigo-100  [&_.icon]:bg-indigo-100  [&_.icon]:border-indigo-200  [&_.icon-el]:text-indigo-500  [&_.val]:text-indigo-700",
  green:
    "bg-emerald-50 border-emerald-100 [&_.icon]:bg-emerald-100 [&_.icon]:border-emerald-200 [&_.icon-el]:text-emerald-500 [&_.val]:text-emerald-700",
  slate:
    "bg-slate-50   border-slate-200   [&_.icon]:bg-slate-100   [&_.icon]:border-slate-200   [&_.icon-el]:text-slate-400   [&_.val]:text-slate-700",
  amber:
    "bg-amber-50   border-amber-100   [&_.icon]:bg-amber-100   [&_.icon]:border-amber-200   [&_.icon-el]:text-amber-500   [&_.val]:text-amber-700",
};

const StatCard = ({ icon: Icon, label, value, sub, color = "slate" }) => (
  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${STAT_VARIANTS[color]}`}>
    <div className="icon w-10 h-10 rounded-xl border flex items-center justify-center shrink-0">
      <Icon size={17} className="icon-el" />
    </div>
    <div className="min-w-0">
      <p className="val text-xl font-black leading-none tracking-tight">{value}</p>
      <p className="text-[11px] text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── Lab Row ────────────────────────────────────────────── */

const LabRow = ({ lab, index }) => (
  <div
    className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
    style={{ animationDelay: `${index * 0.03}s` }}
  >
    <div
      className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border ${lab.isActive ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"}`}
    >
      <FlaskConical size={15} className={lab.isActive ? "text-indigo-500" : "text-slate-400"} />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-[13.5px] font-bold text-slate-800 leading-snug mb-1">{lab.name}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Hash size={10} className="text-slate-300" />
          {lab.labKey}
        </span>
        {lab.contact?.primary && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Phone size={10} className="text-slate-300" />
            {lab.contact.primary}
          </span>
        )}
        {lab.contact?.publicEmail && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
            <Mail size={10} className="text-slate-300 shrink-0" />
            {lab.contact.publicEmail}
          </span>
        )}
        {(lab.contact?.address || lab.contact?.district) && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin size={10} className="text-slate-300 shrink-0" />
            {[lab.contact.address, lab.contact.district, lab.contact.zone].filter(Boolean).join(", ")}
          </span>
        )}
      </div>
    </div>

    {/* Billing chips — desktop only */}
    <div className="hidden lg:flex items-center gap-2 shrink-0">
      {[
        [`৳${lab.billing?.perInvoiceFee ?? 0}`, "Invoice"],
        [`৳${lab.billing?.monthlyFee ?? 0}`, "Monthly"],
        [`৳${lab.billing?.commission ?? 0}`, "Commission"],
      ].map(([v, l]) => (
        <div
          key={l}
          className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 min-w-[68px]"
        >
          <span className="text-[11px] font-bold text-indigo-500">{v}</span>
          <span className="text-[9px] text-slate-300 uppercase tracking-wide mt-0.5">{l}</span>
        </div>
      ))}
    </div>

    <div className="shrink-0">
      <StatusBadge active={lab.isActive} />
    </div>
  </div>
);

/* ─── Skeleton ───────────────────────────────────────────── */

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white animate-pulse">
    <div className="w-9 h-9 bg-slate-100 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-100 rounded w-2/5" />
      <div className="h-2.5 bg-slate-50 rounded w-3/5" />
    </div>
    <div className="hidden lg:flex gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-[68px] h-9 bg-slate-50 rounded-lg" />
      ))}
    </div>
    <div className="w-16 h-6 bg-slate-100 rounded-full shrink-0" />
  </div>
);

/* ─── Pagination ─────────────────────────────────────────── */

const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  const from = (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);
  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-400">
        Showing{" "}
        <strong className="text-slate-600">
          {from}–{to}
        </strong>{" "}
        of <strong className="text-slate-600">{total}</strong> labs
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition ${p === page ? "bg-gradient-to-br from-indigo-500 to-indigo-400 text-white shadow-md shadow-indigo-200 border-none" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────── */

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });
  const debounceRef = useRef(null);

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const r = await labService.getStats();
      setStats(r.data);
    } catch {
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLabs = async (p, q, opts = {}) => {
    opts.isSearch ? setSearchLoading(true) : setLoading(true);
    try {
      const res = await labService.getLabs({ page: p, limit: LIMIT, labKey: q.trim() });
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
  };

  useEffect(() => {
    fetchStats();
    fetchLabs(1, "");
  }, []);

  const handlePageChange = (p) => {
    setPage(p);
    fetchLabs(p, search);
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchLabs(1, "");
  };
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchLabs(1, val, { isSearch: true });
    }, 400);
  };

  const handleCreate = async (form) => {
    try {
      await labService.createLab({
        name: form.name,
        labKey: form.labKey,
        contact: form.contact,
        isActive: form.isActive,
        billing: {
          perInvoiceFee: Number(form.billing.perInvoiceFee),
          monthlyFee: Number(form.billing.monthlyFee),
          commission: Number(form.billing.commission),
        },
      });
      showPopup("success", "Lab registered successfully!");
      fetchStats();
      handleClearSearch();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to create lab.");
      throw err;
    }
  };

  const isSearchMode = search.trim().length > 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <FlaskConical size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Laboratories</h1>
            <p className="text-[11px] text-slate-400 mt-1">Registered labs and network overview</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all whitespace-nowrap"
        >
          <Plus size={14} /> Register Lab
        </button>
      </div>

      {/* Stats — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Layers} label="Total labs" value={statsLoading ? "—" : (stats?.total ?? 0)} color="indigo" />
        <StatCard icon={Activity} label="Active" value={statsLoading ? "—" : (stats?.active ?? 0)} color="green" />
        <StatCard
          icon={TrendingUp}
          label="Inactive"
          value={statsLoading ? "—" : (stats?.inactive ?? 0)}
          color="slate"
        />
        <StatCard
          icon={CreditCard}
          label="Monthly rev."
          value={statsLoading ? "—" : `৳${(stats?.totalMonthly ?? 0).toLocaleString()}`}
          sub={statsLoading ? undefined : `৳${(stats?.totalInvoice ?? 0).toLocaleString()} invoice`}
          color="amber"
        />
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {searchLoading ? (
              <RefreshCw size={14} className="text-indigo-500 animate-spin" />
            ) : (
              <Search size={14} className="text-slate-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search by Lab ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition-all"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none cursor-pointer"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {isSearchMode && !searchLoading && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11.5px] text-slate-500 shrink-0">
            {total === 0 ? "No results for" : `${total} result${total !== 1 ? "s" : ""} for`}
            <strong className="text-slate-700">"{search}"</strong>
            <button
              onClick={handleClearSearch}
              className="text-slate-400 hover:text-slate-600 transition bg-transparent border-none cursor-pointer flex"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Lab list */}
      <div className="flex flex-col gap-1.5">
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
        ) : labs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
              <FlaskConical size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">
              {isSearchMode ? `No labs match "${search}"` : "No labs registered yet"}
            </p>
            <p className="text-xs text-slate-400 mb-5 max-w-[260px]">
              {isSearchMode ? "Try a different Lab ID or clear the search." : "Register your first lab to get started."}
            </p>
            {isSearchMode ? (
              <button
                onClick={handleClearSearch}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <X size={13} /> Clear Search
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all"
              >
                <Plus size={14} /> Register First Lab
              </button>
            )}
          </div>
        ) : (
          labs.map((lab, i) => <LabRow key={lab._id} lab={lab} index={i} />)
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={handlePageChange} />

      <LabModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />

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
