import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  FlaskConical,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  ToggleLeft,
  ToggleRight,
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
} from "lucide-react";

import Modal from "../../components/modal";
import Popup from "../../components/popup";
import labService from "../../api/labService";
import staffService from "../../api/staffService";
import kingoService from "../../api/kingoService";

// ── Permissions ───────────────────────────────────────────────────────────────
const PERMISSIONS = [
  { key: "createInvoice", label: "Create Invoice" },
  { key: "editInvoice", label: "Edit Invoice" },
  { key: "deleteInvoice", label: "Delete Invoice" },
  { key: "cashmemo", label: "Cash Memo" },
  { key: "uploadReport", label: "Upload Report" },
  { key: "downloadReport", label: "Download Report" },
];

const DEFAULT_PERMISSIONS = {
  createInvoice: false,
  editInvoice: false,
  deleteInvoice: false,
  cashmemo: false,
  uploadReport: false,
  downloadReport: false,
};

// ── Shared primitives ─────────────────────────────────────────────────────────
const DarkInput = ({ label, ...props }) => (
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

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
      active
        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
        : "bg-[#f0f1f3] text-[#8a909e] border border-[#e2e5eb]"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-[#c0c5d0]"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

const ModalHeader = ({ icon: Icon, title, subtitle, onClose }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8eaed]">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-[#1a1c20] rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="font-bold text-[#1a1c20] text-sm tracking-tight">{title}</p>
        {subtitle && <p className="text-[11px] text-[#8a909e]">{subtitle}</p>}
      </div>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8a909e] hover:bg-[#f0f1f3] transition"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

const ModalFooter = ({ onClose, loading, submitLabel }) => (
  <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#e8eaed] bg-[#f7f8fa]/60">
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
      className="px-5 py-2 text-xs font-bold text-white bg-[#1a1c20] hover:bg-[#252830] rounded-lg disabled:opacity-60 transition flex items-center gap-2"
    >
      {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {submitLabel}
    </button>
  </div>
);

// ── Billing Modal ─────────────────────────────────────────────────────────────
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
      await onSave({
        perInvoiceFee: Number(form.perInvoiceFee),
        monthlyFee: Number(form.monthlyFee),
        commission: Number(form.commission),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <ModalHeader icon={CreditCard} title="Edit Billing" subtitle={lab?.name} onClose={onClose} />
        <div className="px-5 py-5 space-y-4">
          <DarkInput
            label="Per Invoice Fee (৳)"
            type="number"
            value={form.perInvoiceFee}
            onChange={(e) => setForm((f) => ({ ...f, perInvoiceFee: e.target.value }))}
            placeholder="0"
            min="0"
          />
          <DarkInput
            label="Monthly Fee (৳)"
            type="number"
            value={form.monthlyFee}
            onChange={(e) => setForm((f) => ({ ...f, monthlyFee: e.target.value }))}
            placeholder="0"
            min="0"
          />
          <DarkInput
            label="Commission (%)"
            type="number"
            value={form.commission}
            onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
            placeholder="0"
            min="0"
          />
          <div className="grid grid-cols-3 gap-px bg-[#e2e5eb] rounded-xl overflow-hidden border border-[#e2e5eb]">
            {[
              { label: "Invoice", value: `৳${form.perInvoiceFee || 0}` },
              { label: "Monthly", value: `৳${form.monthlyFee || 0}` },
              { label: "Comm.", value: `${form.commission || 0}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#f7f8fa] text-center py-3">
                <p className="text-[9px] text-[#8a909e] font-bold uppercase tracking-widest">{label}</p>
                <p className="text-sm font-black text-[#1a1c20] mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <ModalFooter onClose={onClose} loading={loading} submitLabel="Save Billing" />
      </form>
    </Modal>
  );
};

// ── Support Admin Modal (password only) ───────────────────────────────────────
const SupportAdminModal = ({ isOpen, onClose, onSave }) => {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShow(false);
    }
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(password);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <ModalHeader
          icon={Key}
          title="Set Support Admin Password"
          subtitle="One support admin allowed globally"
          onClose={onClose}
        />
        <div className="px-5 py-6">
          <label className="block text-[10px] font-bold text-[#4a5060] uppercase tracking-widest mb-1.5">
            Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              autoFocus
              className="w-full px-3 py-3 pr-10 text-sm rounded-lg border border-[#d0d4dc] bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#1a1c20]/10 focus:border-[#1a1c20] focus:bg-white transition-all placeholder-[#b0b6c2] text-[#1a1c20] text-base tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a909e] hover:text-[#1a1c20] transition"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#8a909e]">
            Username will be set to <span className="font-mono font-bold text-[#3a3d45]">supportadmin</span>{" "}
            automatically.
          </p>
        </div>
        <ModalFooter onClose={onClose} loading={loading} submitLabel="Create Support Admin" />
      </form>
    </Modal>
  );
};

// ── Admin Modal ───────────────────────────────────────────────────────────────
const AdminModal = ({ isOpen, onClose, onSave, initial, mode }) => {
  const EMPTY = { name: "", username: "", email: "", phone: "" };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(initial ? { ...initial } : EMPTY);
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
        <ModalHeader
          icon={Shield}
          title={mode === "create" ? "Add Admin" : "Edit Admin"}
          subtitle="Lab administrator account"
          onClose={onClose}
        />
        <div className="px-5 py-5 space-y-4">
          <DarkInput label="Full Name *" value={form.name} onChange={set("name")} placeholder="Jane Admin" required />
          <DarkInput
            label="Username *"
            value={form.username}
            onChange={set("username")}
            placeholder="janeadmin"
            required={mode === "create"}
          />
          <DarkInput
            label="Email *"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="admin@lab.com"
            required
          />
          <DarkInput label="Phone *" value={form.phone} onChange={set("phone")} placeholder="01700000000" required />
        </div>
        <ModalFooter
          onClose={onClose}
          loading={loading}
          submitLabel={mode === "create" ? "Add Admin" : "Save Changes"}
        />
      </form>
    </Modal>
  );
};

// ── Staff Modal ───────────────────────────────────────────────────────────────
const StaffModal = ({ isOpen, onClose, onSave, initial, mode }) => {
  const EMPTY = {
    name: "",
    username: "",
    email: "",
    mobileNumber: "",
    permissions: { ...DEFAULT_PERMISSIONS },
    isActive: true,
  };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen)
      setForm(initial ? { ...initial, permissions: { ...DEFAULT_PERMISSIONS, ...initial.permissions } } : EMPTY);
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
        <ModalHeader
          icon={UserPlus}
          title={mode === "create" ? "Add Staff Member" : "Edit Staff"}
          subtitle="Fill in details and set permissions"
          onClose={onClose}
        />
        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DarkInput label="Full Name *" value={form.name} onChange={set("name")} placeholder="John Doe" required />
            <DarkInput
              label="Username *"
              value={form.username}
              onChange={set("username")}
              placeholder="johndoe"
              required
            />
            <DarkInput
              label="Email *"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="john@lab.com"
              required
            />
            <DarkInput
              label="Mobile *"
              value={form.mobileNumber}
              onChange={set("mobileNumber")}
              placeholder="01700000000"
              required
            />
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

          <div>
            <label className="block text-[10px] font-bold text-[#4a5060] uppercase tracking-widest mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERMISSIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePerm(key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                    form.permissions[key]
                      ? "bg-[#1a1c20] text-white border-[#1a1c20]"
                      : "bg-white text-[#6a707e] border-[#d0d4dc] hover:border-[#1a1c20]/30 hover:bg-[#f7f8fa]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      form.permissions[key] ? "border-white bg-white/20" : "border-[#c0c5d0]"
                    }`}
                  >
                    {form.permissions[key] && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter
          onClose={onClose}
          loading={loading}
          submitLabel={mode === "create" ? "Add Staff" : "Save Changes"}
        />
      </form>
    </Modal>
  );
};

// ── Person Row ────────────────────────────────────────────────────────────────
const PersonRow = ({ person, onEdit, onToggle, onDelete, showPerms }) => (
  <div className="group bg-white border border-[#e2e5eb] rounded-xl px-4 py-3 hover:border-[#c8ccd4] hover:shadow-sm transition-all">
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs mt-0.5 ${
          person.isActive ? "bg-[#1a1c20] text-white" : "bg-[#f0f1f3] text-[#8a909e]"
        }`}
      >
        {(person.name || "?")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-[#1a1c20] tracking-tight">{person.name}</p>
          {person.role === "supportAdmin" && (
            <span className="text-[9px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full uppercase tracking-wider">
              Support
            </span>
          )}
          <StatusBadge active={person.isActive} />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {person.username && (
            <div className="flex items-center gap-1">
              <Hash className="w-2.5 h-2.5 text-[#b0b6c2] shrink-0" />
              <span className="text-[11px] text-[#8a909e] font-mono">{person.username}</span>
            </div>
          )}
          {person.email && person.email !== "supportadmin@system" && (
            <div className="flex items-center gap-1 min-w-0">
              <Mail className="w-2.5 h-2.5 text-[#b0b6c2] shrink-0" />
              <span className="text-[11px] text-[#8a909e] truncate">{person.email}</span>
            </div>
          )}
          {(person.phone || person.mobileNumber) && person.phone !== "-" && (
            <div className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 text-[#b0b6c2] shrink-0" />
              <span className="text-[11px] text-[#8a909e]">{person.phone || person.mobileNumber}</span>
            </div>
          )}
        </div>
        {showPerms && person.permissions && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {PERMISSIONS.filter((p) => person.permissions[p.key]).map((p) => (
              <span
                key={p.key}
                className="text-[9px] font-semibold px-1.5 py-0.5 bg-[#f0f1f3] text-[#6a707e] border border-[#e2e5eb] rounded-md"
              >
                {p.label}
              </span>
            ))}
            {PERMISSIONS.filter((p) => person.permissions[p.key]).length === 0 && (
              <span className="text-[9px] text-[#b0b6c2] italic">No permissions</span>
            )}
          </div>
        )}
      </div>
      {/* Actions — always visible on mobile, hover on desktop */}
      <div className="flex items-center gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(person)}
            className="p-1.5 rounded-lg text-[#6a707e] hover:bg-[#f0f1f3] hover:text-[#1a1c20] transition"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onToggle(person)}
          className={`p-1.5 rounded-lg transition ${person.isActive ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"}`}
          title={person.isActive ? "Deactivate" : "Activate"}
        >
          {person.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(person)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="bg-white border border-[#e2e5eb] rounded-xl px-4 py-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#f0f1f3] rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[#f0f1f3] rounded w-1/3" />
        <div className="h-2.5 bg-[#f0f1f3] rounded w-1/2" />
      </div>
    </div>
  </div>
);

// ── Lab Detail Panel ──────────────────────────────────────────────────────────
const LabDetailPanel = ({ lab, onLabUpdated, showPopup, onBack }) => {
  const [staff, setStaff] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("staff");
  const [billingModal, setBillingModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [staffModal, setStaffModal] = useState({ open: false, mode: "create", initial: null });
  const [adminModal, setAdminModal] = useState({ open: false, mode: "create", initial: null });

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const res = await staffService.getStaff(lab._id);
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch {
      showPopup("error", "Failed to load staff.");
    } finally {
      setStaffLoading(false);
    }
  }, [lab._id]);

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const res = await kingoService.getAll();
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch {
      showPopup("error", "Failed to load admins.");
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchAdmins();
  }, [fetchStaff, fetchAdmins]);

  // Billing
  const handleSaveBilling = async (billing) => {
    try {
      await labService.updateLabBilling(lab._id, billing);
      showPopup("success", "Billing updated!");
      onLabUpdated();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to update billing.");
      throw err;
    }
  };

  // Lab toggle
  const handleToggleLab = () =>
    showPopup("warning", `${lab.isActive ? "Deactivate" : "Activate"} "${lab.name}"?`, async () => {
      try {
        lab.isActive ? await labService.deactivateLab(lab._id) : await labService.activateLab(lab._id);
        showPopup("success", `Lab ${lab.isActive ? "deactivated" : "activated"}!`);
        onLabUpdated();
      } catch {
        showPopup("error", "Failed to update status.");
      }
    });

  // Staff
  const handleCreateStaff = async (form) => {
    try {
      await staffService.createStaff(lab._id, form);
      showPopup("success", "Staff added!");
      fetchStaff();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to add staff.");
      throw err;
    }
  };
  const handleUpdateStaff = async (form) => {
    try {
      await staffService.updateStaff(staffModal.initial._id, form);
      showPopup("success", "Staff updated!");
      fetchStaff();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed to update staff.");
      throw err;
    }
  };
  const handleToggleStaff = (p) =>
    showPopup("warning", `${p.isActive ? "Deactivate" : "Activate"} "${p.name}"?`, async () => {
      try {
        p.isActive ? await staffService.deactivateStaff(p._id) : await staffService.activateStaff(p._id);
        showPopup("success", `Staff ${p.isActive ? "deactivated" : "activated"}!`);
        fetchStaff();
      } catch {
        showPopup("error", "Failed.");
      }
    });
  const handleDeleteStaff = (p) =>
    showPopup("warning", `Delete "${p.name}"?`, async () => {
      try {
        await staffService.deleteStaff(p._id);
        showPopup("success", "Staff deleted!");
        fetchStaff();
      } catch {
        showPopup("error", "Failed to delete.");
      }
    });

  // Admins
  const handleCreateAdmin = async (form) => {
    try {
      await kingoService.create(form);
      showPopup("success", "Admin created!");
      fetchAdmins();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed.");
      throw err;
    }
  };
  const handleUpdateAdmin = async (form) => {
    try {
      await kingoService.update(adminModal.initial._id, form);
      showPopup("success", "Admin updated!");
      fetchAdmins();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed.");
      throw err;
    }
  };
  const handleCreateSupport = async (password) => {
    try {
      await kingoService.createSupport(password);
      showPopup("success", "Support admin created!");
      fetchAdmins();
    } catch (err) {
      showPopup("error", err?.response?.data?.message || "Failed.");
      throw err;
    }
  };
  const handleToggleAdmin = (p) =>
    showPopup("warning", `${p.isActive ? "Deactivate" : "Activate"} "${p.name}"?`, async () => {
      try {
        p.isActive ? await kingoService.deactivate(p._id) : await kingoService.activate(p._id);
        showPopup("success", `Admin ${p.isActive ? "deactivated" : "activated"}!`);
        fetchAdmins();
      } catch {
        showPopup("error", "Failed.");
      }
    });
  const handleDeleteAdmin = (p) =>
    showPopup("warning", `Delete admin "${p.name}"?`, async () => {
      try {
        await kingoService.delete(p._id);
        showPopup("success", "Admin deleted!");
        fetchAdmins();
      } catch {
        showPopup("error", "Failed.");
      }
    });

  const tabs = [
    { id: "staff", label: "Staff", icon: Users, count: staff.length },
    { id: "admins", label: "Admins", icon: Shield, count: admins.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Back button — mobile only */}
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden flex items-center gap-2 text-xs font-bold text-[#6a707e] hover:text-[#1a1c20] transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to results
        </button>
      )}

      {/* Lab header card */}
      <div className="bg-white border border-[#e2e5eb] rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                lab.isActive ? "bg-[#1a1c20]" : "bg-[#f0f1f3] border border-[#e2e5eb]"
              }`}
            >
              <FlaskConical className={`w-4 h-4 sm:w-5 sm:h-5 ${lab.isActive ? "text-white" : "text-[#8a909e]"}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-[#1a1c20] tracking-tight">{lab.name}</h2>
                <StatusBadge active={lab.isActive} />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Hash className="w-3 h-3 text-[#b0b6c2]" />
                <span className="text-xs font-mono font-bold text-[#8a909e] tracking-wider">{lab.labID}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setBillingModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#1a1c20] bg-[#f0f1f3] hover:bg-[#e5e7eb] border border-[#d8dce4] rounded-lg transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Billing</span>
              <span className="sm:hidden">Billing</span>
            </button>
            <button
              onClick={handleToggleLab}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition ${
                lab.isActive
                  ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100"
                  : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100"
              }`}
            >
              {lab.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
              {lab.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* Billing strip */}
        <div className="grid grid-cols-3 gap-px bg-[#e2e5eb] rounded-xl overflow-hidden border border-[#e2e5eb] mt-4">
          {[
            { label: "Invoice", value: `৳${lab.billing?.perInvoiceFee ?? 0}` },
            { label: "Monthly", value: `৳${lab.billing?.monthlyFee ?? 0}` },
            { label: "Comm.", value: `${lab.billing?.commission ?? 0}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#f7f8fa] text-center py-3">
              <p className="text-[9px] text-[#8a909e] font-bold uppercase tracking-widest">{label}</p>
              <p className="text-sm font-black text-[#1a1c20] mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        {(lab.contact?.primary || lab.contact?.publicEmail || lab.contact?.district) && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[#f0f1f3]">
            {lab.contact?.primary && (
              <div className="flex items-center gap-1.5 text-xs text-[#6a707e]">
                <Phone className="w-3 h-3 text-[#b0b6c2]" /> {lab.contact.primary}
              </div>
            )}
            {lab.contact?.publicEmail && (
              <div className="flex items-center gap-1.5 text-xs text-[#6a707e] min-w-0">
                <Mail className="w-3 h-3 text-[#b0b6c2] shrink-0" />
                <span className="truncate">{lab.contact.publicEmail}</span>
              </div>
            )}
            {lab.contact?.district && (
              <div className="flex items-center gap-1.5 text-xs text-[#6a707e]">
                <span className="text-[#b0b6c2]">📍</span>
                {[lab.contact.district, lab.contact.zone].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#e2e5eb] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3 border-b border-[#e8eaed] gap-2 flex-wrap">
          <div className="flex gap-1">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 -mb-px transition-all ${
                  activeTab === id
                    ? "border-[#1a1c20] text-[#1a1c20] bg-[#f7f8fa]"
                    : "border-transparent text-[#8a909e] hover:text-[#3a3d45]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === id ? "bg-[#1a1c20] text-white" : "bg-[#f0f1f3] text-[#8a909e]"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 pb-2">
            {activeTab === "staff" && (
              <button
                onClick={() => setStaffModal({ open: true, mode: "create", initial: null })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1a1c20] hover:bg-[#252830] rounded-lg transition"
              >
                <Plus className="w-3 h-3" /> <span className="hidden sm:inline">Add</span> Staff
              </button>
            )}
            {activeTab === "admins" && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => setAdminModal({ open: true, mode: "create", initial: null })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1a1c20] hover:bg-[#252830] rounded-lg transition"
                >
                  <UserPlus className="w-3 h-3" /> <span className="hidden sm:inline">Add</span> Admin
                </button>
                <button
                  onClick={() => setSupportModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1a1c20] bg-[#f0f1f3] hover:bg-[#e5e7eb] border border-[#d8dce4] rounded-lg transition"
                >
                  <Key className="w-3 h-3" /> <span className="hidden sm:inline">Support</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {activeTab === "staff" && (
            <>
              {staffLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : staff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-11 h-11 bg-[#f7f8fa] border-2 border-dashed border-[#d0d4dc] rounded-xl flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-[#c0c5d0]" />
                  </div>
                  <p className="text-sm font-bold text-[#3a3d45] mb-1">No staff members</p>
                  <p className="text-xs text-[#8a909e] mb-4">Add staff to manage lab operations</p>
                  <button
                    onClick={() => setStaffModal({ open: true, mode: "create", initial: null })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#1a1c20] rounded-lg hover:bg-[#252830] transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add First Staff
                  </button>
                </div>
              ) : (
                staff.map((s) => (
                  <PersonRow
                    key={s._id}
                    person={s}
                    showPerms
                    onEdit={(p) => setStaffModal({ open: true, mode: "edit", initial: p })}
                    onToggle={handleToggleStaff}
                    onDelete={handleDeleteStaff}
                  />
                ))
              )}
            </>
          )}
          {activeTab === "admins" && (
            <>
              {adminsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : admins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-11 h-11 bg-[#f7f8fa] border-2 border-dashed border-[#d0d4dc] rounded-xl flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5 text-[#c0c5d0]" />
                  </div>
                  <p className="text-sm font-bold text-[#3a3d45] mb-1">No admins yet</p>
                  <p className="text-xs text-[#8a909e] mb-4">Create an admin or support admin</p>
                  <button
                    onClick={() => setAdminModal({ open: true, mode: "create", initial: null })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#1a1c20] rounded-lg hover:bg-[#252830] transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Admin
                  </button>
                </div>
              ) : (
                admins.map((a) => (
                  <PersonRow
                    key={a._id}
                    person={a}
                    showPerms={false}
                    onEdit={
                      a.role !== "supportAdmin" ? (p) => setAdminModal({ open: true, mode: "edit", initial: p }) : null
                    }
                    onToggle={handleToggleAdmin}
                    onDelete={a.role !== "supportAdmin" ? handleDeleteAdmin : null}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <BillingModal isOpen={billingModal} onClose={() => setBillingModal(false)} lab={lab} onSave={handleSaveBilling} />
      <SupportAdminModal isOpen={supportModal} onClose={() => setSupportModal(false)} onSave={handleCreateSupport} />
      <StaffModal
        isOpen={staffModal.open}
        onClose={() => setStaffModal((f) => ({ ...f, open: false }))}
        onSave={staffModal.mode === "create" ? handleCreateStaff : handleUpdateStaff}
        initial={staffModal.initial}
        mode={staffModal.mode}
      />
      <AdminModal
        isOpen={adminModal.open}
        onClose={() => setAdminModal((f) => ({ ...f, open: false }))}
        onSave={adminModal.mode === "create" ? handleCreateAdmin : handleUpdateAdmin}
        initial={adminModal.initial}
        mode={adminModal.mode}
      />
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const LabManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });
  const debounceRef = useRef(null);

  // On mobile we show either search panel OR detail panel
  const showDetail = !!selectedLab;

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

  const searchLabs = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const res = await labService.getLabs({ page: 1, limit: 20, labID: q.trim() });
      const d = res.data;
      setSearchResults(Array.isArray(d) ? d : (d.data ?? []));
    } catch {
      showPopup("error", "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLabs(val), 400);
  };

  const handleSelectLab = (lab) => setSelectedLab(lab);

  const handleLabUpdated = useCallback(async () => {
    if (!selectedLab) return;
    try {
      const res = await labService.getLabById(selectedLab._id);
      setSelectedLab(res.data);
      if (searchQuery.trim()) {
        const r = await labService.getLabs({ page: 1, limit: 20, labID: searchQuery.trim() });
        const d = r.data;
        setSearchResults(Array.isArray(d) ? d : (d.data ?? []));
      }
    } catch {
      /* silent */
    }
  }, [selectedLab, searchQuery]);

  // Search panel — shared between mobile and desktop
  const SearchPanel = (
    <div className="flex flex-col gap-3 h-full">
      {/* Search input */}
      <div className="relative">
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
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#d0d4dc] bg-white text-sm text-[#1a1c20] placeholder-[#b0b6c2] focus:outline-none focus:ring-2 focus:ring-[#1a1c20]/10 focus:border-[#1a1c20] transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setHasSearched(false);
              setSelectedLab(null);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md text-[#8a909e] hover:text-[#1a1c20] hover:bg-[#f0f1f3] transition"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-12 h-12 bg-[#f7f8fa] border-2 border-dashed border-[#d0d4dc] rounded-2xl flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-[#c0c5d0]" />
            </div>
            <p className="text-xs font-bold text-[#3a3d45] mb-1">Search for a lab</p>
            <p className="text-[11px] text-[#8a909e]">Enter a Lab ID to find and manage</p>
          </div>
        )}
        {hasSearched && !searchLoading && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <AlertCircle className="w-8 h-8 text-[#c0c5d0] mb-3" />
            <p className="text-xs font-bold text-[#3a3d45]">No labs found</p>
            <p className="text-[11px] text-[#8a909e] mt-1">Try a different Lab ID</p>
          </div>
        )}
        {searchLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e2e5eb] rounded-xl px-4 py-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#f0f1f3] rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-[#f0f1f3] rounded w-2/3" />
                  <div className="h-2.5 bg-[#f0f1f3] rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        {!searchLoading &&
          searchResults.map((lab) => (
            <button
              key={lab._id}
              onClick={() => handleSelectLab(lab)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                selectedLab?._id === lab._id
                  ? "bg-[#1a1c20] border-[#1a1c20] shadow-md"
                  : "bg-white border-[#e2e5eb] hover:border-[#c8ccd4] hover:shadow-sm"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedLab?._id === lab._id ? "bg-white/10" : lab.isActive ? "bg-[#1a1c20]" : "bg-[#f0f1f3]"
                }`}
              >
                <FlaskConical
                  className={`w-3.5 h-3.5 ${
                    selectedLab?._id === lab._id ? "text-white" : lab.isActive ? "text-white" : "text-[#8a909e]"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate tracking-tight ${selectedLab?._id === lab._id ? "text-white" : "text-[#1a1c20]"}`}
                >
                  {lab.name}
                </p>
                <div className="flex items-center gap-1">
                  <Hash
                    className={`w-2.5 h-2.5 shrink-0 ${selectedLab?._id === lab._id ? "text-white/40" : "text-[#b0b6c2]"}`}
                  />
                  <span
                    className={`text-[11px] font-mono font-semibold ${selectedLab?._id === lab._id ? "text-white/60" : "text-[#8a909e]"}`}
                  >
                    {lab.labID}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 ${selectedLab?._id === lab._id ? "text-white/40" : "text-[#c0c5d0]"}`}
              />
            </button>
          ))}
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#1a1c20] rounded-2xl flex items-center justify-center shadow-md shadow-black/10">
          <UserCog className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#1a1c20] tracking-tight leading-none">Lab Management</h1>
          <p className="text-xs text-[#8a909e] mt-0.5">Search a lab by ID to manage staff, admins & billing</p>
        </div>
      </div>

      {/* ── Mobile: stacked ── */}
      <div className="lg:hidden">
        {!showDetail ? (
          SearchPanel
        ) : (
          <LabDetailPanel
            key={selectedLab._id}
            lab={selectedLab}
            onLabUpdated={handleLabUpdated}
            showPopup={showPopup}
            onBack={() => setSelectedLab(null)}
          />
        )}
      </div>

      {/* ── Desktop: side by side ── */}
      <div className="hidden lg:flex gap-5 h-[calc(100vh-200px)] min-h-[520px]">
        {/* Left panel */}
        <div className="w-72 shrink-0 flex flex-col">{SearchPanel}</div>

        {/* Right panel */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {!selectedLab ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-[#f7f8fa] border-2 border-dashed border-[#d0d4dc] rounded-2xl flex items-center justify-center mb-5">
                <FlaskConical className="w-7 h-7 text-[#c0c5d0]" />
              </div>
              <p className="text-sm font-bold text-[#3a3d45] mb-1.5">Select a lab to manage</p>
              <p className="text-xs text-[#8a909e] max-w-xs">
                Search by Lab ID on the left, then click a result to view staff, admins, billing and more.
              </p>
            </div>
          ) : (
            <LabDetailPanel
              key={selectedLab._id}
              lab={selectedLab}
              onLabUpdated={handleLabUpdated}
              showPopup={showPopup}
            />
          )}
        </div>
      </div>

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
