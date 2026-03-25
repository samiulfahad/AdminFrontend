import { useEffect, useState, useRef } from "react";
import {
  Search,
  FlaskConical,
  RefreshCw,
  X,
  ChevronRight,
  CreditCard,
  Users,
  Shield,
  UserPlus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Hash,
  Plus,
  AlertCircle,
  UserCog,
  Key,
  Eye,
  EyeOff,
  Check,
  MapPin,
} from "lucide-react";
import Modal from "../../components/modal";
import Popup from "../../components/popup";
import labService from "../../api/labService";
import staffService from "../../api/staffService";

// ── Constants ──────────────────────────────────────────────────────────────────
const ROLES = { ADMIN: "admin", STAFF: "staff", SUPPORT_ADMIN: "supportAdmin" };

const PERMISSIONS = [
  { key: "createInvoice", label: "Create Invoice" },
  { key: "editInvoice", label: "Edit Invoice" },
  { key: "deleteInvoice", label: "Delete Invoice" },
  { key: "cashmemo", label: "Cash Memo" },
  { key: "uploadReport", label: "Upload Report" },
  { key: "downloadReport", label: "Download Report" },
];

const DEFAULT_PERMS = {
  createInvoice: false,
  editInvoice: false,
  deleteInvoice: false,
  cashmemo: false,
  uploadReport: false,
  downloadReport: false,
};

// ── Shared Primitives ──────────────────────────────────────────────────────────
const FieldInput = ({ label, required, className = "", ...props }) => (
  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-400/10 transition-all">
    {label && (
      <span className="px-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap border-r border-slate-200 bg-slate-100 self-stretch flex items-center min-w-[100px]">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
    )}
    <input
      className={`flex-1 px-3 py-2.5 text-[13px] bg-transparent text-slate-800 placeholder-slate-300 focus:outline-none font-[inherit] ${className}`}
      {...props}
    />
  </div>
);

const SwitchToggle = ({ active, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!active)}
    className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
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

const StatusBadge = ({ active, onClick }) => (
  <span
    onClick={onClick}
    className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 select-none
      ${onClick ? "cursor-pointer" : "cursor-default"}
      ${
        active
          ? `bg-indigo-50 text-indigo-600 border-indigo-200 ${onClick ? "hover:bg-red-50 hover:text-red-500 hover:border-red-200" : ""}`
          : `bg-slate-100 text-slate-400 border-slate-200 ${onClick ? "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" : ""}`
      }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${active ? `bg-indigo-500 ${onClick ? "group-hover:bg-red-400" : ""}` : `bg-slate-300 ${onClick ? "group-hover:bg-emerald-500" : ""}`}`}
    />
    <span className={onClick ? "group-hover:hidden" : ""}>{active ? "Active" : "Inactive"}</span>
    {onClick && <span className="hidden group-hover:inline">{active ? "Deactivate" : "Activate"}</span>}
  </span>
);

const Btn = ({ indigo, sm, children, className = "", ...props }) => (
  <button
    className={`flex items-center gap-1.5 font-bold rounded-xl border transition-all duration-150 tracking-tight bg-transparent
      ${sm ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"}
      ${
        indigo
          ? "text-indigo-600 border-indigo-400 hover:bg-indigo-50 hover:border-indigo-500 active:scale-[0.97]"
          : "text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-700 active:scale-[0.97]"
      } disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
    {...props}
  >
    {children}
  </button>
);

// ── Modal Primitives ───────────────────────────────────────────────────────────
const MHead = ({ icon: Icon, title, sub, onClose }) => (
  <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
        <Icon size={15} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 tracking-tight leading-none">{title}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
    <button
      onClick={onClose}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
    >
      <X size={14} />
    </button>
  </div>
);

const MFoot = ({ onClose, loading, label, disabled }) => (
  <div className="sticky bottom-0 z-10 flex justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading || disabled}
      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-500 border border-indigo-500 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
    >
      {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      {label}
    </button>
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2">{children}</p>
);

// ── Modals ────────────────────────────────────────────────────────────────────
const EditLabModal = ({ isOpen, onClose, lab, onSave }) => {
  const EMPTY = {
    name: "",
    primary: "",
    secondary: "",
    publicEmail: "",
    privateEmail: "",
    address: "",
    district: "",
    zone: "",
  };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lab)
      setForm({
        name: lab.name ?? "",
        primary: lab.contact?.primary ?? "",
        secondary: lab.contact?.secondary ?? "",
        publicEmail: lab.contact?.publicEmail ?? "",
        privateEmail: lab.contact?.privateEmail ?? "",
        address: lab.contact?.address ?? "",
        district: lab.contact?.district ?? "",
        zone: lab.contact?.zone ?? "",
      });
  }, [isOpen, lab]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: form.name,
        contact: {
          primary: form.primary,
          secondary: form.secondary,
          publicEmail: form.publicEmail,
          privateEmail: form.privateEmail,
          address: form.address,
          district: form.district,
          zone: form.zone,
        },
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={submit}>
        <MHead icon={Pencil} title="Edit Lab Info" sub={lab?.labKey} onClose={onClose} />
        <div className="px-5 py-4 space-y-3">
          <FieldInput
            label="Lab Name"
            value={form.name}
            onChange={set("name")}
            required
            placeholder="e.g. Dhaka Diagnostic"
          />
          <SectionLabel>Contact</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <FieldInput label="Primary" type="tel" value={form.primary} onChange={set("primary")} placeholder="+880…" />
            <FieldInput
              label="Secondary"
              type="tel"
              value={form.secondary}
              onChange={set("secondary")}
              placeholder="Optional"
            />
            <FieldInput
              label="Public Email"
              type="email"
              value={form.publicEmail}
              onChange={set("publicEmail")}
              placeholder="Shown publicly"
            />
            <FieldInput
              label="Private Email"
              type="email"
              value={form.privateEmail}
              onChange={set("privateEmail")}
              placeholder="Internal only"
            />
          </div>
          <SectionLabel>Address</SectionLabel>
          <div className="space-y-2.5">
            <FieldInput
              label="Street"
              value={form.address}
              onChange={set("address")}
              placeholder="Full street address"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <FieldInput label="District" value={form.district} onChange={set("district")} placeholder="e.g. Dhaka" />
              <FieldInput label="Zone" value={form.zone} onChange={set("zone")} placeholder="e.g. North" />
            </div>
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label="Save Changes" />
      </form>
    </Modal>
  );
};

const BillingModal = ({ isOpen, onClose, lab, onSave }) => {
  const [form, setForm] = useState({ perInvoiceFee: "", monthlyFee: "", commission: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lab)
      setForm({
        perInvoiceFee: lab.billing?.perInvoiceFee ?? "",
        monthlyFee: lab.billing?.monthlyFee ?? "",
        commission: lab.billing?.commission ?? "",
      });
  }, [isOpen, lab]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ perInvoiceFee: +form.perInvoiceFee, monthlyFee: +form.monthlyFee, commission: +form.commission });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead icon={CreditCard} title="Edit Billing" sub={lab?.name} onClose={onClose} />
        <div className="px-5 py-4 space-y-3">
          <FieldInput
            label="Invoice Fee (৳)"
            type="number"
            value={form.perInvoiceFee}
            onChange={(e) => setForm((f) => ({ ...f, perInvoiceFee: e.target.value }))}
            min="0"
            required
          />
          <FieldInput
            label="Monthly Fee (৳)"
            type="number"
            value={form.monthlyFee}
            onChange={(e) => setForm((f) => ({ ...f, monthlyFee: e.target.value }))}
            min="0"
            required
          />
          <FieldInput
            label="Commission (৳)"
            type="number"
            value={form.commission}
            onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
            min="0"
            required
          />
          <div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {[
              ["Invoice", `৳${form.perInvoiceFee || 0}`, "bg-indigo-50 text-indigo-600"],
              ["Monthly", `৳${form.monthlyFee || 0}`, "bg-emerald-50 text-emerald-600"],
              ["Comm.", `৳${form.commission || 0}`, "bg-amber-50 text-amber-600"],
            ].map(([l, v, cls]) => (
              <div key={l} className={`text-center py-3 ${cls.split(" ")[0]}`}>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{l}</p>
                <p className={`text-base font-black mt-0.5 ${cls.split(" ")[1]}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label="Save Billing" />
      </form>
    </Modal>
  );
};

const SupportModal = ({ isOpen, onClose, onSave }) => {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPw("");
      setShow(false);
    }
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(pw);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead icon={Key} title="Support Admin" sub="One support admin per lab" onClose={onClose} />
        <div className="px-5 py-4 space-y-3">
          <FieldInput label="Phone" value="SUPPORTADMIN" disabled />
          <div className="relative">
            <FieldInput
              label="Password"
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={6}
              autoFocus
              className="pr-9 tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label="Create Support Admin" />
      </form>
    </Modal>
  );
};

const SupportPasswordModal = ({ isOpen, onClose, onSave }) => {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPw("");
      setShow(false);
    }
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(pw);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead
          icon={Key}
          title="Change Support Password"
          sub="Updates support admin login password"
          onClose={onClose}
        />
        <div className="px-5 py-4 space-y-3">
          <div className="relative">
            <FieldInput
              label="New Password"
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={6}
              autoFocus
              placeholder="Min 6 characters"
              className="pr-9 tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label="Update Password" disabled={!pw || pw.length < 6} />
      </form>
    </Modal>
  );
};

const AdminModal = ({ isOpen, onClose, onSave, initial, mode }) => {
  const EMPTY = { name: "", phone: "", email: "", password: "", isActive: true };
  const [form, setForm] = useState(EMPTY);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initial ?? EMPTY);
      setShowPw(false);
    }
  }, [isOpen, initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead
          icon={Shield}
          title={mode === "create" ? "Add Admin" : "Edit Admin"}
          sub="Full lab access"
          onClose={onClose}
        />
        <div className="px-5 py-4 space-y-3">
          <FieldInput label="Full Name" value={form.name} onChange={set("name")} required />
          <FieldInput
            label="Phone"
            value={form.phone}
            onChange={set("phone")}
            required={mode === "create"}
            placeholder="Login identity"
          />
          <FieldInput
            label="Email"
            type="email"
            value={form.email || ""}
            onChange={set("email")}
            placeholder="Optional"
          />
          {mode === "create" && (
            <div className="relative">
              <FieldInput
                label="Password"
                type={showPw ? "text" : "password"}
                value={form.password || ""}
                onChange={set("password")}
                required
                minLength={6}
                maxLength={60}
                placeholder="Min 6 characters"
                className="pr-9 tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-semibold text-slate-400">Status</span>
            <SwitchToggle active={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </div>
        </div>
        <MFoot
          onClose={onClose}
          loading={loading}
          label={mode === "create" ? "Add Admin" : "Save Changes"}
          disabled={
            mode === "create"
              ? !form.name.trim() || !form.phone.trim() || !form.password || form.password.length < 6
              : !form.name.trim()
          }
        />
      </form>
    </Modal>
  );
};

const StaffModal = ({ isOpen, onClose, onSave, initial, mode }) => {
  const EMPTY = { name: "", phone: "", email: "", password: "", permissions: { ...DEFAULT_PERMS }, isActive: true };
  const [form, setForm] = useState(EMPTY);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial ? { ...initial, password: "", permissions: { ...DEFAULT_PERMS, ...initial.permissions } } : EMPTY,
      );
      setShowPw(false);
    }
  }, [isOpen, initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const togglePerm = (k) => setForm((f) => ({ ...f, permissions: { ...f.permissions, [k]: !f.permissions[k] } }));
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={submit}>
        <MHead
          icon={UserPlus}
          title={mode === "create" ? "Add Staff" : "Edit Staff"}
          sub="Fill in details and set permissions"
          onClose={onClose}
        />
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldInput label="Full Name" value={form.name} onChange={set("name")} required />
            <FieldInput
              label="Phone"
              value={form.phone}
              onChange={set("phone")}
              required={mode === "create"}
              placeholder="Login identity"
            />
            <FieldInput
              label="Email"
              type="email"
              value={form.email || ""}
              onChange={set("email")}
              placeholder="Optional"
            />
            {mode === "create" && (
              <div className="relative">
                <FieldInput
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={form.password || ""}
                  onChange={set("password")}
                  required
                  minLength={6}
                  maxLength={60}
                  placeholder="Min 6 characters"
                  className="pr-9 tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-semibold text-slate-400">Status</span>
            <SwitchToggle active={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </div>
          <div>
            <SectionLabel>Permissions</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PERMISSIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePerm(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${form.permissions[key] ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-slate-600"}`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${form.permissions[key] ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}
                  >
                    {form.permissions[key] && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <MFoot
          onClose={onClose}
          loading={loading}
          label={mode === "create" ? "Add Staff" : "Save Changes"}
          disabled={
            mode === "create"
              ? !form.name.trim() || !form.phone.trim() || !form.password || form.password.length < 6
              : !form.name.trim()
          }
        />
      </form>
    </Modal>
  );
};

// ── Person Row ────────────────────────────────────────────────────────────────
const PersonRow = ({ person, onEdit, onToggle, onDelete, showPerms }) => (
  <div className="group flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-black mt-0.5 border ${person.isActive ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}
    >
      {(person.name || "?")[0].toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <p className="text-sm font-bold text-slate-700">{person.name}</p>
        {person.role === ROLES.SUPPORT_ADMIN && (
          <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full uppercase tracking-wider">
            Support
          </span>
        )}
        {person.role === ROLES.ADMIN && (
          <span className="text-[9px] font-bold px-2 py-0.5 bg-violet-50 text-violet-600 border border-violet-200 rounded-full uppercase tracking-wider">
            Admin
          </span>
        )}
        <StatusBadge active={person.isActive} onClick={() => onToggle(person)} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {person.phone && person.phone !== "SUPPORTADMIN" && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Phone size={10} className="text-slate-300" />
            {person.phone}
          </span>
        )}
        {person.email && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
            <Mail size={10} className="text-slate-300 shrink-0" />
            {person.email}
          </span>
        )}
      </div>
      {showPerms && person.permissions && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PERMISSIONS.filter((p) => person.permissions[p.key]).map((p) => (
            <span
              key={p.key}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full"
            >
              <Check size={9} strokeWidth={3} />
              {p.label}
            </span>
          ))}
          {!PERMISSIONS.some((p) => person.permissions[p.key]) && (
            <span className="text-[10px] text-slate-300 italic">No permissions assigned</span>
          )}
        </div>
      )}
    </div>
    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
      {onEdit && (
        <button
          onClick={() => onEdit(person)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <Pencil size={13} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(person)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  </div>
);

const Skeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white animate-pulse">
    <div className="w-9 h-9 bg-slate-100 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, sub, onAdd, addLabel }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-12 h-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center mb-3">
      <Icon size={20} className="text-slate-300" />
    </div>
    <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
    <p className="text-xs text-slate-400 mb-4 max-w-[220px]">{sub}</p>
    <Btn indigo onClick={onAdd}>
      <Plus size={13} />
      {addLabel}
    </Btn>
  </div>
);

// ── Lab Detail Panel ──────────────────────────────────────────────────────────
const LabDetailPanel = ({ lab, onLabUpdated, showPopup }) => {
  const [allMembers, setAllMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [tab, setTab] = useState("staff");
  const [editOpen, setEditOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportPwOpen, setSupportPwOpen] = useState(false);
  const [staffM, setStaffM] = useState({ open: false, mode: "create", initial: null });
  const [adminM, setAdminM] = useState({ open: false, mode: "create", initial: null });

  const staffList = allMembers.filter((m) => m.role === ROLES.STAFF);
  const adminList = allMembers.filter((m) => m.role === ROLES.ADMIN || m.role === ROLES.SUPPORT_ADMIN);
  const hasSupportAdmin = adminList.some((m) => m.role === ROLES.SUPPORT_ADMIN);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const r = await staffService.getAll(lab._id);
      setAllMembers(Array.isArray(r.data) ? r.data : []);
    } catch {
      showPopup("error", "Failed to load members.");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [lab._id]);

  const saveLabInfo = async (data) => {
    try {
      await labService.updateLabInfo(lab._id, data);
      showPopup("success", "Lab info updated!");
      onLabUpdated();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const saveBilling = async (b) => {
    try {
      await labService.updateLabBilling(lab._id, b);
      showPopup("success", "Billing updated!");
      onLabUpdated();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const toggleLab = () =>
    showPopup("warning", `${lab.isActive ? "Deactivate" : "Activate"} "${lab.name}"?`, async () => {
      try {
        lab.isActive ? await labService.deactivateLab(lab._id) : await labService.activateLab(lab._id);
        showPopup("success", "Done!");
        onLabUpdated();
      } catch {
        showPopup("error", "Failed.");
      }
    });

  const createStaff = async (f) => {
    try {
      await staffService.createMember(lab._id, f);
      showPopup("success", "Staff added!");
      fetchMembers();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const updateStaff = async (f) => {
    try {
      await staffService.update(lab._id, staffM.initial._id, f);
      showPopup("success", "Staff updated!");
      fetchMembers();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const createAdmin = async (f) => {
    try {
      await staffService.createAdmin(lab._id, f);
      showPopup("success", "Admin created!");
      fetchMembers();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const updateAdmin = async (f) => {
    // eslint-disable-next-line no-unused-vars
    const { permissions, ...payload } = f;
    try {
      await staffService.update(lab._id, adminM.initial._id, payload);
      showPopup("success", "Updated!");
      fetchMembers();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const createSupport = async (pw) => {
    try {
      await staffService.createSupport(lab._id, { password: pw });
      showPopup("success", "Support admin created!");
      fetchMembers();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const updateSupportPassword = async (pw) => {
    try {
      await staffService.updateSupportPassword(lab._id, { password: pw });
      showPopup("success", "Support admin password updated!");
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const toggleMember = (p) =>
    showPopup("warning", `${p.isActive ? "Deactivate" : "Activate"} "${p.name}"?`, async () => {
      try {
        p.isActive ? await staffService.deactivate(lab._id, p._id) : await staffService.activate(lab._id, p._id);
        showPopup("success", "Done!");
        fetchMembers();
      } catch {
        showPopup("error", "Failed.");
      }
    });

  const deleteMember = (p) =>
    showPopup(
      "warning",
      p.role === ROLES.SUPPORT_ADMIN
        ? `Remove support admin for "${lab.name}"? A new one can be created afterwards.`
        : `Delete "${p.name}"?`,
      async () => {
        try {
          p.role === ROLES.SUPPORT_ADMIN
            ? await staffService.deleteSupport(lab._id)
            : await staffService.delete(lab._id, p._id);
          showPopup("success", "Deleted!");
          fetchMembers();
        } catch {
          showPopup("error", "Failed.");
        }
      },
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Lab header card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${lab.isActive ? "bg-gradient-to-br from-indigo-500 to-indigo-400 border-transparent shadow-md shadow-indigo-200" : "bg-slate-50 border-slate-200"}`}
            >
              <FlaskConical size={19} className={lab.isActive ? "text-white" : "text-slate-400"} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-base font-black text-slate-800 tracking-tight">{lab.name}</h2>
                <StatusBadge active={lab.isActive} onClick={toggleLab} />
              </div>
              <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                <Hash size={10} className="text-slate-300" />
                {lab.labKey}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Btn onClick={() => setEditOpen(true)}>
              <Pencil size={13} />
              Edit Info
            </Btn>
            <Btn onClick={() => setBillingOpen(true)}>
              <CreditCard size={13} />
              Edit Billing
            </Btn>
          </div>
        </div>

        {/* Billing strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-xl overflow-hidden mt-3">
          {[
            ["Invoice", `৳${lab.billing?.perInvoiceFee ?? 0}`, "bg-indigo-50 text-indigo-600"],
            ["Monthly", `৳${lab.billing?.monthlyFee ?? 0}`, "bg-emerald-50 text-emerald-600"],
            ["Commission", `৳${lab.billing?.commission ?? 0}`, "bg-amber-50 text-amber-600"],
          ].map(([l, v, cls]) => (
            <div key={l} className={`text-center py-3 ${cls.split(" ")[0]}`}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{l}</p>
              <p className={`text-sm font-black mt-0.5 ${cls.split(" ")[1]}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        {(lab.contact?.primary || lab.contact?.publicEmail || lab.contact?.district) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-50 text-[11px] text-slate-400">
            {lab.contact?.primary && (
              <span className="flex items-center gap-1.5">
                <Phone size={11} className="text-slate-300" />
                {lab.contact.primary}
              </span>
            )}
            {lab.contact?.secondary && (
              <span className="flex items-center gap-1.5">
                <Phone size={11} className="text-slate-300" />
                {lab.contact.secondary}
              </span>
            )}
            {lab.contact?.publicEmail && (
              <span className="flex items-center gap-1.5">
                <Mail size={11} className="text-slate-300 shrink-0" />
                {lab.contact.publicEmail}
              </span>
            )}
            {(lab.contact?.district || lab.contact?.address) && (
              <span className="flex items-center gap-1.5">
                <MapPin size={11} className="text-slate-300 shrink-0" />
                {[lab.contact.address, lab.contact.district, lab.contact.zone].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Members card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex -mb-px">
            {[
              ["staff", "Staff", Users, staffList.length],
              ["admins", "Admins", Shield, adminList.length],
            ].map(([id, label, Icon, count]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-all ${tab === id ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                <Icon size={13} />
                {label}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 py-2">
            {tab === "staff" && (
              <Btn indigo sm onClick={() => setStaffM({ open: true, mode: "create", initial: null })}>
                <Plus size={12} />
                Add Staff
              </Btn>
            )}
            {tab === "admins" && (
              <>
                <Btn indigo sm onClick={() => setAdminM({ open: true, mode: "create", initial: null })}>
                  <UserPlus size={12} />
                  Add Admin
                </Btn>
                {hasSupportAdmin ? (
                  <Btn sm onClick={() => setSupportPwOpen(true)}>
                    <Key size={12} />
                    Support Password
                  </Btn>
                ) : (
                  <Btn sm onClick={() => setSupportOpen(true)}>
                    <Key size={12} />
                    Support
                  </Btn>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-3 space-y-1.5">
          {tab === "staff" &&
            (membersLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} />)
            ) : staffList.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No staff members"
                sub="Add staff to manage lab operations"
                onAdd={() => setStaffM({ open: true, mode: "create", initial: null })}
                addLabel="Add First Staff"
              />
            ) : (
              staffList.map((s) => (
                <PersonRow
                  key={s._id}
                  person={s}
                  showPerms
                  onEdit={(p) => setStaffM({ open: true, mode: "edit", initial: p })}
                  onToggle={toggleMember}
                  onDelete={deleteMember}
                />
              ))
            ))}
          {tab === "admins" &&
            (membersLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} />)
            ) : adminList.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No admins yet"
                sub="Create an admin or support admin"
                onAdd={() => setAdminM({ open: true, mode: "create", initial: null })}
                addLabel="Add Admin"
              />
            ) : (
              adminList.map((a) => (
                <PersonRow
                  key={a._id}
                  person={a}
                  showPerms={false}
                  onEdit={
                    a.role !== ROLES.SUPPORT_ADMIN ? (p) => setAdminM({ open: true, mode: "edit", initial: p }) : null
                  }
                  onToggle={toggleMember}
                  onDelete={deleteMember}
                />
              ))
            ))}
        </div>
      </div>

      <EditLabModal isOpen={editOpen} onClose={() => setEditOpen(false)} lab={lab} onSave={saveLabInfo} />
      <BillingModal isOpen={billingOpen} onClose={() => setBillingOpen(false)} lab={lab} onSave={saveBilling} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} onSave={createSupport} />
      <SupportPasswordModal
        isOpen={supportPwOpen}
        onClose={() => setSupportPwOpen(false)}
        onSave={updateSupportPassword}
      />
      <StaffModal
        isOpen={staffM.open}
        onClose={() => setStaffM((f) => ({ ...f, open: false }))}
        onSave={staffM.mode === "create" ? createStaff : updateStaff}
        initial={staffM.initial}
        mode={staffM.mode}
      />
      <AdminModal
        isOpen={adminM.open}
        onClose={() => setAdminM((f) => ({ ...f, open: false }))}
        onSave={adminM.mode === "create" ? createAdmin : updateAdmin}
        initial={adminM.initial}
        mode={adminM.mode}
      />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const LabManagement = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });
  const debounce = useRef(null);

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

  const search = async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const r = await labService.getLabs({ page: 1, limit: 20, labKey: q.trim() });
      const d = r.data;
      setResults(Array.isArray(d) ? d : (d.data ?? []));
    } catch {
      showPopup("error", "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (val) => {
    setQuery(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 400);
  };

  const onLabUpdated = async () => {
    if (!selected) return;
    try {
      const r = await labService.getLabById(selected._id);
      setSelected(r.data);
      if (query.trim()) {
        const r2 = await labService.getLabs({ page: 1, limit: 20, labKey: query.trim() });
        const d = r2.data;
        setResults(Array.isArray(d) ? d : (d.data ?? []));
      }
    } catch {}
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
          <UserCog size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Lab Management</h1>
          <p className="text-[11px] text-slate-400 mt-1">Search a lab to manage staff, admins &amp; billing</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
        <div
          className={`flex items-center gap-3 px-4 py-3 ${results.length > 0 || searched ? "border-b border-slate-100" : ""}`}
        >
          {loading ? (
            <RefreshCw size={15} className="text-indigo-500 animate-spin shrink-0" />
          ) : (
            <Search size={15} className="text-slate-400 shrink-0" />
          )}
          <input
            type="text"
            placeholder="Type a Lab ID to search…"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-sm text-slate-800 placeholder-slate-300 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
                setSelected(null);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 transition shrink-0"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {!searched && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-300">
            <Search size={15} />
            <span className="text-xs">Enter a Lab ID to begin</span>
          </div>
        )}

        {searched && loading && (
          <div className="divide-y divide-slate-50">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2 bg-slate-100 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-300">
            <AlertCircle size={15} />
            <span className="text-xs">No labs found for &ldquo;{query}&rdquo;</span>
          </div>
        )}

        {searched && !loading && results.length > 0 && (
          <div className="divide-y divide-slate-50">
            {results.map((lab) => {
              const isSelected = selected?._id === lab._id;
              return (
                <button
                  key={lab._id}
                  onClick={() => setSelected(isSelected ? null : lab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? "bg-indigo-100 border-indigo-200" : lab.isActive ? "bg-indigo-50 border-indigo-100" : "bg-slate-100 border-slate-200"}`}
                  >
                    <FlaskConical
                      size={14}
                      className={isSelected ? "text-indigo-600" : lab.isActive ? "text-indigo-500" : "text-slate-400"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${isSelected ? "text-indigo-700" : "text-slate-700"}`}
                    >
                      {lab.name}
                    </p>
                    <p className={`text-[11px] font-mono ${isSelected ? "text-indigo-400" : "text-slate-400"}`}>
                      #{lab.labKey}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge active={lab.isActive} />
                    {isSelected ? (
                      <X size={14} className="text-indigo-400" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <LabDetailPanel key={selected._id} lab={selected} onLabUpdated={onLabUpdated} showPopup={showPopup} />
      )}

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

export default LabManagement;
