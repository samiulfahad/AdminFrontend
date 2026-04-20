import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  RotateCcw,
  Building2,
  Zap,
  Filter,
  Gift,
  XCircle,
  Activity,
} from "lucide-react";
import adminBillingService from "../../api/adminBilling";
import Popup from "../../components/popup";

const MAX_DUE_EXTENSION_MS = 10 * 24 * 60 * 60 * 1000;

const fmt = {
  currency: (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount ?? 0),

  date: (ts) =>
    ts
      ? new Date(ts).toLocaleDateString("en-BD", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—",

  period: (ts) =>
    ts
      ? new Date(ts).toLocaleDateString("en-BD", {
          year: "numeric",
          month: "long",
        })
      : "—",

  datetime: (ts) =>
    ts
      ? new Date(ts).toLocaleString("en-BD", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",

  isoDate: (ts) => (ts ? new Date(ts).toISOString().slice(0, 10) : ""),
};

// ─── Skeleton primitives ──────────────────────────────────────────────────────

const Sk = ({ className = "" }) => <div className={`animate-pulse rounded-lg bg-gray-200/80 ${className}`} />;

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200/80 rounded-xl px-4 py-3 shadow-sm space-y-2">
        <Sk className="h-2.5 w-16" />
        <Sk className="h-6 w-20" />
        <Sk className="h-2.5 w-24" />
      </div>
    ))}
  </div>
);

const TableSkeleton = ({ rows = 6 }) => (
  <div className="border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse" style={{ minWidth: "500px" }}>
        <tbody className="divide-y divide-gray-100">
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="animate-pulse">
              {[...Array(5)].map((__, j) => (
                <td key={j} className="px-4 py-3.5">
                  <Sk className={`h-3.5 ${j === 0 ? "w-20" : j === 4 ? "w-8" : "w-16"}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status, isOverdue }) => {
  if (status === "paid")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> Paid
      </span>
    );
  if (status === "free")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <Gift className="w-3 h-3" /> Free
      </span>
    );
  if (isOverdue)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="w-3 h-3" /> Overdue
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" /> Unpaid
    </span>
  );
};

// ─── Breakdown Panel ──────────────────────────────────────────────────────────

const BreakdownPanel = ({ breakdown }) => {
  if (!breakdown) return null;
  const rows = [
    { label: "Monthly fee", value: breakdown.monthlyFee },
    { label: "Per-invoice fee", value: breakdown.perInvoiceFee },
    { label: "Commission", value: breakdown.commission },
    { label: "Net per invoice", value: breakdown.perInvoiceNet },
  ].filter((r) => r.value != null);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
      <p className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
        Charge breakdown
      </p>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between px-4 py-2 border-b border-gray-50 last:border-b-0 text-sm">
          <span className="text-gray-500">{r.label}</span>
          <span className="font-medium text-gray-800">{fmt.currency(r.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Bill Row ─────────────────────────────────────────────────────────────────

const BillRow = ({ bill, onPaySuccess }) => {
  const [expanded, setExpanded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [popup, setPopup] = useState(null);

  const [editingDue, setEditingDue] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [savingDue, setSavingDue] = useState(false);

  const isOverdue = bill.status === "unpaid" && Date.now() > bill.dueDate;

  // The max selectable date = current dueDate + 20 days
  const maxDueDateStr = bill.dueDate ? fmt.isoDate(bill.dueDate + MAX_DUE_EXTENSION_MS) : "";

  // min = tomorrow (can't pick today or past)
  const minDueDateStr = fmt.isoDate(Date.now() + 86_400_000);

  const handlePay = async (e) => {
    e.stopPropagation();
    setPaying(true);
    try {
      await adminBillingService.pay(bill._id, bill.labId);
      setPopup({ type: "success", message: "Bill has been marked as paid successfully." });
      onPaySuccess();
    } catch (err) {
      setPopup({
        type: "error",
        message: err?.response?.data?.error || "Payment failed. Please try again.",
      });
    } finally {
      setPaying(false);
    }
  };

  const openDueEditor = (e) => {
    e.stopPropagation();
    // Seed with current due date, clamped to max
    const seed = bill.dueDate ? fmt.isoDate(bill.dueDate) : minDueDateStr;
    setNewDueDate(seed);
    setEditingDue(true);
  };

  const cancelDueEdit = (e) => {
    e?.stopPropagation();
    setEditingDue(false);
  };

  const saveDueDate = async (e) => {
    e.stopPropagation();
    if (!newDueDate) return;

    // End-of-day UTC so picking "Jan 30" → Jan 30 23:59:59.999Z
    const chosenMs = new Date(newDueDate + "T23:59:59.999Z").getTime();

    if (chosenMs <= Date.now()) {
      setPopup({ type: "error", message: "Due date must be in the future." });
      return;
    }

    if (bill.dueDate && chosenMs > bill.dueDate + MAX_DUE_EXTENSION_MS) {
      setPopup({
        type: "error",
        message: `Cannot extend beyond ${fmt.date(bill.dueDate + MAX_DUE_EXTENSION_MS)} (20-day limit).`,
      });
      return;
    }

    setSavingDue(true);
    try {
      await adminBillingService.updateDueDate(bill._id, chosenMs);
      setPopup({ type: "success", message: "Due date updated successfully." });
      setEditingDue(false);
      onPaySuccess();
    } catch (err) {
      setPopup({
        type: "error",
        message: err?.response?.data?.error || "Failed to update due date.",
      });
    } finally {
      setSavingDue(false);
    }
  };

  return (
    <>
      {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}

      <tr className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <td className="px-3 py-3 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
              <Building2 className="w-3 h-3 text-blue-500" />
            </div>
            <span className="font-mono text-xs text-gray-500">…{String(bill.labId).slice(-6)}</span>
          </div>
        </td>

        <td className="px-3 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
          {fmt.currency(bill.totalAmount)}
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          <StatusBadge status={bill.status} isOverdue={isOverdue} />
        </td>

        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap hidden sm:table-cell">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
            {fmt.period(bill.billingPeriodStart)}
          </div>
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          {bill.status === "unpaid" && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              {paying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
              Pay
            </button>
          )}
        </td>

        <td className="px-3 py-3 text-center w-8">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 mx-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 mx-auto" />
          )}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-gray-50/60">
          <td colSpan={6} className="px-3 pb-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <BreakdownPanel breakdown={bill.breakdown} />

              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <p className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Details
                </p>
                <div className="divide-y divide-gray-50">
                  <div className="flex justify-between gap-4 px-4 py-2">
                    <span className="text-gray-500 shrink-0">Lab ID</span>
                    <span className="font-mono text-xs text-gray-700 break-all text-right">{String(bill.labId)}</span>
                  </div>

                  <div className="flex justify-between gap-4 px-4 py-2">
                    <span className="text-gray-500 shrink-0">Period</span>
                    <span className="font-medium text-gray-800 text-right">
                      {fmt.date(bill.billingPeriodStart)} – {fmt.date(bill.billingPeriodEnd)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 px-4 py-2">
                    <span className="text-gray-500 shrink-0">Invoices</span>
                    <span className="font-medium text-gray-800">{bill.invoiceCount ?? 0}</span>
                  </div>

                  {/* ── Due date — editable only for unpaid ── */}
                  <div className="flex justify-between items-center gap-4 px-4 py-2 min-h-[40px]">
                    <span className="text-gray-500 shrink-0">Due</span>

                    {bill.status === "unpaid" ? (
                      editingDue ? (
                        <div
                          className="flex items-center gap-2 flex-wrap justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col items-end gap-0.5">
                            <input
                              type="date"
                              value={newDueDate}
                              min={minDueDateStr}
                              max={maxDueDateStr}
                              onChange={(e) => setNewDueDate(e.target.value)}
                              className="px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            />
                            <span className="text-[10px] text-gray-400">
                              Max: {fmt.date(bill.dueDate + MAX_DUE_EXTENSION_MS)}
                            </span>
                          </div>
                          <button
                            onClick={saveDueDate}
                            disabled={savingDue}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all"
                          >
                            {savingDue ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelDueEdit}
                            className="inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-800"}`}>
                            {fmt.date(bill.dueDate)}
                          </span>
                          <button
                            onClick={openDueEditor}
                            title="Extend due date (max +20 days)"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all"
                          >
                            <Calendar className="w-3 h-3" />
                            Edit
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="font-medium text-gray-800">{fmt.date(bill.dueDate)}</span>
                    )}
                  </div>

                  {bill.status === "paid" && (
                    <>
                      <div className="flex justify-between gap-4 px-4 py-2">
                        <span className="text-gray-500 shrink-0">Paid at</span>
                        <span className="font-medium text-gray-800 text-right">{fmt.datetime(bill.paidAt)}</span>
                      </div>
                      {bill.paidBy?.name && (
                        <div className="flex justify-between gap-4 px-4 py-2">
                          <span className="text-gray-500 shrink-0">Paid by</span>
                          <span className="font-medium text-gray-800">{bill.paidBy.name}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Run Row ──────────────────────────────────────────────────────────────────

const RunRow = ({ run, onRetry }) => {
  const [expanded, setExpanded] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [popup, setPopup] = useState(null);

  const handleRetry = async (e) => {
    e.stopPropagation();
    setRetrying(true);
    try {
      const res = await adminBillingService.retryRun(run._id);
      setPopup({
        type: "success",
        message: res.data?.message || "Retry started successfully.",
      });
      onRetry();
    } catch (err) {
      setPopup({
        type: "error",
        message: err?.response?.data?.error || "Retry failed. Please try again.",
      });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <>
      {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}

      <tr className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{run.period}</td>

        <td className="px-3 py-3 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-green-600 font-semibold">{run.generated}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 text-xs">{run.totalLabs} labs</span>
          </div>
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          {run.hasErrors ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <XCircle className="w-3 h-3" />
              {run.failedCount}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              <CheckCircle2 className="w-3 h-3" /> OK
            </span>
          )}
        </td>

        <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
              run.triggeredBy === "cron"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-violet-50 text-violet-700 border-violet-200"
            }`}
          >
            {run.triggeredBy === "cron" ? <Activity className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            {run.triggeredBy}
          </span>
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          {run.hasErrors && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-all shadow-sm active:scale-95"
            >
              {retrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              Retry
            </button>
          )}
        </td>

        <td className="px-3 py-3 text-center w-8">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 mx-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 mx-auto" />
          )}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-gray-50/60">
          <td colSpan={6} className="px-3 pb-4 pt-2">
            <p className="text-xs text-gray-400 mb-3">
              Triggered: {fmt.datetime(run.triggeredAt)}
              {run.lastRetryAt && <> · Last retry: {fmt.datetime(run.lastRetryAt)}</>}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
              {[
                { label: "Generated", value: run.generated, color: "text-green-700" },
                { label: "Free", value: run.free, color: "text-purple-700" },
                { label: "Skipped", value: run.skipped, color: "text-gray-600" },
                { label: "Failed", value: run.failedCount, color: "text-red-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200/80 px-3 py-2.5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {run.failedLabs?.length > 0 && (
              <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                <p className="px-4 py-2.5 text-xs font-semibold text-red-600 uppercase tracking-wide border-b border-red-100 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Failed labs
                </p>
                {run.failedLabs.map((f, i) => (
                  <div key={i} className="flex flex-col gap-0.5 px-4 py-2.5 border-b border-gray-50 last:border-b-0">
                    <p className="text-sm font-medium text-gray-800">{f.labName || "Unknown"}</p>
                    <p className="font-mono text-xs text-gray-400 break-all">{String(f.labId)}</p>
                    <p className="text-xs text-red-500 mt-0.5">{f.error}</p>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Generate Modal ───────────────────────────────────────────────────────────

const GenerateModal = ({ onClose, onSuccess }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await adminBillingService.generate({ year, month });
      setPopup({
        type: "success",
        message: res.data?.message || "Bill generation started successfully.",
      });
    } catch (err) {
      setPopup({
        type: "error",
        message: err?.response?.data?.error || "Failed to start bill generation.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    const type = popup?.type;
    setPopup(null);
    if (type === "success") onSuccess();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <>
      {popup && <Popup type={popup.type} message={popup.message} onClose={handlePopupClose} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 w-full max-w-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Generate Bills</h3>
              <p className="text-xs text-gray-500">Select billing period</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min={2024}
                max={2100}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Tab Button ───────────────────────────────────────────────────────────────

const Tab = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      active
        ? "bg-white text-blue-700 border border-blue-200/80 shadow-sm"
        : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden xs:inline">{label}</span>
    {count != null && (
      <span
        className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
          active ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// ─── Main Admin Billing Page ──────────────────────────────────────────────────

const AdminBilling = () => {
  const [tab, setTab] = useState("bills");

  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [billsError, setBillsError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [billsSkip, setBillsSkip] = useState(0);
  const BILLS_LIMIT = 20;

  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [runsError, setRunsError] = useState(null);
  const [errorsOnly, setErrorsOnly] = useState(false);

  const [showGenerate, setShowGenerate] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const fetchBills = useCallback(async (skip = 0, filter = "") => {
    setLoadingBills(true);
    setBillsError(null);
    try {
      const res = await adminBillingService.getAll({
        status: filter || undefined,
        limit: BILLS_LIMIT,
        skip,
      });
      setBills(res.data.bills ?? []);
    } catch {
      setBillsError("Failed to load bills.");
    } finally {
      setLoadingBills(false);
    }
  }, []);

  const fetchRuns = useCallback(async (errOnly = false) => {
    setLoadingRuns(true);
    setRunsError(null);
    try {
      const res = await adminBillingService.getRuns({
        hasErrors: errOnly ? "true" : undefined,
        limit: 20,
      });
      setRuns(res.data.runs ?? []);
    } catch {
      setRunsError("Failed to load billing runs.");
    } finally {
      setLoadingRuns(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const [unpaidRes, paidRes] = await Promise.all([
        adminBillingService.getAll({ status: "unpaid", limit: 100 }),
        adminBillingService.getAll({ status: "paid", limit: 100 }),
      ]);
      const unpaidBills = unpaidRes.data.bills ?? [];
      const paidBills = paidRes.data.bills ?? [];
      setSummary({
        unpaidCount: unpaidBills.length,
        unpaidTotal: unpaidBills.reduce((s, b) => s + (b.totalAmount ?? 0), 0),
        overdueCount: unpaidBills.filter((b) => Date.now() > b.dueDate).length,
        paidTotal: paidBills.reduce((s, b) => s + (b.totalAmount ?? 0), 0),
      });
    } catch {
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchBills(0, statusFilter);
    fetchRuns(errorsOnly);
  }, []);

  useEffect(() => {
    fetchBills(billsSkip, statusFilter);
  }, [statusFilter, billsSkip]);

  useEffect(() => {
    fetchRuns(errorsOnly);
  }, [errorsOnly]);

  const handleRefresh = () => {
    fetchSummary();
    fetchBills(billsSkip, statusFilter);
    fetchRuns(errorsOnly);
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto min-w-0">
          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-3 mb-6 min-w-0">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">Billing Management</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                Manage all lab bills, payments, and billing run history
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl border border-gray-200/80 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Generate Bills</span>
                <span className="sm:hidden">Generate</span>
              </button>
            </div>
          </div>

          {/* ── Summary Stats ── */}
          {loadingSummary ? (
            <StatsSkeleton />
          ) : summary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white border border-gray-200/80 rounded-xl px-4 py-3 shadow-sm min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Unpaid</p>
                <p className="text-lg font-bold text-amber-600">{summary.unpaidCount}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{fmt.currency(summary.unpaidTotal)}</p>
              </div>
              <div className="bg-white border border-gray-200/80 rounded-xl px-4 py-3 shadow-sm min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Overdue</p>
                <p className={`text-lg font-bold ${summary.overdueCount > 0 ? "text-red-600" : "text-gray-400"}`}>
                  {summary.overdueCount}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">past due</p>
              </div>
              <div className="bg-white border border-gray-200/80 rounded-xl px-4 py-3 shadow-sm min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Collected</p>
                <p className="text-lg font-bold text-green-700 truncate">{fmt.currency(summary.paidTotal)}</p>
                <p className="text-xs text-gray-400 mt-0.5">total paid</p>
              </div>
              <div className="bg-white border border-gray-200/80 rounded-xl px-4 py-3 shadow-sm min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Runs</p>
                <p className="text-lg font-bold text-gray-800">{runs.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">{runs.filter((r) => r.hasErrors).length} with errors</p>
              </div>
            </div>
          ) : null}

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl w-fit mb-5">
            <Tab
              active={tab === "bills"}
              onClick={() => setTab("bills")}
              icon={CreditCard}
              label="Bills"
              count={bills.length}
            />
            <Tab
              active={tab === "runs"}
              onClick={() => setTab("runs")}
              icon={Activity}
              label="Runs"
              count={runs.length}
            />
          </div>

          {/* ── Bills Tab ── */}
          {tab === "bills" && (
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {["", "unpaid", "paid", "free"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setBillsSkip(0);
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      statusFilter === s
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              {loadingBills ? (
                <TableSkeleton rows={6} />
              ) : billsError ? (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{billsError}</p>
                    <button
                      onClick={() => fetchBills(billsSkip, statusFilter)}
                      className="text-xs text-red-600 hover:underline mt-0.5"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : bills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No bills found</p>
                  <p className="text-xs text-gray-400 mt-1">Try changing the filter or generate bills first</p>
                </div>
              ) : (
                <div className="border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="w-full overflow-x-auto">
                    <table className="text-left border-collapse" style={{ minWidth: "480px", width: "100%" }}>
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200/80">
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lab</th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Amount
                          </th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Status
                          </th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                            Period
                          </th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Action
                          </th>
                          <th className="px-3 py-3 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bills.map((bill) => (
                          <BillRow key={bill._id} bill={bill} onPaySuccess={handleRefresh} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-500">
                      {billsSkip + 1}–{billsSkip + bills.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBillsSkip(Math.max(0, billsSkip - BILLS_LIMIT))}
                        disabled={billsSkip === 0}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setBillsSkip(billsSkip + BILLS_LIMIT)}
                        disabled={bills.length < BILLS_LIMIT}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Runs Tab ── */}
          {tab === "runs" && (
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setErrorsOnly((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    errorsOnly
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Errors only
                </button>
              </div>

              {loadingRuns ? (
                <TableSkeleton rows={5} />
              ) : runsError ? (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{runsError}</p>
                    <button
                      onClick={() => fetchRuns(errorsOnly)}
                      className="text-xs text-red-600 hover:underline mt-0.5"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No billing runs yet</p>
                  <p className="text-xs text-gray-400 mt-1">Runs appear here after bills are generated</p>
                </div>
              ) : (
                <div className="border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="w-full overflow-x-auto">
                    <table className="text-left border-collapse" style={{ minWidth: "420px", width: "100%" }}>
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200/80">
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Period
                          </th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Results
                          </th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Health
                          </th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                            Source
                          </th>
                          <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Action
                          </th>
                          <th className="px-3 py-3 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {runs.map((run) => (
                          <RunRow key={run._id} run={run} onRetry={handleRefresh} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showGenerate && (
        <GenerateModal
          onClose={() => setShowGenerate(false)}
          onSuccess={() => {
            setShowGenerate(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};

export default AdminBilling;
