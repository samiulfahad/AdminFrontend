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
  TrendingUp,
  Activity,
  Pencil,
  Users,
  ShieldCheck,
  UserCog,
  Headset,
  Trash2,
  PowerOff,
  Power,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

import Modal from "../../components/modal";
import Popup from "../../components/popup";
import labService from "../../api/labService";
import zoneService from "../../api/zoneService";
import staffService from "../../api/staffService";

const LIMIT = 20;

const EMPTY_LAB = {
  name: "",
  labKey: "",
  type: "",
  registrationNumber: "",
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

const EMPTY_STAFF = {
  name: "",
  phone: "",
  email: "",
  password: "",
  role: "staff",
  isActive: true,
  permissions: {
    createInvoice: false,
    editInvoice: false,
    deleteInvoice: false,
    cashmemo: false,
    uploadReport: false,
    downloadReport: false,
  },
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

const PasswordInput = ({ label, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && (
        <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      )}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full px-3 py-2.5 pr-10 text-[13.5px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
};

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

const PermissionToggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
    <div
      onClick={() => onChange(!checked)}
      className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all cursor-pointer shrink-0
        ${checked ? "bg-indigo-500 border-indigo-500" : "bg-white border-slate-300 group-hover:border-indigo-300"}`}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <span className="text-[12.5px] text-slate-600 font-medium">{label}</span>
  </label>
);

/* ─── Lab Type Badge ─────────────────────────────────────── */

const LAB_TYPE_META = {
  diagnostic: {
    label: "Diagnostic",
    icon: FlaskConical,
    color: "bg-indigo-50 text-indigo-500 border-indigo-200",
  },
  hospital: {
    label: "Hospital",
    icon: Building2,
    color: "bg-rose-50 text-rose-500 border-rose-200",
  },
};

const LabTypeBadge = ({ type }) => {
  if (!type) return null;
  const meta = LAB_TYPE_META[type];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold border ${meta.color}`}
    >
      <Icon size={9} />
      {meta.label}
    </span>
  );
};

/* ─── Lab Modal (Create + Edit) ──────────────────────────── */

const LAB_TABS = [
  { id: "info", label: "Info", icon: Building2, sub: "Basic details" },
  { id: "contact", label: "Contact", icon: Phone, sub: "Phone & location" },
  { id: "billing", label: "Billing", icon: CreditCard, sub: "Fees & commission" },
];

const LAB_TYPE_OPTIONS = [
  { value: "diagnostic", label: "Diagnostic Center", icon: FlaskConical },
  { value: "hospital", label: "Hospital", icon: Building2 },
];

const LabModal = ({ isOpen, onClose, onSubmit, editLab = null }) => {
  const isEdit = !!editLab;
  const [form, setForm] = useState(EMPTY_LAB);
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setTab("info");
    if (isEdit) {
      setForm({
        name: editLab.name ?? "",
        labKey: editLab.labKey ?? "",
        type: editLab.type ?? "",
        registrationNumber: editLab.registrationNumber ?? "",
        isActive: editLab.isActive ?? true,
        contact: {
          primary: editLab.contact?.primary ?? "",
          secondary: editLab.contact?.secondary ?? "",
          publicEmail: editLab.contact?.publicEmail ?? "",
          privateEmail: editLab.contact?.privateEmail ?? "",
          address: editLab.contact?.address ?? "",
          district: editLab.contact?.district ?? "",
          zone: editLab.contact?.zone ?? "",
          zoneId: editLab.contact?.zoneId ?? "",
        },
        billing: {
          perInvoiceFee: editLab.billing?.perInvoiceFee ?? "",
          monthlyFee: editLab.billing?.monthlyFee ?? "",
          commission: editLab.billing?.commission ?? "",
        },
      });
    } else {
      setForm(EMPTY_LAB);
    }
    zoneService
      .getZones()
      .then((r) => setZones(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => setZones([]));
  }, [isOpen, editLab]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setC = (k) => (e) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: e.target.value } }));
  const setB = (k) => (e) => setForm((f) => ({ ...f, billing: { ...f.billing, [k]: e.target.value } }));

  const tabIdx = LAB_TABS.findIndex((t) => t.id === tab);
  const isLast = tabIdx === LAB_TABS.length - 1;

  const handleSubmit = async () => {
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
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                {isEdit ? (
                  <Pencil size={15} className="text-white" />
                ) : (
                  <FlaskConical size={16} className="text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 tracking-tight leading-none">
                  {isEdit ? `Edit — ${editLab.name}` : "Register Lab"}
                </p>
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

        {/* Form body */}
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
                disabled={isEdit}
              />
            </div>

            {isEdit && (
              <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                Lab ID cannot be changed after creation.
              </p>
            )}

            {/* Lab Type */}
            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Lab Type <span className="normal-case font-normal text-slate-300">(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LAB_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const isSelected = form.type === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: f.type === value ? "" : value }))}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[12.5px] font-semibold transition-all cursor-pointer
                        ${
                          isSelected
                            ? value === "hospital"
                              ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                              : "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500"
                        }`}
                    >
                      <Icon
                        size={14}
                        className={
                          isSelected ? (value === "hospital" ? "text-rose-500" : "text-indigo-500") : "text-slate-300"
                        }
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Registration Number */}
            <TextInput
              label="Registration Number"
              value={form.registrationNumber}
              onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
              placeholder="Optional — e.g. DGDA-2024-00123"
            />

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

        {/* Sticky footer */}
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
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-lg shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 disabled:opacity-60 transition-all"
              >
                {loading && (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                {isEdit ? "Save Changes" : "Register Lab"}
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

/* ─── Staff Modal ────────────────────────────────────────── */

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { value: "staff", label: "Staff Member", icon: UserCog, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "support", label: "Support Admin", icon: Headset, color: "text-amber-600 bg-amber-50 border-amber-200" },
];

const PERM_LABELS = {
  createInvoice: "Create Invoice",
  editInvoice: "Edit Invoice",
  deleteInvoice: "Delete Invoice",
  cashmemo: "Cash Memo",
  uploadReport: "Upload Report",
  downloadReport: "Download Report",
};

const StaffModal = ({ isOpen, onClose, onSubmit, editStaff = null, labId }) => {
  const isEdit = !!editStaff;
  const [form, setForm] = useState({ ...EMPTY_STAFF });
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      setForm({
        name: editStaff.name ?? "",
        phone: editStaff.phone ?? "",
        email: editStaff.email ?? "",
        password: "",
        role: editStaff.role ?? "staff",
        isActive: editStaff.isActive ?? true,
        permissions: { ...EMPTY_STAFF.permissions, ...(editStaff.permissions ?? {}) },
      });
      setShowPasswordField(false);
    } else {
      setForm({ ...EMPTY_STAFF });
      setShowPasswordField(true);
    }
  }, [isOpen, editStaff]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const togglePerm = (k) => (v) => setForm((f) => ({ ...f, permissions: { ...f.permissions, [k]: v } }));
  const allPerms = Object.values(form.permissions).every(Boolean);
  const toggleAll = () => {
    const next = !allPerms;
    setForm((f) => ({ ...f, permissions: Object.fromEntries(Object.keys(f.permissions).map((k) => [k, next])) }));
  };

  const isSupportRole = form.role === "support";

  const handleSubmit = async () => {
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
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center shadow-md shadow-violet-200 shrink-0">
              <Users size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 tracking-tight leading-none">
                {isEdit ? "Edit Staff Member" : "Add Staff Member"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{isEdit ? editStaff.name : "Fill in the details below"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[60vh]">
          {!isEdit && (
            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Role *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer
                      ${form.role === value ? color + " shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSupportRole && !isEdit ? (
            <PasswordInput
              label="Password *"
              value={form.password}
              onChange={set("password")}
              placeholder="Min 6 characters"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label="Full Name *" value={form.name} onChange={set("name")} placeholder="Dr. Ahmed" />
                <TextInput label="Phone *" value={form.phone} onChange={set("phone")} placeholder="01700000000" />
                <TextInput
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="optional"
                />
                {!isEdit || showPasswordField ? (
                  <PasswordInput
                    label={isEdit ? "New Password" : "Password *"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min 6 characters"
                  />
                ) : (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setShowPasswordField(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 border border-slate-200 bg-white rounded-xl px-3 py-2.5 hover:bg-slate-50 transition w-full justify-center"
                    >
                      <KeyRound size={12} /> Change Password
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-[13px] font-semibold text-slate-700 leading-none">Status</p>
                  <p className="text-[11px] text-slate-400 mt-1">Active or inactive</p>
                </div>
                <SwitchToggle active={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </div>

              {(form.role === "staff" || (isEdit && editStaff?.role === "staff")) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
                      Permissions
                    </label>
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="text-[10.5px] font-semibold text-indigo-500 hover:text-indigo-700 transition bg-transparent border-none cursor-pointer"
                    >
                      {allPerms ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50">
                    {Object.entries(PERM_LABELS).map(([k, label]) => (
                      <PermissionToggle key={k} label={label} checked={form.permissions[k]} onChange={togglePerm(k)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-br from-violet-500 to-violet-400 rounded-lg shadow-md shadow-violet-200 hover:from-violet-600 hover:to-violet-500 disabled:opacity-60 transition-all"
          >
            {loading && (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {isEdit ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Staff Panel ────────────────────────────────────────── */

const ROLE_META = {
  admin: { label: "Admin", icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  staff: { label: "Staff", icon: UserCog, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  supportAdmin: { label: "Support", icon: Headset, color: "text-amber-600 bg-amber-50 border-amber-200" },
};

const StaffPanel = ({ lab, onClose, showPopup }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffModal, setStaffModal] = useState({ open: false, edit: null });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const r = await staffService.getAll(lab._id);
      setStaffList(Array.isArray(r.data) ? r.data : []);
    } catch {
      showPopup("error", "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [lab._id]);

  const handleStaffSubmit = async (form) => {
    try {
      if (staffModal.edit) {
        const updates = {};
        if (form.name) updates.name = form.name;
        if (form.phone) updates.phone = form.phone;
        if (form.email) updates.email = form.email;
        if (form.password) updates.password = form.password;
        if (form.permissions) updates.permissions = form.permissions;
        updates.isActive = form.isActive;

        if (staffModal.edit.role === "supportAdmin") {
          if (form.password) await staffService.updateSupportPassword(lab._id, { password: form.password });
        } else {
          await staffService.update(lab._id, staffModal.edit._id, updates);
        }
        showPopup("success", "Staff member updated.");
      } else {
        if (form.role === "admin") {
          await staffService.createAdmin(lab._id, {
            name: form.name,
            phone: form.phone,
            email: form.email || undefined,
            password: form.password,
            isActive: form.isActive,
          });
        } else if (form.role === "support") {
          await staffService.createSupport(lab._id, { password: form.password });
        } else {
          await staffService.createMember(lab._id, {
            name: form.name,
            phone: form.phone,
            email: form.email || undefined,
            password: form.password,
            permissions: form.permissions,
            isActive: form.isActive,
          });
        }
        showPopup("success", "Staff member added.");
      }
      fetchStaff();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Operation failed.");
      throw err;
    }
  };

  const handleToggleActive = async (member) => {
    try {
      if (member.isActive) {
        await staffService.deactivate(lab._id, member._id);
      } else {
        await staffService.activate(lab._id, member._id);
      }
      fetchStaff();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelete = (member) => {
    showPopup("confirm", `Delete "${member.name}"? This action cannot be undone.`, async () => {
      try {
        if (member.role === "supportAdmin") {
          await staffService.deleteSupport(lab._id);
        } else {
          await staffService.delete(lab._id, member._id);
        }
        showPopup("success", "Staff member removed.");
        fetchStaff();
      } catch (err) {
        showPopup("error", err?.response?.data?.message || "Failed to delete.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center shadow-md shadow-violet-200 shrink-0">
            <Users size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">Staff — {lab.name}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {staffList.length} member{staffList.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStaffModal({ open: true, edit: null })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-br from-violet-500 to-violet-400 rounded-lg shadow-sm shadow-violet-200 hover:from-violet-600 hover:to-violet-500 transition-all"
          >
            <Plus size={12} /> Add
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white animate-pulse"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-2/5" />
                <div className="h-2.5 bg-slate-50 rounded w-3/5" />
              </div>
            </div>
          ))
        ) : staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
              <Users size={18} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">No staff yet</p>
            <p className="text-xs text-slate-400">Add an admin or staff member to get started.</p>
          </div>
        ) : (
          staffList.map((member) => {
            const meta = ROLE_META[member.role] ?? ROLE_META.staff;
            const Icon = meta.icon;
            return (
              <div
                key={member._id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.color}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-slate-800 leading-none">{member.name}</p>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold border ${meta.color}`}>
                      {meta.label}
                    </span>
                    {!member.isActive && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold border bg-slate-50 text-slate-400 border-slate-200">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {member.phone}
                    {member.email ? ` · ${member.email}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setStaffModal({ open: true, edit: member })}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition border border-transparent hover:border-indigo-200"
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(member)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition border border-transparent
                      ${member.isActive ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"}`}
                    title={member.isActive ? "Deactivate" : "Activate"}
                  >
                    {member.isActive ? <PowerOff size={12} /> : <Power size={12} />}
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <StaffModal
        isOpen={staffModal.open}
        onClose={() => setStaffModal({ open: false, edit: null })}
        onSubmit={handleStaffSubmit}
        editStaff={staffModal.edit}
        labId={lab._id}
      />
    </div>
  );
};

/* ─── Staff Drawer ───────────────────────────────────────── */

const StaffDrawer = ({ lab, onClose, showPopup }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <StaffPanel lab={lab} onClose={onClose} showPopup={showPopup} />
      </div>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.22s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
    </div>
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

const LabRow = ({ lab, index, onEdit, onManageStaff }) => (
  <div
    className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
    style={{ animationDelay: `${index * 0.03}s` }}
  >
    <div
      className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border ${lab.isActive ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"}`}
    >
      {lab.type === "hospital" ? (
        <Building2 size={15} className={lab.isActive ? "text-rose-500" : "text-slate-400"} />
      ) : (
        <FlaskConical size={15} className={lab.isActive ? "text-indigo-500" : "text-slate-400"} />
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[13.5px] font-bold text-slate-800 leading-snug">{lab.name}</p>
        <LabTypeBadge type={lab.type} />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Hash size={10} className="text-slate-300" />
          {lab.labKey}
        </span>
        {lab.registrationNumber && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Lock size={10} className="text-slate-300" />
            {lab.registrationNumber}
          </span>
        )}
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

    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(lab)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition border border-transparent hover:border-indigo-200"
        title="Edit lab"
      >
        <Pencil size={12} />
      </button>
      <button
        onClick={() => onManageStaff(lab)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition border border-transparent hover:border-violet-200"
        title="Manage staff"
      >
        <Users size={12} />
      </button>
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
  const [labModal, setLabModal] = useState({ open: false, edit: null });
  const [staffDrawer, setStaffDrawer] = useState(null);
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
        type: form.type || undefined,
        registrationNumber: form.registrationNumber || undefined,
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

  const handleEdit = async (form) => {
    const id = labModal.edit._id;
    try {
      await labService.updateLabInfo(id, {
        name: form.name,
        type: form.type || undefined,
        registrationNumber: form.registrationNumber || undefined,
        contact: form.contact,
      });
      await labService.updateLabBilling(id, {
        perInvoiceFee: Number(form.billing.perInvoiceFee),
        monthlyFee: Number(form.billing.monthlyFee),
        commission: Number(form.billing.commission),
      });
      if (form.isActive !== labModal.edit.isActive) {
        if (form.isActive) {
          await labService.activateLab(id);
        } else {
          await labService.deactivateLab(id);
        }
      }
      showPopup("success", "Lab updated successfully!");
      fetchStats();
      fetchLabs(page, search);
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to update lab.");
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
          onClick={() => setLabModal({ open: true, edit: null })}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all whitespace-nowrap"
        >
          <Plus size={14} /> Register Lab
        </button>
      </div>

      {/* Stats */}
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
                onClick={() => setLabModal({ open: true, edit: null })}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all"
              >
                <Plus size={14} /> Register First Lab
              </button>
            )}
          </div>
        ) : (
          labs.map((lab, i) => (
            <LabRow
              key={lab._id}
              lab={lab}
              index={i}
              onEdit={(l) => setLabModal({ open: true, edit: l })}
              onManageStaff={(l) => setStaffDrawer(l)}
            />
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={handlePageChange} />

      <LabModal
        isOpen={labModal.open}
        onClose={() => setLabModal({ open: false, edit: null })}
        onSubmit={labModal.edit ? handleEdit : handleCreate}
        editLab={labModal.edit}
      />

      {staffDrawer && <StaffDrawer lab={staffDrawer} onClose={() => setStaffDrawer(null)} showPopup={showPopup} />}

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
