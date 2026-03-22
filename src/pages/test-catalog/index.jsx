import { useEffect, useState } from "react";
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  X,
  Wifi,
  WifiOff,
  Tag,
  Layers,
  Search,
  AlertCircle,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import Modal from "../../components/modal";
import Popup from "../../components/popup";
import testService from "../../api/testService";
import categoryService from "../../api/categoryService";
import schemaService from "../../api/schemaService";

/* ─── Shared Primitives ──────────────────────────────────── */

const TextInput = ({ label, required, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    <input
      className="w-full px-3 py-2.5 text-[13.5px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10 transition-all"
      {...props}
    />
  </div>
);

const SelectInput = ({ label, required, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    <select
      className="w-full px-3 py-2.5 text-[13.5px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10 transition-all"
      {...props}
    >
      {children}
    </select>
  </div>
);

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
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
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
      className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading || disabled}
      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-lg shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      {label}
    </button>
  </div>
);

/* ─── Schema Picker ──────────────────────────────────────── */

const SchemaPicker = ({ testId, currentSchemaId, onSelect }) => {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    setError(false);
    schemaService
      .getByTest(testId)
      .then((r) => setSchemas(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading)
    return (
      <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-slate-100 bg-slate-50">
        <RefreshCw size={13} className="text-slate-300 animate-spin" />
        <span className="text-xs text-slate-400">Loading schemas…</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-red-100 bg-red-50">
        <AlertCircle size={13} className="text-red-400 shrink-0" />
        <span className="text-xs text-red-500">Failed to load schemas</span>
      </div>
    );
  if (schemas.length === 0)
    return (
      <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <WifiOff size={13} className="text-slate-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">No schemas available</p>
          <p className="text-[10px] text-slate-400 mt-0.5">This test will be marked as offline</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${!currentSchemaId ? "border-slate-300 bg-slate-100" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${!currentSchemaId ? "border-slate-500 bg-slate-500" : "border-slate-300"}`}
        >
          {!currentSchemaId && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-600">No schema (Offline)</p>
          <p className="text-[10px] text-slate-400">Remove schema assignment</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center gap-1 shrink-0">
          <WifiOff size={10} />
          Offline
        </span>
      </button>
      {schemas.map((s) => {
        const selected = currentSchemaId === s._id.toString();
        return (
          <button
            key={s._id}
            type="button"
            onClick={() => onSelect(s._id.toString())}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${selected ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"}`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-indigo-500 bg-indigo-500" : "border-slate-300"}`}
            >
              {selected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${selected ? "text-indigo-700" : "text-slate-700"}`}>{s.name}</p>
              {s.description && <p className="text-[10px] text-slate-400 mt-0.5">{s.description}</p>}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-slate-300">#{s._id.toString().slice(-8)}</span>
                {s.sections?.length > 0 && (
                  <span className="text-[10px] text-slate-300">
                    {s.sections.length} section{s.sections.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${selected ? "bg-indigo-100 text-indigo-600 border-indigo-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}
            >
              <Wifi size={10} />
              Online
            </span>
          </button>
        );
      })}
    </div>
  );
};

/* ─── Modals ─────────────────────────────────────────────── */

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
        <div className="px-5 py-5">
          <TextInput
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Haematology"
            autoFocus
          />
        </div>
        <MFoot
          onClose={onClose}
          loading={loading}
          disabled={!name.trim()}
          label={mode === "create" ? "Add Category" : "Save Changes"}
        />
      </form>
    </Modal>
  );
};

const TestModal = ({ isOpen, onClose, onSave, initial, mode, categories, defaultCategoryId }) => {
  const [form, setForm] = useState({ name: "", categoryId: "" });
  const [loading, setLoading] = useState(false);
  const isEdit = mode === "edit";
  useEffect(() => {
    if (isOpen)
      setForm(
        initial
          ? { name: initial.name, categoryId: initial.categoryId ?? "", schemaId: initial.schemaId ?? "" }
          : { name: "", categoryId: defaultCategoryId ?? "" },
      );
  }, [isOpen, initial, defaultCategoryId]);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: form.name,
        categoryId: form.categoryId,
        ...(isEdit && { schemaId: form.schemaId?.trim() || null }),
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
          title={isEdit ? "Edit Test" : "Add Test"}
          sub="Test catalog entry"
          onClose={onClose}
        />
        <div className="px-5 py-5 space-y-4">
          <TextInput
            label="Test Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. CBC"
            autoFocus
          />
          <SelectInput
            label="Category"
            required
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">— Select —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </SelectInput>
          {isEdit && initial?._id && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Schema</p>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${form.schemaId ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}
                >
                  {form.schemaId ? (
                    <>
                      <Wifi size={10} />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff size={10} />
                      Offline
                    </>
                  )}
                </span>
              </div>
              <SchemaPicker
                testId={initial._id}
                currentSchemaId={form.schemaId || null}
                onSelect={(id) => setForm((f) => ({ ...f, schemaId: id ?? "" }))}
              />
            </div>
          )}
        </div>
        <MFoot
          onClose={onClose}
          loading={loading}
          disabled={!form.name.trim() || !form.categoryId}
          label={isEdit ? "Save Changes" : "Add Test"}
        />
      </form>
    </Modal>
  );
};

/* ─── Test Card ──────────────────────────────────────────── */

const TestCard = ({ test, onEdit, onDelete }) => {
  const online = !!test.schemaId;
  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className={`w-2 h-2 rounded-full shrink-0 ${online ? "bg-emerald-500" : "bg-slate-300"}`} />
      <p className="flex-1 text-[13px] font-semibold text-slate-700 truncate">{test.name}</p>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${online ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}
      >
        {online ? <Wifi size={9} /> : <WifiOff size={9} />}
        {online ? "Online" : "Offline"}
      </span>
      {/* Always visible on mobile, hover-only on lg+ */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(test)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(test)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

/* ─── Skeleton ───────────────────────────────────────────── */

const SkeletonTest = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white animate-pulse">
    <div className="w-2 h-2 bg-slate-100 rounded-full" />
    <div className="flex-1 h-3 bg-slate-100 rounded w-2/5" />
    <div className="w-14 h-4 bg-slate-100 rounded-full" />
  </div>
);

/* ─── Main Page ──────────────────────────────────────────── */

const TestCatalog = () => {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCatId, setActiveCatId] = useState("__all__");
  const [popup, setPopup] = useState({ open: false, type: "success", message: "", onConfirm: null });
  const [catM, setCatM] = useState({ open: false, mode: "create", initial: null });
  const [testM, setTestM] = useState({ open: false, mode: "create", initial: null, defaultCategoryId: null });

  const showPopup = (type, message, onConfirm = null) => setPopup({ open: true, type, message, onConfirm });
  const closePopup = () => setPopup((p) => ({ ...p, open: false, onConfirm: null }));

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

  const catIds = new Set(categories.map((c) => c._id));

  const baseTests =
    activeCatId === "__all__"
      ? tests
      : activeCatId === "__none__"
        ? tests.filter((t) => !t.categoryId || !catIds.has(t.categoryId))
        : tests.filter((t) => t.categoryId === activeCatId);

  const q = search.trim().toLowerCase();
  const visibleTests = q ? baseTests.filter((t) => t.name.toLowerCase().includes(q)) : baseTests;

  const totalOnline = tests.filter((t) => !!t.schemaId).length;
  const totalOffline = tests.length - totalOnline;
  const uncategorized = tests.filter((t) => !t.categoryId || !catIds.has(t.categoryId));

  const countFor = (catId) => tests.filter((t) => t.categoryId === catId).length;
  const activeCat = categories.find((c) => c._id === activeCatId);

  const saveCategory = async (data) => {
    try {
      catM.mode === "create"
        ? await categoryService.create(data)
        : await categoryService.update(catM.initial._id, data);
      showPopup("success", catM.mode === "create" ? "Category added!" : "Category updated!");
      fetchAll();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const deleteCategory = (cat) =>
    showPopup("warning", `Delete "${cat.name}"? Tests will become uncategorized.`, async () => {
      try {
        await categoryService.delete(cat._id);
        showPopup("success", "Deleted!");
        fetchAll();
        if (activeCatId === cat._id) setActiveCatId("__all__");
      } catch {
        showPopup("error", "Failed.");
      }
    });

  const saveTest = async (data) => {
    try {
      testM.mode === "create" ? await testService.create(data) : await testService.update(testM.initial._id, data);
      showPopup("success", testM.mode === "create" ? "Test added!" : "Test updated!");
      fetchAll();
    } catch (e) {
      showPopup("error", e?.response?.data?.message || "Failed.");
      throw e;
    }
  };

  const deleteTest = (test) =>
    showPopup("warning", `Delete "${test.name}"?`, async () => {
      try {
        await testService.delete(test._id);
        showPopup("success", "Deleted!");
        fetchAll();
      } catch {
        showPopup("error", "Failed.");
      }
    });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <FlaskConical size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Test Catalog</h1>
            <p className="text-[11px] text-slate-400 mt-1">Manage categories and tests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCatM({ open: true, mode: "create", initial: null })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <Tag size={13} />
            <span className="hidden sm:inline">Category</span>
          </button>
          <button
            onClick={() =>
              setTestM({
                open: true,
                mode: "create",
                initial: null,
                defaultCategoryId: activeCatId === "__all__" || activeCatId === "__none__" ? null : activeCatId,
              })
            }
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Add Test</span>
            <span className="sm:hidden">Test</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            icon: Tag,
            label: "Categories",
            value: loading ? "—" : categories.length,
            bg: "bg-indigo-50",
            border: "border-indigo-100",
            iconCls: "bg-indigo-100 border-indigo-200 text-indigo-500",
            valCls: "text-indigo-700",
          },
          {
            icon: Layers,
            label: "Total Tests",
            value: loading ? "—" : tests.length,
            bg: "bg-violet-50",
            border: "border-violet-100",
            iconCls: "bg-violet-100 border-violet-200 text-violet-500",
            valCls: "text-violet-700",
          },
          {
            icon: Wifi,
            label: "Online",
            value: loading ? "—" : totalOnline,
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            iconCls: "bg-emerald-100 border-emerald-200 text-emerald-500",
            valCls: "text-emerald-700",
          },
          {
            icon: WifiOff,
            label: "Offline",
            value: loading ? "—" : totalOffline,
            bg: "bg-slate-50",
            border: "border-slate-200",
            iconCls: "bg-slate-100 border-slate-200 text-slate-400",
            valCls: "text-slate-600",
          },
        ].map(({ icon: Icon, label, value, bg, border, iconCls, valCls }) => (
          <div key={label} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${bg} ${border}`}>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconCls}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className={`text-xl font-black leading-none tracking-tight ${valCls}`}>{value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && categories.length === 0 && tests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
            <FlaskConical size={22} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-500 mb-1">No catalog yet</p>
          <p className="text-xs text-slate-400 mb-5 max-w-[220px]">
            Start by adding a category, then add tests under it.
          </p>
          <button
            onClick={() => setCatM({ open: true, mode: "create", initial: null })}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all"
          >
            <Tag size={13} />
            Add First Category
          </button>
        </div>
      )}

      {/* Two-panel layout */}
      {(loading || categories.length > 0 || tests.length > 0) && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ── Left: Category panel ── */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Categories</p>
                <button
                  onClick={() => setCatM({ open: true, mode: "create", initial: null })}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-500 hover:bg-indigo-100 transition"
                >
                  <Plus size={11} />
                </button>
              </div>

              <div className="p-2 space-y-0.5">
                {/* All */}
                <button
                  onClick={() => setActiveCatId("__all__")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${activeCatId === "__all__" ? "bg-indigo-50 border border-indigo-200" : "border border-transparent hover:bg-slate-50"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeCatId === "__all__" ? "bg-indigo-100 border border-indigo-200" : "bg-slate-100 border border-slate-200"}`}
                  >
                    <Layers size={12} className={activeCatId === "__all__" ? "text-indigo-500" : "text-slate-400"} />
                  </div>
                  <span
                    className={`flex-1 text-[12.5px] font-semibold truncate ${activeCatId === "__all__" ? "text-indigo-700" : "text-slate-500"}`}
                  >
                    All Tests
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCatId === "__all__" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    {tests.length}
                  </span>
                </button>

                {loading && (
                  <div className="space-y-0.5 py-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )}

                {!loading &&
                  categories.map((cat) => {
                    const isActive = activeCatId === cat._id;
                    const count = countFor(cat._id);
                    return (
                      <div
                        key={cat._id}
                        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${isActive ? "bg-indigo-50 border border-indigo-200" : "border border-transparent hover:bg-slate-50"}`}
                      >
                        <button
                          onClick={() => setActiveCatId(cat._id)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-indigo-100 border border-indigo-200" : "bg-slate-100 border border-slate-200"}`}
                          >
                            <FolderOpen size={12} className={isActive ? "text-indigo-500" : "text-slate-400"} />
                          </div>
                          <span
                            className={`flex-1 text-[12.5px] font-semibold truncate ${isActive ? "text-indigo-700" : "text-slate-500"}`}
                          >
                            {cat.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
                          >
                            {count}
                          </span>
                        </button>
                        {/* Always visible on mobile, hover-only on lg+ */}
                        <div className="flex gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => setCatM({ open: true, mode: "edit", initial: cat })}
                            className="w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-600 transition"
                          >
                            <Pencil size={10} />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat)}
                            className="w-5 h-5 flex items-center justify-center rounded-md text-slate-300 hover:bg-white hover:text-red-400 transition"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {/* Uncategorized */}
                {!loading && uncategorized.length > 0 && (
                  <>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => setActiveCatId("__none__")}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${activeCatId === "__none__" ? "bg-amber-50 border border-amber-200" : "border border-transparent hover:bg-slate-50"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeCatId === "__none__" ? "bg-amber-100 border border-amber-200" : "bg-amber-50 border border-amber-100"}`}
                      >
                        <AlertCircle
                          size={12}
                          className={activeCatId === "__none__" ? "text-amber-600" : "text-amber-400"}
                        />
                      </div>
                      <span
                        className={`flex-1 text-[12.5px] font-semibold truncate ${activeCatId === "__none__" ? "text-amber-700" : "text-amber-500"}`}
                      >
                        Uncategorized
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCatId === "__none__" ? "bg-amber-100 text-amber-600" : "bg-amber-50 text-amber-400"}`}
                      >
                        {uncategorized.length}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Tests panel ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              {/* Tests panel header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  {activeCatId === "__all__" ? (
                    <span className="text-sm font-bold text-slate-700 truncate">All Tests</span>
                  ) : activeCatId === "__none__" ? (
                    <span className="text-sm font-bold text-amber-600 truncate">Uncategorized</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-700 truncate">{activeCat?.name}</span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                    {visibleTests.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Search size={12} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-36 sm:w-48 pl-7 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  {activeCatId !== "__none__" && (
                    <button
                      onClick={() =>
                        setTestM({
                          open: true,
                          mode: "create",
                          initial: null,
                          defaultCategoryId: activeCatId === "__all__" ? null : activeCatId,
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      <Plus size={11} />
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Tests list */}
              <div className="p-3 space-y-1.5 min-h-[200px]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonTest key={i} />)
                ) : visibleTests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mb-3">
                      {search ? (
                        <Search size={18} className="text-slate-300" />
                      ) : (
                        <FlaskConical size={18} className="text-slate-300" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-400 mb-1">
                      {search ? `No results for "${search}"` : "No tests here yet"}
                    </p>
                    <p className="text-xs text-slate-300 mb-4">
                      {search ? "Try a different search term." : "Add a test to get started."}
                    </p>
                    {!search && activeCatId !== "__none__" && (
                      <button
                        onClick={() =>
                          setTestM({
                            open: true,
                            mode: "create",
                            initial: null,
                            defaultCategoryId: activeCatId === "__all__" ? null : activeCatId,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
                      >
                        <Plus size={12} />
                        Add Test
                      </button>
                    )}
                  </div>
                ) : (
                  visibleTests.map((t) => (
                    <TestCard
                      key={t._id}
                      test={t}
                      onEdit={(t) => setTestM({ open: true, mode: "edit", initial: t, defaultCategoryId: null })}
                      onDelete={deleteTest}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
