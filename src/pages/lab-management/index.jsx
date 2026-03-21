import { useEffect, useState, useRef } from "react";
import {
  Search, FlaskConical, RefreshCw, X, ChevronRight,
  CreditCard, Users, Shield, UserPlus, Pencil, Trash2,
  Phone, Mail, Hash, Plus, AlertCircle, UserCog, Key,
  Eye, EyeOff, Check, MapPin,
} from "lucide-react";
import Modal from "../../components/modal";
import Popup from "../../components/popup";
import labService from "../../api/labService";
import staffService from "../../api/staffService";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLES = { ADMIN: "admin", STAFF: "staff", SUPPORT_ADMIN: "supportAdmin" };

const PERMISSIONS = [
  { key: "createInvoice",   label: "Create Invoice" },
  { key: "editInvoice",     label: "Edit Invoice" },
  { key: "deleteInvoice",   label: "Delete Invoice" },
  { key: "cashmemo",        label: "Cash Memo" },
  { key: "uploadReport",    label: "Upload Report" },
  { key: "downloadReport",  label: "Download Report" },
];

const DEFAULT_PERMS = {
  createInvoice: false, editInvoice: false, deleteInvoice: false,
  cashmemo: false, uploadReport: false, downloadReport: false,
};

// ── Design Primitives ─────────────────────────────────────────────────────────
const Input = ({ label, required, className = "", ...props }) => (
  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-400/20 transition-all overflow-hidden">
    {label && (
      <span className="px-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap border-r border-slate-200 bg-slate-100 self-stretch flex items-center min-w-[90px]">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
    )}
    <input
      className={`flex-1 px-3 py-2 text-sm bg-transparent text-slate-800 placeholder-slate-300 focus:outline-none ${className}`}
      {...props}
    />
  </div>
);

const StatusBadge = ({ active, onClick }) => (
  <span className={`relative inline-flex group ${onClick ? "cursor-pointer" : "cursor-default"}`} onClick={onClick}>
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-200 select-none ${
      active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"
    }`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${active ? "bg-emerald-600" : "bg-slate-300"}`}>
        {active
          ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          : <X className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
      </span>
      {active ? "Active" : "Inactive"}
    </span>
    {onClick && (
      <span className={`absolute inset-0 rounded-full flex items-center justify-center gap-1 text-[11px] font-semibold border opacity-0 group-hover:opacity-100 transition-all duration-200 ${
        active ? "bg-red-50 text-red-500 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
      }`}>
        {active
          ? <><X className="w-2.5 h-2.5" strokeWidth={2.5} /> Deactivate</>
          : <><Check className="w-2.5 h-2.5" strokeWidth={3} /> Activate</>}
      </span>
    )}
  </span>
);

const SwitchToggle = ({ active, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!active)}
    className="inline-flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
  >
    <span className={`relative inline-block w-[34px] h-5 rounded-full transition-colors duration-200 ${active ? "bg-emerald-600" : "bg-slate-300"}`}>
      <span className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white transition-all duration-200 ${active ? "left-[17px]" : "left-[3px]"}`} />
    </span>
    <span className={`text-xs font-semibold transition-colors ${active ? "text-emerald-700" : "text-slate-400"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  </button>
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

// ── Modal Shell ───────────────────────────────────────────────────────────────
const MHead = ({ icon: Icon, title, sub, onClose }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
        <Icon className="w-4 h-4 text-teal-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 tracking-tight">{title}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 transition">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const MFoot = ({ onClose, loading, label }) => (
  <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
    <Btn type="button" onClick={onClose}>Cancel</Btn>
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-md hover:bg-teal-50 disabled:opacity-50 transition-all"
    >
      {loading && <div className="w-3.5 h-3.5 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />}
      {label}
    </button>
  </div>
);

const MSectionLabel = ({ label }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1 mb-2">{label}</p>
);

// ── Edit Lab Info Modal ───────────────────────────────────────────────────────
const EditLabModal = ({ isOpen, onClose, lab, onSave }) => {
  const EMPTY = { name: "", primary: "", secondary: "", publicEmail: "", privateEmail: "", address: "", district: "", zone: "" };
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lab)
      setForm({
        name:         lab.name               ?? "",
        primary:      lab.contact?.primary   ?? "",
        secondary:    lab.contact?.secondary ?? "",
        publicEmail:  lab.contact?.publicEmail  ?? "",
        privateEmail: lab.contact?.privateEmail ?? "",
        address:      lab.contact?.address   ?? "",
        district:     lab.contact?.district  ?? "",
        zone:         lab.contact?.zone      ?? "",
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
          primary: form.primary, secondary: form.secondary,
          publicEmail: form.publicEmail, privateEmail: form.privateEmail,
          address: form.address, district: form.district, zone: form.zone,
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
        <MHead icon={Pencil} title="Edit Lab Info" sub={lab?.labID} onClose={onClose} />
        <div className="px-5 py-4 space-y-3">
          <Input label="Lab Name" value={form.name} onChange={set("name")} required placeholder="e.g. Dhaka Diagnostic" />
          <div>
            <MSectionLabel label="Contact" />
            <div className="grid grid-cols-2 gap-2.5">
              <Input label="Primary"      type="tel"   value={form.primary}      onChange={set("primary")}      placeholder="+880…" />
              <Input label="Secondary"    type="tel"   value={form.secondary}    onChange={set("secondary")}    placeholder="Optional" />
              <Input label="Public Email" type="email" value={form.publicEmail}  onChange={set("publicEmail")}  placeholder="Shown publicly" />
              <Input label="Private Email" type="email" value={form.privateEmail} onChange={set("privateEmail")} placeholder="Internal only" />
            </div>
          </div>
          <div>
            <MSectionLabel label="Address" />
            <div className="space-y-2.5">
              <Input label="Street" value={form.address} onChange={set("address")} placeholder="Full street address" />
              <div className="grid grid-cols-2 gap-2.5">
                <Input label="District" value={form.district} onChange={set("district")} placeholder="e.g. Dhaka" />
                <Input label="Zone"     value={form.zone}     onChange={set("zone")}     placeholder="e.g. North" />
              </div>
            </div>
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label="Save Changes" />
      </form>
    </Modal>
  );
};

// ── Billing Modal ─────────────────────────────────────────────────────────────
const BillingModal = ({ isOpen, onClose, lab, onSave }) => {
  const [form, setForm]       = useState({ perInvoiceFee: "", monthlyFee: "", commission: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lab)
      setForm({
        perInvoiceFee: lab.billing?.perInvoiceFee ?? "",
        monthlyFee:    lab.billing?.monthlyFee    ?? "",
        commission:    lab.billing?.commission    ?? "",
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
          <Input
            label="Invoice Fee (৳)"
            type="number"
            value={form.perInvoiceFee}
            onChange={(e) => setForm((f) => ({ ...f, perInvoiceFee: e.target.value }))}
            min="0" required
          />
          <Input
            label="Monthly Fee (৳)"
            type="number"
            value={form.monthlyFee}
            onChange={(e) => setForm((f) => ({ ...f, monthlyFee: e.target.value }))}
            min="0" required
          />
          <Input
            label="Commission (৳)"       
            type="number"
            value={form.commission}
            onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
            min="0" required
          />
        </div>
        <div className="mx-5 mb-4 grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
          {[
            ["Invoice",    `৳${form.perInvoiceFee || 0}`],
            ["Monthly",    `৳${form.monthlyFee    || 0}`],
            ["Comm.",      `৳${form.commission    || 0}`],  
          ].map(([l, v]) => (
            <div key={l} className="bg-slate-50 text-center py-2.5">
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">{l}</p>
              <p className="text-sm font-black text-teal-600 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        <MFoot onClose={onClose} loading={loading} label="Save Billing" />
      </form>
    </Modal>
  );
};

// ── Support Admin Modal ───────────────────────────────────────────────────────
const SupportModal = ({ isOpen, onClose, onSave }) => {
  const [pw, setPw]           = useState("");
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { setPw(""); setShow(false); }
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(pw); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead icon={Key} title="Support Admin" sub="One support admin per lab" onClose={onClose} />
        <div className="px-5 py-4 space-y-3">
          <Input label="Phone" value="SUPPORTADMIN" disabled />
          <div className="relative">
            <Input
              label="Password"
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required minLength={6} autoFocus
              className="pr-8 tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label="Create Support Admin" />
      </form>
    </Modal>
  );
};

// ── Admin Modal ───────────────────────────────────────────────────────────────
const AdminModal = ({ isOpen, onClose, onSave, initial, mode }) => {
  const EMPTY = { name: "", phone: "", email: "", isActive: true };
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(initial ?? EMPTY);
  }, [isOpen, initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead icon={Shield} title={mode === "create" ? "Add Admin" : "Edit Admin"} sub="Full lab access" onClose={onClose} />
        <div className="px-5 py-4 space-y-3">
          <Input label="Full Name" value={form.name} onChange={set("name")} required />
          <Input label="Phone" value={form.phone} onChange={set("phone")} required={mode === "create"} placeholder="Login identity" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={form.email || ""} onChange={set("email")} placeholder="Optional" />
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 h-full">
              <span className="text-[11px] font-semibold text-slate-400">Status</span>
              <SwitchToggle active={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            </div>
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label={mode === "create" ? "Add Admin" : "Save Changes"} />
      </form>
    </Modal>
  );
};

// ── Staff Modal ───────────────────────────────────────────────────────────────
const StaffModal = ({ isOpen, onClose, onSave, initial, mode }) => {
  const EMPTY = { name: "", phone: "", email: "", permissions: { ...DEFAULT_PERMS }, isActive: true };
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(initial ? { ...initial, permissions: { ...DEFAULT_PERMS, ...initial.permissions } } : EMPTY);
  }, [isOpen, initial]);

  const set        = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const togglePerm = (k) => setForm((f) => ({ ...f, permissions: { ...f.permissions, [k]: !f.permissions[k] } }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={submit}>
        <MHead icon={UserPlus} title={mode === "create" ? "Add Staff" : "Edit Staff"} sub="Fill in details and set permissions" onClose={onClose} />
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" value={form.name} onChange={set("name")} required />
            <Input label="Phone" value={form.phone} onChange={set("phone")} required={mode === "create"} placeholder="Login identity" />
            <Input label="Email" type="email" value={form.email || ""} onChange={set("email")} placeholder="Optional" />
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 h-full">
              <span className="text-[11px] font-semibold text-slate-400">Status</span>
              <SwitchToggle active={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permissions</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PERMISSIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePerm(key)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition-all ${
                    form.permissions[key]
                      ? "bg-teal-50 text-teal-700 border-teal-300"
                      : "bg-white text-slate-400 border-slate-200 hover:border-teal-200 hover:text-slate-600"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${form.permissions[key] ? "bg-teal-500 border-teal-500" : "border-slate-300"}`}>
                    {form.permissions[key] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <MFoot onClose={onClose} loading={loading} label={mode === "create" ? "Add Staff" : "Save Changes"} />
      </form>
    </Modal>
  );
};

// ── Person Row ────────────────────────────────────────────────────────────────
const PersonRow = ({ person, onEdit, onToggle, onDelete, showPerms }) => (
  <div className="group flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-teal-200 hover:bg-teal-50/30 transition-all">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black mt-0.5 border ${person.isActive ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
      {(person.name || "?")[0].toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-bold text-slate-700 tracking-tight">{person.name}</p>
        {person.role === ROLES.SUPPORT_ADMIN && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-500 border border-amber-200 rounded uppercase tracking-wider">Support</span>
        )}
        {person.role === ROLES.ADMIN && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-violet-50 text-violet-500 border border-violet-200 rounded uppercase tracking-wider">Admin</span>
        )}
        <StatusBadge active={person.isActive} onClick={() => onToggle(person)} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
        {person.phone && person.phone !== "SUPPORTADMIN" && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Phone className="w-2.5 h-2.5" />{person.phone}
          </span>
        )}
        {person.email && person.email !== "supportadmin@system" && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
            <Mail className="w-2.5 h-2.5 shrink-0" />{person.email}
          </span>
        )}
      </div>
      {showPerms && person.permissions && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {PERMISSIONS.filter((p) => person.permissions[p.key]).map((p) => (
            <span key={p.key} className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 bg-teal-50 text-teal-600 border border-teal-100 rounded">
              <Check className="w-2.5 h-2.5" strokeWidth={2.5} />{p.label}
            </span>
          ))}
          {!PERMISSIONS.some((p) => person.permissions[p.key]) && (
            <span className="text-[10px] text-slate-300 italic">No permissions assigned</span>
          )}
        </div>
      )}
    </div>
    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      {onEdit && (
        <button onClick={() => onEdit(person)} className="p-1.5 rounded-md text-slate-400 hover:bg-white hover:text-slate-700 hover:border hover:border-slate-200 transition">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(person)} className="p-1.5 rounded-md text-slate-300 hover:bg-white hover:text-red-400 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

const Skeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white animate-pulse">
    <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, sub, onAdd, addLabel }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-11 h-11 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-slate-300" />
    </div>
    <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
    <p className="text-xs text-slate-400 mb-4">{sub}</p>
    <Btn teal onClick={onAdd}><Plus className="w-3.5 h-3.5" />{addLabel}</Btn>
  </div>
);

// ── Lab Detail Panel ──────────────────────────────────────────────────────────
const LabDetailPanel = ({ lab, onLabUpdated, showPopup }) => {
  const [allMembers, setAllMembers]       = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [tab, setTab]                     = useState("staff");
  const [editOpen, setEditOpen]           = useState(false);
  const [billingOpen, setBillingOpen]     = useState(false);
  const [supportOpen, setSupportOpen]     = useState(false);
  const [staffM, setStaffM]   = useState({ open: false, mode: "create", initial: null });
  const [adminM, setAdminM]   = useState({ open: false, mode: "create", initial: null });

  const staffList = allMembers.filter((m) => m.role === ROLES.STAFF);
  const adminList = allMembers.filter((m) => m.role === ROLES.ADMIN || m.role === ROLES.SUPPORT_ADMIN);

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

  // ── Save handlers ──────────────────────────────────────────────────────────
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
      } catch { showPopup("error", "Failed."); }
    });

  const createStaff = async (f) => {
    try { await staffService.createMember(lab._id, f); showPopup("success", "Staff added!"); fetchMembers(); }
    catch (e) { showPopup("error", e?.response?.data?.message || "Failed."); throw e; }
  };
  const updateStaff = async (f) => {
    try { await staffService.update(lab._id, staffM.initial._id, f); showPopup("success", "Staff updated!"); fetchMembers(); }
    catch (e) { showPopup("error", e?.response?.data?.message || "Failed."); throw e; }
  };
  const toggleMember = (p) =>
    showPopup("warning", `${p.isActive ? "Deactivate" : "Activate"} "${p.name}"?`, async () => {
      try {
        p.isActive ? await staffService.deactivate(lab._id, p._id) : await staffService.activate(lab._id, p._id);
        showPopup("success", "Done!"); fetchMembers();
      } catch { showPopup("error", "Failed."); }
    });
  const deleteMember = (p) =>
    showPopup("warning", `Delete "${p.name}"?`, async () => {
      try { await staffService.delete(lab._id, p._id); showPopup("success", "Deleted!"); fetchMembers(); }
      catch { showPopup("error", "Failed."); }
    });
  const createAdmin = async (f) => {
    try { await staffService.createAdmin(lab._id, f); showPopup("success", "Admin created!"); fetchMembers(); }
    catch (e) { showPopup("error", e?.response?.data?.message || "Failed."); throw e; }
  };
  const updateAdmin = async (f) => {
    try { await staffService.update(lab._id, adminM.initial._id, f); showPopup("success", "Updated!"); fetchMembers(); }
    catch (e) { showPopup("error", e?.response?.data?.message || "Failed."); throw e; }
  };
  const createSupport = async (pw) => {
    try { await staffService.createSupport(lab._id, { password: pw }); showPopup("success", "Support admin created!"); fetchMembers(); }
    catch (e) { showPopup("error", e?.response?.data?.message || "Failed."); throw e; }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Lab header card */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${lab.isActive ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-200"}`}>
              <FlaskConical className={`w-5 h-5 ${lab.isActive ? "text-teal-600" : "text-slate-400"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-800 tracking-tight">{lab.name}</h2>
                <StatusBadge active={lab.isActive} onClick={toggleLab} />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Hash className="w-3 h-3 text-slate-300" />
                <span className="text-xs font-mono font-bold text-slate-400">{lab.labID}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Btn onClick={() => setEditOpen(true)}><Pencil className="w-3.5 h-3.5" />Edit Info</Btn>
            <Btn onClick={() => setBillingOpen(true)}><CreditCard className="w-3.5 h-3.5" />Edit Billing</Btn>
          </div>
        </div>

        {/* Billing summary bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-lg overflow-hidden mt-3">
          {[
            ["Invoice",    `৳${lab.billing?.perInvoiceFee ?? 0}`],
            ["Monthly",    `৳${lab.billing?.monthlyFee    ?? 0}`],
            ["Commission", `৳${lab.billing?.commission    ?? 0}`],  
          ].map(([l, v]) => (
            <div key={l} className="bg-slate-50 text-center py-2.5">
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">{l}</p>
              <p className="text-sm font-black text-teal-600 mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Contact row */}
        {(lab.contact?.primary || lab.contact?.publicEmail || lab.contact?.district || lab.contact?.address) && (
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400">
            {lab.contact?.primary && (
              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{lab.contact.primary}</span>
            )}
            {lab.contact?.secondary && (
              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{lab.contact.secondary}</span>
            )}
            {lab.contact?.publicEmail && (
              <span className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 shrink-0" />{lab.contact.publicEmail}</span>
            )}
            {(lab.contact?.district || lab.contact?.address) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {[lab.contact.address, lab.contact.district, lab.contact.zone].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs card */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex">
            {[
              ["staff",  "Staff",  Users,  staffList.length],
              ["admins", "Admins", Shield, adminList.length],
            ].map(([id, label, Icon, count]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 -mb-px transition-all ${tab === id ? "border-teal-400 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-400"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 py-2">
            {tab === "staff" && (
              <Btn teal onClick={() => setStaffM({ open: true, mode: "create", initial: null })}>
                <Plus className="w-3 h-3" />Add Staff
              </Btn>
            )}
            {tab === "admins" && (
              <>
                <Btn teal onClick={() => setAdminM({ open: true, mode: "create", initial: null })}>
                  <UserPlus className="w-3 h-3" />Add Admin
                </Btn>
                <Btn onClick={() => setSupportOpen(true)}>
                  <Key className="w-3 h-3" />Support
                </Btn>
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
                icon={Users} title="No staff members" sub="Add staff to manage lab operations"
                onAdd={() => setStaffM({ open: true, mode: "create", initial: null })} addLabel="Add First Staff"
              />
            ) : (
              staffList.map((s) => (
                <PersonRow key={s._id} person={s} showPerms
                  onEdit={(p) => setStaffM({ open: true, mode: "edit", initial: p })}
                  onToggle={toggleMember} onDelete={deleteMember}
                />
              ))
            ))}
          {tab === "admins" &&
            (membersLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} />)
            ) : adminList.length === 0 ? (
              <EmptyState
                icon={Shield} title="No admins yet" sub="Create an admin or support admin"
                onAdd={() => setAdminM({ open: true, mode: "create", initial: null })} addLabel="Add Admin"
              />
            ) : (
              adminList.map((a) => (
                <PersonRow key={a._id} person={a} showPerms={false}
                  onEdit={a.role !== ROLES.SUPPORT_ADMIN ? (p) => setAdminM({ open: true, mode: "edit", initial: p }) : null}
                  onToggle={toggleMember}
                  onDelete={a.role !== ROLES.SUPPORT_ADMIN ? deleteMember : null}
                />
              ))
            ))}
        </div>
      </div>

      {/* Modals */}
      <EditLabModal  isOpen={editOpen}    onClose={() => setEditOpen(false)}    lab={lab} onSave={saveLabInfo} />
      <BillingModal  isOpen={billingOpen} onClose={() => setBillingOpen(false)} lab={lab} onSave={saveBilling} />
      <SupportModal  isOpen={supportOpen} onClose={() => setSupportOpen(false)} onSave={createSupport} />
      <StaffModal
        isOpen={staffM.open} onClose={() => setStaffM((f) => ({ ...f, open: false }))}
        onSave={staffM.mode === "create" ? createStaff : updateStaff}
        initial={staffM.initial} mode={staffM.mode}
      />
      <AdminModal
        isOpen={adminM.open} onClose={() => setAdminM((f) => ({ ...f, open: false }))}
        onSave={adminM.mode === "create" ? createAdmin : updateAdmin}
        initial={adminM.initial} mode={adminM.mode}
      />
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const LabManagement = () => {
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [popup, setPopup]       = useState({ open: false, type: "success", message: "", onConfirm: null });
  const debounce                = useRef(null);

  const showPopup  = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

  const search = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const r = await labService.getLabs({ page: 1, limit: 20, labID: q.trim() });
      const d = r.data;
      setResults(Array.isArray(d) ? d : (d.data ?? []));
    } catch { showPopup("error", "Search failed."); }
    finally { setLoading(false); }
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
        const r2 = await labService.getLabs({ page: 1, limit: 20, labID: query.trim() });
        const d  = r2.data;
        setResults(Array.isArray(d) ? d : (d.data ?? []));
      }
    } catch {}
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center shrink-0">
          <UserCog className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Lab Management</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Search a lab to manage staff, admins &amp; billing</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="shrink-0">
            {loading
              ? <RefreshCw className="w-4 h-4 text-teal-500 animate-spin" />
              : <Search    className="w-4 h-4 text-slate-400" />}
          </div>
          <input
            type="text"
            placeholder="Type a Lab ID to search…"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-sm text-slate-800 placeholder-slate-300 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setSearched(false); setSelected(null); }}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!searched && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
            <Search className="w-4 h-4" />
            <span className="text-xs">Enter a Lab ID to begin</span>
          </div>
        )}
        {searched && loading && (
          <div className="divide-y divide-slate-50">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-7 h-7 bg-slate-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        )}
        {searched && !loading && results.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">No labs found for &ldquo;{query}&rdquo;</span>
          </div>
        )}
        {searched && !loading && results.length > 0 && (
          <div className="divide-y divide-slate-50">
            {results.map((lab) => {
              const active = selected?._id === lab._id;
              return (
                <button
                  key={lab._id}
                  onClick={() => setSelected(active ? null : lab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${active ? "bg-teal-50" : "hover:bg-slate-50"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${active ? "bg-teal-100 border-teal-200" : lab.isActive ? "bg-teal-50 border-teal-100" : "bg-slate-100 border-slate-200"}`}>
                    <FlaskConical className={`w-3.5 h-3.5 ${active ? "text-teal-600" : lab.isActive ? "text-teal-500" : "text-slate-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-teal-700" : "text-slate-700"}`}>{lab.name}</p>
                    <p className={`text-[11px] font-mono ${active ? "text-teal-400" : "text-slate-400"}`}>#{lab.labID}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge active={lab.isActive} />
                    {active
                      ? <X className="w-3.5 h-3.5 text-teal-400" />
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
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