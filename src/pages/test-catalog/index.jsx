import { useEffect, useState, useRef } from "react";
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Wifi,
  WifiOff,
  Tag,
  Layers,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  AlertCircle,
  Hash,
} from "lucide-react";
import Modal from "../../components/modal";
import Popup from "../../components/popup";
import testService from "../../api/testService";
import categoryService from "../../api/categoryService";

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

const Btn = ({ teal, danger, children, className = "", ...props }) => (
  <button
    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
      teal
        ? "text-teal-600 border-teal-300 hover:bg-teal-50 hover:border-teal-400"
        : danger
          ? "text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
          : "text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

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
    <button
      onClick={onClose}
      className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 transition"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

const MFoot = ({ onClose, loading, label }) => (
  <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
    <Btn type="button" onClick={onClose}>
      Cancel
    </Btn>
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    teal: { bg: "bg-teal-50", border: "border-teal-100", icon: "text-teal-500", val: "text-teal-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-500", val: "text-emerald-700" },
    slate: { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-400", val: "text-slate-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-500", val: "text-amber-700" },
    violet: { bg: "bg-violet-50", border: "border-violet-100", icon: "text-violet-500", val: "text-violet-700" },
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
      </div>
    </div>
  );
};

// ── Category Modal ────────────────────────────────────────────────────────────
const CategoryModal = ({ isOpen, onClose, onSave, initial, mode }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setName(initial?.name ?? "");
  }, [isOpen, initial]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ name });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead
          icon={Tag}
          title={mode === "create" ? "Add Category" : "Edit Category"}
          sub="Test grouping"
          onClose={onClose}
        />
        <div className="px-5 py-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Haematology"
            autoFocus
          />
        </div>
        <MFoot onClose={onClose} loading={loading} label={mode === "create" ? "Add Category" : "Save Changes"} />
      </form>
    </Modal>
  );
};

// ── Test Modal ────────────────────────────────────────────────────────────────
const TestModal = ({ isOpen, onClose, onSave, initial, mode, categories, defaultCategoryId }) => {
  const EMPTY = { name: "", categoryId: "", schemaId: "" };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? { name: initial.name, categoryId: initial.categoryId ?? "", schemaId: initial.schemaId ?? "" }
          : { ...EMPTY, categoryId: defaultCategoryId ?? "" },
      );
    }
  }, [isOpen, initial, defaultCategoryId]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: form.name,
        categoryId: form.categoryId,
        schemaId: form.schemaId?.trim() || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <MHead
          icon={FlaskConical}
          title={mode === "create" ? "Add Test" : "Edit Test"}
          sub="Test catalog entry"
          onClose={onClose}
        />
        <div className="px-5 py-4 space-y-3">
          <Input
            label="Test Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. CBC"
            autoFocus
          />
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-400/20 transition-all overflow-hidden">
            <span className="px-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap border-r border-slate-200 bg-slate-100 self-stretch flex items-center min-w-[90px]">
              Category<span className="text-red-400 ml-0.5">*</span>
            </span>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="flex-1 px-3 py-2 text-sm bg-transparent text-slate-800 focus:outline-none"
            >
              <option value="">— Select —</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Schema ID"
            value={form.schemaId}
            onChange={(e) => setForm((f) => ({ ...f, schemaId: e.target.value }))}
            placeholder="Leave empty for offline"
          />
          <p className="text-[10px] text-slate-400 -mt-1 pl-1">
            A Schema ID marks this test as <span className="font-semibold text-emerald-600">online</span>. Leave empty
            for <span className="font-semibold text-slate-500">offline</span>.
          </p>
        </div>
        <MFoot onClose={onClose} loading={loading} label={mode === "create" ? "Add Test" : "Save Changes"} />
      </form>
    </Modal>
  );
};

// ── Test Row ──────────────────────────────────────────────────────────────────
const TestRow = ({ test, onEdit, onDelete }) => {
  const online = !!test.schemaId;
  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-100 bg-white hover:border-teal-200 hover:bg-teal-50/20 transition-all">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${online ? "bg-emerald-500" : "bg-slate-300"}`} />
      <p className="flex-1 text-sm text-slate-700 font-semibold truncate">{test.name}</p>
      {test.schemaId && (
        <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-300 truncate max-w-[120px]">
          <Hash className="w-2.5 h-2.5 shrink-0" />
          {test.schemaId.slice(-8)}
        </span>
      )}
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
          online ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
        }`}
      >
        {online ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
        {online ? "Online" : "Offline"}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(test)}
          className="p-1.5 rounded-md text-slate-400 hover:bg-white hover:text-slate-700 hover:border hover:border-slate-200 transition"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(test)}
          className="p-1.5 rounded-md text-slate-300 hover:bg-white hover:text-red-400 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ── Category Block ────────────────────────────────────────────────────────────
const CategoryBlock = ({ category, tests, onAddTest, onEditTest, onDeleteTest, onEditCategory, onDeleteCategory }) => {
  const [open, setOpen] = useState(true);
  const online = tests.filter((t) => !!t.schemaId).length;
  const offline = tests.length - online;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-all select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
          {open ? (
            <FolderOpen className="w-3.5 h-3.5 text-teal-600" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-teal-500" />
          )}
        </div>
        <p className="flex-1 text-sm font-bold text-slate-700 tracking-tight">{category.name}</p>

        {/* chips */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            {tests.length} test{tests.length !== 1 ? "s" : ""}
          </span>
          {online > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
              <Wifi className="w-2.5 h-2.5" />
              {online}
            </span>
          )}
          {offline > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-200 flex items-center gap-1">
              <WifiOff className="w-2.5 h-2.5" />
              {offline}
            </span>
          )}
        </div>

        {/* actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Btn teal onClick={() => onAddTest(category._id)}>
            <Plus className="w-3 h-3" />
            Add Test
          </Btn>
          <button
            onClick={() => onEditCategory(category)}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteCategory(category)}
            className="p-1.5 rounded-md text-slate-300 hover:bg-slate-100 hover:text-red-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </div>

      {/* Test list */}
      {open && (
        <div className="border-t border-slate-100 p-3 space-y-1.5 bg-slate-50/50">
          {tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FlaskConical className="w-5 h-5 text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">No tests yet</p>
              <button
                onClick={() => onAddTest(category._id)}
                className="mt-2 text-[11px] font-semibold text-teal-500 hover:text-teal-700 transition"
              >
                + Add first test
              </button>
            </div>
          ) : (
            tests.map((t) => <TestRow key={t._id} test={t} onEdit={onEditTest} onDelete={onDeleteTest} />)
          )}
        </div>
      )}
    </div>
  );
};

// ── Uncategorized Block ───────────────────────────────────────────────────────
const UncategorizedBlock = ({ tests, onEditTest, onDeleteTest }) => {
  const [open, setOpen] = useState(true);
  if (tests.length === 0) return null;

  return (
    <div className="border border-dashed border-amber-200 rounded-xl overflow-hidden bg-amber-50/30">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-amber-50/50 transition select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="flex-1 text-sm font-bold text-amber-700">Uncategorized</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
          {tests.length} test{tests.length !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </div>
      {open && (
        <div className="border-t border-amber-100 p-3 space-y-1.5 bg-white/60">
          {tests.map((t) => (
            <TestRow key={t._id} test={t} onEdit={onEditTest} onDelete={onDeleteTest} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonBlock = () => (
  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white animate-pulse">
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-7 h-7 bg-slate-100 rounded-lg shrink-0" />
      <div className="flex-1 h-3 bg-slate-100 rounded w-1/4" />
      <div className="w-16 h-5 bg-slate-100 rounded-full" />
    </div>
    <div className="border-t border-slate-100 p-3 space-y-1.5 bg-slate-50/50">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-100 bg-white">
          <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
          <div className="flex-1 h-3 bg-slate-100 rounded w-1/3" />
          <div className="w-14 h-4 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const TestCatalog = () => {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });

  // modals
  const [catM, setCatM] = useState({ open: false, mode: "create", initial: null });
  const [testM, setTestM] = useState({ open: false, mode: "create", initial: null, defaultCategoryId: null });

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([categoryService.getAll(), testService.getAll()]);
      setCategories(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data ?? []));
      setTests(Array.isArray(tRes.data) ? tRes.data : (tRes.data?.data ?? []));
    } catch {
      showPopup("error", "Failed to load catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const catIds = new Set(categories.map((c) => c._id));
  const q = search.trim().toLowerCase();
  const filtered = q ? tests.filter((t) => t.name.toLowerCase().includes(q)) : tests;

  const totalOnline = tests.filter((t) => !!t.schemaId).length;
  const totalOffline = tests.length - totalOnline;

  const testsByCategory = (catId) => filtered.filter((t) => t.categoryId === catId);
  const uncategorized = filtered.filter((t) => !t.categoryId || !catIds.has(t.categoryId));

  // ── Category handlers ────────────────────────────────────────────────────
  const saveCategory = async (data) => {
    try {
      if (catM.mode === "create") {
        await categoryService.create(data);
        showPopup("success", "Category added!");
      } else {
        await categoryService.update(catM.initial._id, data);
        showPopup("success", "Category updated!");
      }
      fetchAll();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const deleteCategory = (cat) =>
    showPopup("warning", `Delete category "${cat.name}"? Tests will become uncategorized.`, async () => {
      try {
        await categoryService.delete(cat._id);
        showPopup("success", "Deleted!");
        fetchAll();
      } catch {
        showPopup("error", "Failed.");
      }
    });

  // ── Test handlers ─────────────────────────────────────────────────────────
  const saveTest = async (data) => {
    try {
      if (testM.mode === "create") {
        await testService.create(data);
        showPopup("success", "Test added!");
      } else {
        await testService.update(testM.initial._id, data);
        showPopup("success", "Test updated!");
      }
      fetchAll();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const deleteTest = (test) =>
    showPopup("warning", `Delete test "${test.name}"?`, async () => {
      try {
        await testService.delete(test._id);
        showPopup("success", "Deleted!");
        fetchAll();
      } catch {
        showPopup("error", "Failed.");
      }
    });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Test Catalog</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Manage test categories and entries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => setCatM({ open: true, mode: "create", initial: null })}>
            <Tag className="w-3.5 h-3.5" />
            Add Category
          </Btn>
          <Btn teal onClick={() => setTestM({ open: true, mode: "create", initial: null, defaultCategoryId: null })}>
            <Plus className="w-3.5 h-3.5" />
            Add Test
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Tag} label="Categories" value={loading ? "—" : categories.length} color="teal" />
        <StatCard icon={Layers} label="Total Tests" value={loading ? "—" : tests.length} color="violet" />
        <StatCard icon={Wifi} label="Online" value={loading ? "—" : totalOnline} color="emerald" />
        <StatCard icon={WifiOff} label="Offline" value={loading ? "—" : totalOffline} color="slate" />
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search tests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonBlock key={i} />)
        ) : categories.length === 0 && tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center mb-3">
              <FlaskConical className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">No catalog yet</p>
            <p className="text-xs text-slate-400 mb-5">Start by adding a category, then add tests under it.</p>
            <Btn teal onClick={() => setCatM({ open: true, mode: "create", initial: null })}>
              <Tag className="w-3.5 h-3.5" />
              Add First Category
            </Btn>
          </div>
        ) : (
          <>
            {categories.map((cat) => (
              <CategoryBlock
                key={cat._id}
                category={cat}
                tests={testsByCategory(cat._id)}
                onAddTest={(catId) => setTestM({ open: true, mode: "create", initial: null, defaultCategoryId: catId })}
                onEditTest={(t) => setTestM({ open: true, mode: "edit", initial: t, defaultCategoryId: null })}
                onDeleteTest={deleteTest}
                onEditCategory={(c) => setCatM({ open: true, mode: "edit", initial: c })}
                onDeleteCategory={deleteCategory}
              />
            ))}
            <UncategorizedBlock
              tests={uncategorized}
              onEditTest={(t) => setTestM({ open: true, mode: "edit", initial: t, defaultCategoryId: null })}
              onDeleteTest={deleteTest}
            />
            {q && filtered.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">No tests match &ldquo;{search}&rdquo;</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={catM.open}
        onClose={() => setCatM((f) => ({ ...f, open: false }))}
        onSave={saveCategory}
        initial={catM.initial}
        mode={catM.mode}
      />
      <TestModal
        isOpen={testM.open}
        onClose={() => setTestM((f) => ({ ...f, open: false }))}
        onSave={saveTest}
        initial={testM.initial}
        mode={testM.mode}
        categories={categories}
        defaultCategoryId={testM.defaultCategoryId}
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

export default TestCatalog;
