import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Building2,
  RefreshCw,
  Play,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RotateCcw,
  X,
  Zap,
  TrendingUp,
  AlertTriangle,
  Ban,
  ChevronRight,
  Loader2,
  Receipt,
  Activity,
} from "lucide-react";
import billingService from "../api/billingService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (ms) =>
  ms ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ms)) : "—";

const fmtCurrency = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n)
    : "—";

const isOverdue = (ms) => ms && Date.now() > ms;

const statusStyles = {
  unpaid: "bg-amber-50 text-amber-700 border border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  free: "bg-slate-100 text-slate-500 border border-slate-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${statusStyles[status] ?? "bg-slate-100 text-slate-500"}`}
  >
    {status === "paid" && <CheckCircle2 size={10} />}
    {status === "unpaid" && <Clock size={10} />}
    {status === "free" && <Zap size={10} />}
    {status}
  </span>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, accent = "indigo" }) => {
  const accents = {
    indigo: "from-indigo-500 to-indigo-400 shadow-indigo-200",
    emerald: "from-emerald-500 to-emerald-400 shadow-emerald-200",
    amber: "from-amber-500 to-amber-400 shadow-amber-200",
    rose: "from-rose-500 to-rose-400 shadow-rose-200",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center shadow-md shrink-0`}
      >
        <Icon size={17} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-[22px] font-black text-slate-900 leading-tight tracking-tight">{value}</p>
        {sub && <p className="text-[11.5px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Modal Shell ──────────────────────────────────────────────────────────────

const Modal = ({ open, onClose, title, children, width = "max-w-lg" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full ${width} animate-[slideUp_0.2s_ease]`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
          <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={14} className="text-slate-400" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[12px] font-semibold text-slate-600">{label}</label>}
    <input
      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition placeholder:text-slate-300"
      {...props}
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[12px] font-semibold text-slate-600">{label}</label>}
    <select
      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition cursor-pointer"
      {...props}
    >
      {children}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", loading, disabled, className = "", ...props }) => {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-200",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Loader2 size={13} className="animate-spin" />}
      {children}
    </button>
  );
};

// ─── Bills Table ──────────────────────────────────────────────────────────────

const BillRow = ({ bill, onPay, onExtend }) => {
  const [open, setOpen] = useState(false);
  const overdue = isOverdue(bill.dueDate) && bill.status === "unpaid";

  return (
    <>
      <tr className={`border-b border-slate-50 hover:bg-slate-50/60 transition group ${overdue ? "bg-red-50/30" : ""}`}>
        <td className="px-4 py-3">
          <div className="text-[12px] font-mono text-slate-400">{bill.labKey ?? bill.labId}</div>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={bill.status} />
          {overdue && (
            <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200">
              <AlertTriangle size={9} />
              OVERDUE
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-[13px] font-bold text-slate-800">{fmtCurrency(bill.totalAmount)}</td>
        <td className="px-4 py-3 text-[12px] text-slate-500">
          {fmt(bill.billingPeriodStart)} – {fmt(bill.billingPeriodEnd)}
        </td>
        <td className="px-4 py-3 text-[12px] text-slate-500">{fmt(bill.dueDate)}</td>
        <td className="px-4 py-3 text-[12px] text-slate-400">{bill.invoiceCount ?? "—"}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
            {bill.status === "unpaid" && (
              <>
                <Btn variant="success" className="!px-2.5 !py-1 !text-[11px]" onClick={() => onPay(bill)}>
                  <CheckCircle2 size={11} /> Pay
                </Btn>
                <Btn variant="secondary" className="!px-2.5 !py-1 !text-[11px]" onClick={() => onExtend(bill)}>
                  <Calendar size={11} /> Extend
                </Btn>
              </>
            )}
            {bill.breakdown && (
              <button
                onClick={() => setOpen((o) => !o)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                {open ? (
                  <ChevronUp size={12} className="text-slate-400" />
                ) : (
                  <ChevronDown size={12} className="text-slate-400" />
                )}
              </button>
            )}
          </div>
        </td>
      </tr>
      {open && bill.breakdown && (
        <tr className="bg-slate-50/80 border-b border-slate-100">
          <td colSpan={7} className="px-6 py-3">
            <div className="flex flex-wrap gap-3">
              {Object.entries(bill.breakdown).map(([k, v]) => (
                <div key={k} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px]">
                  <span className="text-slate-400 capitalize">{k}: </span>
                  <span className="font-bold text-slate-700">{typeof v === "number" ? fmtCurrency(v) : v}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Run Row ──────────────────────────────────────────────────────────────────

const RunRow = ({ run, onRetry }) => (
  <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition group">
    <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">{run.period}</td>
    <td className="px-4 py-3 text-[12px] text-slate-500">{fmt(run.triggeredAt)}</td>
    <td className="px-4 py-3 text-[12px] text-slate-500">{run.triggeredBy}</td>
    <td className="px-4 py-3 text-[12px] text-slate-700">{run.totalLabs}</td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-emerald-600 font-semibold">{run.generated} gen</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">{run.free} free</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">{run.skipped} skip</span>
      </div>
    </td>
    <td className="px-4 py-3">
      {run.failedCount > 0 ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
          <AlertCircle size={10} />
          {run.failedCount} failed
        </span>
      ) : (
        <span className="text-[11px] text-emerald-500 font-semibold">✓ All OK</span>
      )}
    </td>
    <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition">
      {run.failedCount > 0 && (
        <Btn variant="danger" className="!px-2.5 !py-1 !text-[11px]" onClick={() => onRetry(run)}>
          <RotateCcw size={11} /> Retry
        </Btn>
      )}
    </td>
  </tr>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "all", label: "All Bills", icon: Receipt },
  { id: "runs", label: "Billing Runs", icon: Activity },
  { id: "lab", label: "Lab Lookup", icon: Building2 },
];

export default function AdminBilling() {
  const [tab, setTab] = useState("all");

  // ── All bills ──
  const [bills, setBills] = useState([]);
  const [billsTotal, setBillsTotal] = useState(0);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsFilter, setBillsFilter] = useState({ status: "", skip: 0, limit: 50 });

  // ── Runs ──
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsFilter, setRunsFilter] = useState({ hasErrors: "", skip: 0, limit: 20 });

  // ── Lab lookup ──
  const [labId, setLabId] = useState("");
  const [labData, setLabData] = useState(null);
  const [labLoading, setLabLoading] = useState(false);
  const [labError, setLabError] = useState("");

  // ── Modals ──
  const [payModal, setPayModal] = useState(null);
  const [extendModal, setExtendModal] = useState(null);
  const [generateModal, setGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ year: "", month: "", dueDate: "" });
  const [extendDate, setExtendDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch all bills ──
  const fetchBills = useCallback(async () => {
    setBillsLoading(true);
    try {
      const params = { skip: billsFilter.skip, limit: billsFilter.limit };
      if (billsFilter.status) params.status = billsFilter.status;
      const res = await billingService.getAll(params);
      setBills(res.data.bills);
      setBillsTotal(res.data.total);
    } catch {
      showToast("Failed to fetch bills", "error");
    } finally {
      setBillsLoading(false);
    }
  }, [billsFilter]);

  // ── Fetch runs ──
  const fetchRuns = useCallback(async () => {
    setRunsLoading(true);
    try {
      const params = { skip: runsFilter.skip, limit: runsFilter.limit };
      if (runsFilter.hasErrors) params.hasErrors = runsFilter.hasErrors;
      const res = await billingService.getRuns(params);
      setRuns(res.data.runs);
    } catch {
      showToast("Failed to fetch runs", "error");
    } finally {
      setRunsLoading(false);
    }
  }, [runsFilter]);

  useEffect(() => {
    if (tab === "all") fetchBills();
  }, [tab, fetchBills]);
  useEffect(() => {
    if (tab === "runs") fetchRuns();
  }, [tab, fetchRuns]);

  // ── Lab lookup ──
  const handleLabLookup = async () => {
    if (!labId.trim() || labId.trim().length !== 24) {
      setLabError("Lab ID must be 24 characters.");
      return;
    }
    setLabLoading(true);
    setLabError("");
    setLabData(null);
    try {
      const res = await billingService.getLabSummary(labId.trim());
      setLabData(res.data);
    } catch (e) {
      setLabError(e?.response?.data?.error ?? "Lab not found.");
    } finally {
      setLabLoading(false);
    }
  };

  // ── Pay ──
  const handlePay = async () => {
    if (!payModal) return;
    setActionLoading(true);
    try {
      await billingService.markPaid(payModal._id, payModal.labId);
      showToast("Bill marked as paid ✓");
      setPayModal(null);
      fetchBills();
    } catch (e) {
      showToast(e?.response?.data?.error ?? "Failed to mark paid", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Extend ──
  const handleExtend = async () => {
    if (!extendModal || !extendDate) return;
    setActionLoading(true);
    try {
      await billingService.updateDueDate(extendModal._id, extendDate);
      showToast("Due date updated ✓");
      setExtendModal(null);
      setExtendDate("");
      fetchBills();
    } catch (e) {
      showToast(e?.response?.data?.error ?? "Failed to update due date", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Generate ──
  const handleGenerate = async () => {
    setActionLoading(true);
    try {
      const body = {};
      if (genForm.year) body.year = parseInt(genForm.year);
      if (genForm.month) body.month = parseInt(genForm.month);
      if (genForm.dueDate) body.dueDate = genForm.dueDate;
      await billingService.generate(body);
      showToast("Bill generation started ✓");
      setGenerateModal(false);
      setGenForm({ year: "", month: "", dueDate: "" });
    } catch (e) {
      showToast(e?.response?.data?.error ?? "Failed to start generation", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Retry ──
  const handleRetry = async (run) => {
    try {
      await billingService.retryFailed(run._id);
      showToast(`Retrying ${run.failedCount} failed lab(s) ✓`);
      fetchRuns();
    } catch (e) {
      showToast(e?.response?.data?.error ?? "Retry failed", "error");
    }
  };

  const totalPages = Math.ceil(billsTotal / billsFilter.limit);
  const currentPage = Math.floor(billsFilter.skip / billsFilter.limit) + 1;

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-[13px] font-semibold animate-[slideUp_0.2s_ease] ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
        >
          {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200">
              <CreditCard size={15} className="text-white" />
            </div>
            <h1 className="text-[22px] font-black text-slate-900 tracking-tight">Billing</h1>
          </div>
          <p className="text-[13px] text-slate-400 ml-10">Manage lab invoices, billing runs &amp; payments</p>
        </div>
        <Btn onClick={() => setGenerateModal(true)}>
          <Play size={13} /> Generate Bills
        </Btn>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-slate-100 rounded-xl p-1 w-fit shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${tab === t.id ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── ALL BILLS TAB ─── */}
      {tab === "all" && (
        <div>
          {/* Filters */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
            <Filter size={14} className="text-slate-300" />
            <Select
              label=""
              value={billsFilter.status}
              onChange={(e) => setBillsFilter((f) => ({ ...f, status: e.target.value, skip: 0 }))}
            >
              <option value="">All statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </Select>
            <Btn variant="secondary" onClick={fetchBills} loading={billsLoading}>
              <RefreshCw size={12} /> Refresh
            </Btn>
            <span className="ml-auto text-[12px] text-slate-400">{billsTotal} total bills</span>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {["Lab", "Status", "Amount", "Period", "Due Date", "Invoices", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Loader2 size={22} className="animate-spin text-indigo-400 mx-auto" />
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-300 text-[13px]">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    bills.map((b) => (
                      <BillRow
                        key={b._id}
                        bill={b}
                        onPay={setPayModal}
                        onExtend={(bill) => {
                          setExtendModal(bill);
                          setExtendDate("");
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {billsTotal > billsFilter.limit && (
              <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[12px] text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Btn
                    variant="secondary"
                    className="!px-3 !py-1.5 !text-[12px]"
                    disabled={billsFilter.skip === 0}
                    onClick={() => setBillsFilter((f) => ({ ...f, skip: Math.max(0, f.skip - f.limit) }))}
                  >
                    ← Prev
                  </Btn>
                  <Btn
                    variant="secondary"
                    className="!px-3 !py-1.5 !text-[12px]"
                    disabled={billsFilter.skip + billsFilter.limit >= billsTotal}
                    onClick={() => setBillsFilter((f) => ({ ...f, skip: f.skip + f.limit }))}
                  >
                    Next →
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── RUNS TAB ─── */}
      {tab === "runs" && (
        <div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
            <Filter size={14} className="text-slate-300" />
            <Select
              value={runsFilter.hasErrors}
              onChange={(e) => setRunsFilter((f) => ({ ...f, hasErrors: e.target.value, skip: 0 }))}
            >
              <option value="">All runs</option>
              <option value="true">With errors only</option>
            </Select>
            <Btn variant="secondary" onClick={fetchRuns} loading={runsLoading}>
              <RefreshCw size={12} /> Refresh
            </Btn>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {["Period", "Triggered At", "By", "Total Labs", "Results", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {runsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Loader2 size={22} className="animate-spin text-indigo-400 mx-auto" />
                      </td>
                    </tr>
                  ) : runs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-300 text-[13px]">
                        No runs found
                      </td>
                    </tr>
                  ) : (
                    runs.map((r) => <RunRow key={r._id} run={r} onRetry={handleRetry} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── LAB LOOKUP TAB ─── */}
      {tab === "lab" && (
        <div className="max-w-2xl">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-4">
            <p className="text-[13px] font-semibold text-slate-600 mb-3">Look up a lab by its ID</p>
            <div className="flex gap-2">
              <Input
                placeholder="24-character Lab ID"
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
                maxLength={24}
                onKeyDown={(e) => e.key === "Enter" && handleLabLookup()}
              />
              <Btn onClick={handleLabLookup} loading={labLoading} disabled={!labId.trim()}>
                <Search size={13} /> Lookup
              </Btn>
            </div>
            {labError && (
              <p className="text-[12px] text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={11} />
                {labError}
              </p>
            )}
          </div>

          {labData && (
            <div className="space-y-4 animate-[slideUp_0.2s_ease]">
              {/* Lab info */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-[17px] font-black text-slate-900">{labData.lab?.name ?? "—"}</p>
                    <p className="text-[12px] font-mono text-slate-400 mt-0.5">{labData.lab?.labKey}</p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${labData.lab?.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}
                  >
                    {labData.lab?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={CheckCircle2}
                  label="Paid"
                  value={labData.stats?.paid?.count ?? 0}
                  sub={fmtCurrency(labData.stats?.paid?.total)}
                  accent="emerald"
                />
                <StatCard
                  icon={Clock}
                  label="Unpaid"
                  value={labData.stats?.unpaid?.count ?? 0}
                  sub={fmtCurrency(labData.stats?.unpaid?.total)}
                  accent="amber"
                />
                <StatCard icon={Zap} label="Free" value={labData.stats?.free?.count ?? 0} accent="indigo" />
              </div>

              {/* Current bill */}
              {labData.currentBill ? (
                <div
                  className={`bg-white border rounded-2xl p-5 shadow-sm ${labData.currentBill.isOverdue ? "border-red-200 bg-red-50/30" : "border-slate-100"}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      {labData.currentBill.isOverdue ? (
                        <AlertTriangle size={16} className="text-red-500" />
                      ) : (
                        <Clock size={16} className="text-amber-500" />
                      )}
                      <span className="text-[14px] font-bold text-slate-800">Current Unpaid Bill</span>
                      {labData.currentBill.isOverdue && <StatusBadge status="overdue" />}
                    </div>
                    <span className="text-[20px] font-black text-slate-900">
                      {fmtCurrency(labData.currentBill.amount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[12px] mb-4">
                    <div>
                      <span className="text-slate-400">Period: </span>
                      <span className="font-semibold text-slate-700">
                        {fmt(labData.currentBill.billingPeriodStart)} – {fmt(labData.currentBill.billingPeriodEnd)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Due: </span>
                      <span
                        className={`font-semibold ${labData.currentBill.isOverdue ? "text-red-600" : "text-slate-700"}`}
                      >
                        {fmt(labData.currentBill.dueDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Invoices: </span>
                      <span className="font-semibold text-slate-700">{labData.currentBill.invoiceCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Btn
                      variant="success"
                      onClick={() => setPayModal({ ...labData.currentBill, _id: labData.currentBill.id, labId })}
                    >
                      <CheckCircle2 size={13} /> Mark as Paid
                    </Btn>
                    <Btn
                      variant="secondary"
                      onClick={() => {
                        setExtendModal({ ...labData.currentBill, _id: labData.currentBill.id });
                        setExtendDate("");
                      }}
                    >
                      <Calendar size={13} /> Extend Due Date
                    </Btn>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-[13px] text-slate-500 font-medium">No unpaid bills for this lab</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── PAY MODAL ─── */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Confirm Payment">
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-[13px] text-emerald-700">
            Mark this bill as paid? This will unblock the lab immediately via cache invalidation.
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="bg-slate-50 rounded-lg p-3">
              <span className="text-slate-400 block mb-0.5">Amount</span>
              <span className="font-bold text-slate-800">{fmtCurrency(payModal?.amount ?? payModal?.totalAmount)}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <span className="text-slate-400 block mb-0.5">Due</span>
              <span className="font-bold text-slate-800">{fmt(payModal?.dueDate)}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Btn variant="secondary" onClick={() => setPayModal(null)}>
              Cancel
            </Btn>
            <Btn variant="success" onClick={handlePay} loading={actionLoading}>
              <CheckCircle2 size={13} /> Confirm Payment
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ─── EXTEND MODAL ─── */}
      <Modal open={!!extendModal} onClose={() => setExtendModal(null)} title="Extend Due Date">
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[12px] text-amber-700">
            Max extension: <strong>+10 days</strong> from the current due date ({fmt(extendModal?.dueDate)}).
          </div>
          <Input
            label="New Due Date (YYYY-MM-DD)"
            type="date"
            value={extendDate}
            onChange={(e) => setExtendDate(e.target.value)}
          />
          <div className="flex gap-2 justify-end pt-1">
            <Btn variant="secondary" onClick={() => setExtendModal(null)}>
              Cancel
            </Btn>
            <Btn onClick={handleExtend} loading={actionLoading} disabled={!extendDate}>
              <Calendar size={13} /> Update Due Date
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ─── GENERATE MODAL ─── */}
      <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="Generate Bills">
        <div className="space-y-4">
          <p className="text-[12.5px] text-slate-500">
            Leave year/month blank to auto-generate for the previous BST month.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Year (optional)"
              type="number"
              placeholder="e.g. 2025"
              value={genForm.year}
              onChange={(e) => setGenForm((f) => ({ ...f, year: e.target.value }))}
              min={2024}
              max={2100}
            />
            <Input
              label="Month (optional)"
              type="number"
              placeholder="1–12"
              value={genForm.month}
              onChange={(e) => setGenForm((f) => ({ ...f, month: e.target.value }))}
              min={1}
              max={12}
            />
          </div>
          <Input
            label="Due Date (optional, YYYY-MM-DD)"
            type="date"
            value={genForm.dueDate}
            onChange={(e) => setGenForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-1">
            <Btn variant="secondary" onClick={() => setGenerateModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleGenerate} loading={actionLoading}>
              <Play size={13} /> Start Generation
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
