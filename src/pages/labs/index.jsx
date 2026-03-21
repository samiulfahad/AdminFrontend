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
  labID: "",
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

const Input = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
    )}
    <input
      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 focus:bg-white transition-all placeholder-slate-300 text-slate-800"
      {...props}
    />
  </div>
);

const Btn = ({ teal, children, className = "", ...props }) => (
  <button
    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
      teal
        ? "text-teal-600 border-teal-300 hover:bg-teal-50 hover:border-teal-400"
        : "text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border select-none ${
      active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"
    }`}
  >
    <span
      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-emerald-600" : "bg-slate-300"}`}
    >
      {active ? (
        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      ) : (
        <X className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
      )}
    </span>
    {active ? "Active" : "Inactive"}
  </span>
);

const SwitchToggle = ({ active, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!active)}
    className="inline-flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
  >
    <span
      className={`relative inline-block w-[34px] h-5 rounded-full transition-colors duration-200 ${active ? "bg-emerald-600" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white transition-all duration-200 ${active ? "left-[17px]" : "left-[3px]"}`}
      />
    </span>
    <span className={`text-xs font-semibold transition-colors ${active ? "text-emerald-700" : "text-slate-400"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  </button>
);

const LAB_TABS = [
  { id: "info", label: "Info", icon: Building2, sub: "Basic details and status" },
  { id: "contact", label: "Contact", icon: Phone, sub: "Phone, email and location" },
  { id: "billing", label: "Billing", icon: CreditCard, sub: "Fees and commission" },
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
  const current = LAB_TABS[tabIdx];
  const isLast = tabIdx === LAB_TABS.length - 1;
  const goNext = () => {
    if (!isLast) setTab(LAB_TABS[tabIdx + 1].id);
  };
  const goBack = () => {
    if (tabIdx > 0) setTab(LAB_TABS[tabIdx - 1].id);
  };

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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex min-h-[420px]">
        {/* Sidebar */}
        <div className="w-44 shrink-0 flex flex-col border-r border-slate-100 bg-slate-50/60 rounded-tl-xl rounded-bl-xl">
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 leading-none">Register Lab</p>
              <p className="text-[10px] text-slate-400 mt-0.5">3 sections</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {LAB_TABS.map(({ id, label, icon: Icon }, i) => {
              const isActive = tab === id;
              const isComplete = i < tabIdx;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive ? "bg-teal-50 border border-teal-200" : "hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? "bg-teal-600" : isComplete ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    ) : (
                      <Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-slate-400"}`} />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${isActive ? "text-teal-700" : isComplete ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-400">Progress</span>
              <span className="text-[10px] font-bold text-slate-500">{tabIdx + 1}/3</span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${((tabIdx + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800 tracking-tight">{current.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{current.sub}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 px-5 py-5 overflow-y-auto">
            {/* Info tab */}
            {tab === "info" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Lab Name *" value={form.name} onChange={set("name")} placeholder="City Diagnostic" />
                  <Input
                    label="Lab ID (5 digits) *"
                    value={form.labID}
                    onChange={(e) => setForm((f) => ({ ...f, labID: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-[11px] font-semibold text-slate-400">Status</span>
                  <SwitchToggle active={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                </div>
              </div>
            )}

            {/* Contact tab */}
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
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Zone
                  </label>
                  <select
                    value={form.contact.zoneId}
                    onChange={(e) => {
                      const z = zones.find((z) => z._id === e.target.value);
                      setForm((f) => ({
                        ...f,
                        contact: { ...f.contact, zone: z?.name ?? "", zoneId: e.target.value },
                      }));
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 focus:bg-white transition-all text-slate-800"
                  >
                    <option value="">— Select zone —</option>
                    {zones.map((z) => (
                      <option key={z._id} value={z._id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
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

            {/* Billing tab */}
            {tab === "billing" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Invoice Fee (৳)"
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
                    label="Commission (৳)"
                    type="number"
                    value={form.billing.commission}
                    onChange={setB("commission")}
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                  {[
                    ["Invoice", `৳${form.billing.perInvoiceFee || 0}`],
                    ["Monthly", `৳${form.billing.monthlyFee || 0}`],
                    ["Commission", `৳${form.billing.commission || 0}`], // ← ৳ not %
                  ].map(([l, v]) => (
                    <div key={l} className="bg-slate-50 text-center py-3">
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">{l}</p>
                      <p className="text-lg font-black text-teal-600 mt-0.5 tracking-tight">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={goBack}
              className={`flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition ${tabIdx === 0 ? "invisible" : ""}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="flex gap-2">
              <Btn type="button" onClick={onClose}>
                Cancel
              </Btn>
              {isLast ? (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-md hover:bg-teal-50 disabled:opacity-50 transition-all"
                >
                  {loading && (
                    <div className="w-3.5 h-3.5 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                  )}
                  Register Lab
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-md hover:bg-teal-50 transition-all"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => {
  const colors = {
    teal: { bg: "bg-teal-50", border: "border-teal-100", icon: "text-teal-500", val: "text-teal-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-500", val: "text-emerald-700" },
    slate: { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-400", val: "text-slate-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-500", val: "text-amber-700" },
  };
  const c = colors[color] ?? colors.slate;
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${c.bg} ${c.border}`}>
      <div className={`w-8 h-8 rounded-lg bg-white border ${c.border} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-lg font-black leading-none ${c.val}`}>{value}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const LabRow = ({ lab }) => (
  <div className="group flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-teal-200 hover:bg-teal-50/20 transition-all">
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${lab.isActive ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-200"}`}
    >
      <FlaskConical className={`w-4 h-4 ${lab.isActive ? "text-teal-600" : "text-slate-400"}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-700 truncate leading-tight">{lab.name}</p>
      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
        <span className="flex items-center gap-1">
          <Hash className="w-2.5 h-2.5 text-slate-300 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400">{lab.labID}</span>
        </span>
        {lab.contact?.primary && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Phone className="w-2.5 h-2.5 text-slate-300 shrink-0" />
            {lab.contact.primary}
          </span>
        )}
        {lab.contact?.publicEmail && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
            <Mail className="w-2.5 h-2.5 text-slate-300 shrink-0" />
            {lab.contact.publicEmail}
          </span>
        )}
        {(lab.contact?.address || lab.contact?.district) && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
            <MapPin className="w-2.5 h-2.5 text-slate-300 shrink-0" />
            {[lab.contact.address, lab.contact.district, lab.contact.zone].filter(Boolean).join(", ")}
          </span>
        )}
      </div>
    </div>
    <div className="hidden lg:flex items-center gap-1 shrink-0">
      {[
        [`৳${lab.billing?.perInvoiceFee ?? 0}`, "Invoice"],
        [`৳${lab.billing?.monthlyFee ?? 0}`, "Monthly"],
        [`৳${lab.billing?.commission ?? 0}`, "Commission"], // ← ৳ not %
      ].map(([v, l]) => (
        <div
          key={l}
          className="flex flex-col items-center px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 min-w-[72px]"
        >
          <span className="text-[10px] font-bold text-teal-600">{v}</span>
          <span className="text-[9px] text-slate-300 uppercase tracking-wide">{l}</span>
        </div>
      ))}
    </div>
    <div className="shrink-0 ml-auto">
      <StatusBadge active={lab.isActive} />
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 bg-white animate-pulse">
    <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
    <div className="w-48 space-y-1.5 shrink-0">
      <div className="h-3 bg-slate-100 rounded w-3/4" />
      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
    </div>
    <div className="flex gap-4 flex-1">
      <div className="h-2.5 bg-slate-100 rounded w-24" />
      <div className="h-2.5 bg-slate-100 rounded w-32" />
    </div>
    <div className="hidden lg:flex gap-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-[52px] h-8 bg-slate-100 rounded-lg" />
      ))}
    </div>
    <div className="w-16 h-6 bg-slate-100 rounded-full ml-auto shrink-0" />
  </div>
);

const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  const from = (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-400">
        Showing{" "}
        <span className="font-bold text-slate-600">
          {from}–{to}
        </span>{" "}
        of <span className="font-bold text-slate-600">{total}</span> labs
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
              p === page ? "bg-teal-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

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
      // non-critical — fail silently
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLabs = async (p, q, opts = {}) => {
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
  };

  useEffect(() => {
    fetchStats();
    fetchLabs(1, "");
  }, []);

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
      fetchStats();
      handleClearSearch();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to create lab.");
      throw err;
    }
  };

  const isSearchMode = search.trim().length > 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Laboratories</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered labs and network overview</p>
          </div>
        </div>
        <Btn teal onClick={() => setModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          Register Lab
        </Btn>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Layers} label="Total labs" value={statsLoading ? "—" : (stats?.total ?? 0)} color="teal" />
        <StatCard icon={Activity} label="Active" value={statsLoading ? "—" : (stats?.active ?? 0)} color="emerald" />
        <StatCard
          icon={TrendingUp}
          label="Inactive"
          value={statsLoading ? "—" : (stats?.inactive ?? 0)}
          color="slate"
        />
        <StatCard
          icon={CreditCard}
          label="Monthly revenue"
          color="amber"
          value={statsLoading ? "—" : `৳${(stats?.totalMonthly ?? 0).toLocaleString()}`}
          sub={statsLoading ? undefined : `৳${(stats?.totalInvoice ?? 0).toLocaleString()} invoice`}
        />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {searchLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-teal-500 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search by Lab ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-all"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {isSearchMode && !searchLoading && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 shrink-0">
            {total === 0 ? "No results for" : `${total} result${total !== 1 ? "s" : ""} for`}
            <span className="font-bold text-slate-700">"{search}"</span>
            <button onClick={handleClearSearch} className="ml-0.5 text-slate-400 hover:text-slate-600 transition">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
        ) : labs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-11 h-11 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center mb-3">
              <FlaskConical className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">
              {isSearchMode ? `No labs match "${search}"` : "No labs registered yet"}
            </p>
            <p className="text-xs text-slate-400 mb-5 max-w-xs">
              {isSearchMode ? "Try a different Lab ID or clear the search." : "Register your first lab to get started."}
            </p>
            {isSearchMode ? (
              <Btn onClick={handleClearSearch}>
                <X className="w-3.5 h-3.5" />
                Clear Search
              </Btn>
            ) : (
              <Btn teal onClick={() => setModalOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                Register First Lab
              </Btn>
            )}
          </div>
        ) : (
          labs.map((lab) => <LabRow key={lab._id} lab={lab} />)
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
