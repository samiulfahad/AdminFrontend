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
  Search,
} from "lucide-react";
import adminBillingService from "../../api/adminBilling";
import Popup from "../../components/popup";

const MAX_DUE_EXTENSION_MS = 10 * 24 * 60 * 60 * 1000;

// ─── Date helpers ─────────────────────────────────────────────────────────────
//
// All timestamps in MongoDB are UTC ms.
// All display should be in Asia/Dhaka (BST = UTC+6).
// The HTML <input type="date"> value is a "YYYY-MM-DD" string that we treat as
// a BST calendar date. We never append "Z" to it; instead we convert to
// 23:59:59 BST = 17:59:59 UTC before sending to the server.

const DHAKA_TZ = "Asia/Dhaka";

const fmt = {
  currency: (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount ?? 0),

  // Display a UTC-ms timestamp as a date in BST
  date: (ts) =>
    ts
      ? new Date(ts).toLocaleDateString("en-BD", {
          timeZone: DHAKA_TZ,
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—",

  // Display billing period (month + year) in BST
  period: (ts) =>
    ts
      ? new Date(ts).toLocaleDateString("en-BD", {
          timeZone: DHAKA_TZ,
          year: "numeric",
          month: "long",
        })
      : "—",

  // Display full datetime in BST
  datetime: (ts) =>
    ts
      ? new Date(ts).toLocaleString("en-BD", {
          timeZone: DHAKA_TZ,
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",

  /**
   * Convert a UTC-ms timestamp to "YYYY-MM-DD" in BST.
   * Used to seed the <input type="date"> with the correct BST calendar date.
   *
   * We can't use toISOString() here because that always gives UTC, which is
   * 6 hours behind BST and would show the wrong day near midnight.
   */
  bstDateString: (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-CA", {
      // en-CA gives "YYYY-MM-DD" format
      timeZone: DHAKA_TZ,
    });
  },
};

/**
 * Convert a BST calendar date string ("YYYY-MM-DD") to the UTC ms timestamp
 * that represents 23:59:59.999 BST on that day.
 *
 * 23:59:59 BST  =  17:59:59 UTC  (BST is UTC+6)
 */
function bstDateStringToUtcMs(dateStr) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, mo - 1, d, 17, 59, 59, 999);
}

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

  // Max selectable date in BST: current dueDate + 10 days, as a BST date string
  const maxDueDateStr = bill.dueDate ? fmt.bstDateString(bill.dueDate + MAX_DUE_EXTENSION_MS) : "";
  // Min = tomorrow in BST
  const minDueDateStr = fmt.bstDateString(Date.now() + 86_400_000);

  const handlePay = async (e) => {
    e.stopPropagation();
    setPaying(true);
    try {
      await adminBillingService.pay(bill._id, bill.labId);
      setPopup({ type: "success", message: "Bill has been marked as paid successfully." });
      onPaySuccess();
    } catch (err) {
      setPopup({ type: "error", message: err?.response?.data?.error || "Payment failed. Please try again." });
    } finally {
      setPaying(false);
    }
  };

  const openDueEditor = (e) => {
    e.stopPropagation();
    // Seed with the current due date as a BST calendar date string
    setNewDueDate(bill.dueDate ? fmt.bstDateString(bill.dueDate) : minDueDateStr);
    setEditingDue(true);
  };

  const cancelDueEdit = (e) => {
    e?.stopPropagation();
    setEditingDue(false);
  };

  const saveDueDate = async (e) => {
    e.stopPropagation();
    if (!newDueDate) return;

    // Convert BST date string → UTC ms at 23:59:59.999 BST (= 17:59:59.999 UTC)
    const chosenMs = bstDateStringToUtcMs(newDueDate);

    if (chosenMs <= Date.now()) {
      setPopup({ type: "error", message: "Due date must be in the future." });
      return;
    }

    if (bill.dueDate && chosenMs > bill.dueDate + MAX_DUE_EXTENSION_MS) {
      setPopup({
        type: "error",
        message: `Cannot extend beyond ${fmt.date(bill.dueDate + MAX_DUE_EXTENSION_MS)} BST (10-day limit).`,
      });
      return;
    }

    setSavingDue(true);
    try {
      // Send the BST date string; the server converts it to the correct UTC ms
      await adminBillingService.updateDueDate(bill._id, newDueDate);
      setPopup({ type: "success", message: "Due date updated successfully." });
      setEditingDue(false);
      onPaySuccess(); // refresh
    } catch (err) {
      setPopup({ type: "error", message: err?.response?.data?.error || "Failed to update due date." });
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
                    <span className="text-gray-500 shrink-0">Due (BST)</span>

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
                            <span className="text-[10px] text-gray-400">Max: {maxDueDateStr} (BST)</span>
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
                            title="Extend due date (max +10 days)"
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
      setPopup({ type: "success", message: res.data?.message || "Retry started successfully." });
      onRetry();
    } catch (err) {
      setPopup({ type: "error", message: err?.response?.data?.error || "Retry failed. Please try again." });
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
              run.triggeredBy === "cron" || run.triggeredBy?.startsWith("cron-retry")
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-violet-50 text-violet-700 border-violet-200"
            }`}
          >
            {run.triggeredBy === "cron" || run.triggeredBy?.startsWith("cron-retry") ? (
              <Activity className="w-3 h-3" />
            ) : (
              <Zap className="w-3 h-3" />
            )}
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
//
// Lets admin pick a past month in BST and trigger manual bill generation.
// Defaults to showing last month (the most common use case after a cron failure).

const MONTH_NAMES = [
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

const GenerateModal = ({ onClose, onSuccess }) => {
  // Default to last month in BST
  const nowBst = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const curMonBst = nowBst.getUTCMonth() + 1; // 1-indexed
  const curYrBst = nowBst.getUTCFullYear();
  const defMon = curMonBst === 1 ? 12 : curMonBst - 1;
  const defYr = curMonBst === 1 ? curYrBst - 1 : curYrBst;

  const [year, setYear] = useState(defYr);
  const [month, setMonth] = useState(defMon); // 1-indexed
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await adminBillingService.generate({ year, month });
      setPopup({ type: "success", message: res.data?.message || "Bill generation started successfully." });
    } catch (err) {
      setPopup({ type: "error", message: err?.response?.data?.error || "Failed to start bill generation." });
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    const type = popup?.type;
    setPopup(null);
    if (type === "success") onSuccess();
  };

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
              <p className="text-xs text-gray-500">Select a past billing period (BST)</p>
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
                max={curYrBst}
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
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            Bills can only be generated for months that have fully ended in BST.
          </p>

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

  // Bills state
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [billsError, setBillsError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [labIdFilter, setLabIdFilter] = useState("");
  const [labIdInput, setLabIdInput] = useState(""); // raw input before submission
  const [billsSkip, setBillsSkip] = useState(0);
  const BILLS_LIMIT = 20;

  // Runs state
  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [runsError, setRunsError] = useState(null);
  const [errorsOnly, setErrorsOnly] = useState(false);

  const [showGenerate, setShowGenerate] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // ── Data fetchers ───────────────────────────────────────────────────────────

  const fetchBills = useCallback(async (skip = 0, filter = "", labId = "") => {
    setLoadingBills(true);
    setBillsError(null);
    try {
      const res = await adminBillingService.getAll({
        status: filter || undefined,
        labId: labId || undefined,
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
      const res = await adminBillingService.getRuns({ hasErrors: errOnly ? "true" : undefined, limit: 20 });
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

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchSummary();
    fetchBills(0, statusFilter, labIdFilter);
    fetchRuns(errorsOnly);
  }, []);

  useEffect(() => {
    fetchBills(billsSkip, statusFilter, labIdFilter);
  }, [statusFilter, billsSkip, labIdFilter]);

  useEffect(() => {
    fetchRuns(errorsOnly);
  }, [errorsOnly]);

  const handleRefresh = () => {
    fetchSummary();
    fetchBills(billsSkip, statusFilter, labIdFilter);
    fetchRuns(errorsOnly);
  };

  // Lab ID search: apply on Enter or button click
  const applyLabFilter = () => {
    const trimmed = labIdInput.trim();
    setLabIdFilter(trimmed);
    setBillsSkip(0);
  };

  const clearLabFilter = () => {
    setLabIdInput("");
    setLabIdFilter("");
    setBillsSkip(0);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto min-w-0">
          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-3 mb-6 min-w-0">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">Billing Management</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                Manage all lab bills, payments, and billing run history · All times in BST (UTC+6)
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
                <p className="text-xs text-gray-400 mt-0.5">past due date</p>
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
              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Status filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

                {/* Lab ID search */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter by Lab ID…"
                      value={labIdInput}
                      onChange={(e) => setLabIdInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyLabFilter()}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-44"
                    />
                  </div>
                  <button
                    onClick={applyLabFilter}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-white hover:bg-gray-900 transition-all"
                  >
                    Search
                  </button>
                  {labIdFilter && (
                    <button
                      onClick={clearLabFilter}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {labIdFilter && (
                <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 mb-3 inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Showing bills for lab: <span className="font-mono">{labIdFilter}</span>
                </p>
              )}

              {loadingBills ? (
                <TableSkeleton rows={6} />
              ) : billsError ? (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{billsError}</p>
                    <button
                      onClick={() => fetchBills(billsSkip, statusFilter, labIdFilter)}
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
                      {bills.length > 0 ? `${billsSkip + 1}–${billsSkip + bills.length}` : "0"}
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
