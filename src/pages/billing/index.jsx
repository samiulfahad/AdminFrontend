import { useState, useEffect, useCallback, useRef } from "react";
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
  RotateCcw,
  X,
  Zap,
  AlertTriangle,
  Loader2,
  Receipt,
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  BadgeCheck,
  Ban,
} from "lucide-react";
import billingService from "../../api/billingService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (ms) =>
  ms ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ms)) : "—";

const fmtMonth = (ms) =>
  ms ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(ms)) : "—";

const fmtCurrency = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n)
    : "—";

const isOverdue = (ms) => ms && Date.now() > ms;

// ─── Skeleton primitives ──────────────────────────────────────────────────────

const Bone = ({ className = "" }) => <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />;

// Skeleton for a single unpaid lab card
const LabCardSkeleton = () => (
  <div className="border border-slate-100 rounded-2xl bg-white shadow-sm p-5">
    <div className="flex items-start gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Bone className="h-4 w-40" />
          <Bone className="h-4 w-16" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-5 w-20 rounded-lg" />
          <Bone className="h-5 w-20 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right space-y-1.5">
          <Bone className="h-3 w-20 ml-auto" />
          <Bone className="h-6 w-28" />
        </div>
        <Bone className="h-9 w-24 rounded-xl" />
      </div>
    </div>
    <div className="mt-4 space-y-2.5">
      <Bone className="h-14 w-full rounded-xl" />
    </div>
  </div>
);

// Skeleton for history rows inside drawer
const HistoryRowSkeleton = () => (
  <div className="px-5 py-3 flex items-center gap-3 bg-white/50 border-b border-slate-100">
    <Bone className="h-5 w-14 rounded-md" />
    <div className="min-w-[110px] space-y-1.5">
      <Bone className="h-3.5 w-20" />
      <Bone className="h-3 w-32" />
    </div>
    <Bone className="h-4 w-20" />
    <Bone className="h-3.5 w-16" />
    <Bone className="h-3.5 w-24 ml-auto" />
  </div>
);

// Skeleton for runs table rows
const RunRowSkeleton = () => (
  <tr className="border-b border-slate-50">
    {[28, 24, 20, 12, 36, 16, 8].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <Bone className={`h-4 w-${w}`} />
      </td>
    ))}
  </tr>
);

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

const Btn = ({ children, variant = "primary", loading, disabled, className = "", ...props }) => {
  const base =
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const v = {
    primary: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-200",
    secondary: "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost: "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
  };
  return (
    <button className={`${base} ${v[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Loader2 size={12} className="animate-spin" />}
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>}
    <input
      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition placeholder:text-slate-300"
      {...props}
    />
  </div>
);

const Select = ({ children, ...props }) => (
  <select
    className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-xl bg-white text-slate-600 outline-none focus:border-indigo-400 transition cursor-pointer"
    {...props}
  >
    {children}
  </select>
);

const Modal = ({ open, onClose, title, children, width = "max-w-md" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full ${width} animate-[fadeUp_0.18s_ease]`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <h3 className="text-[14.5px] font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={13} className="text-slate-400" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status, overdue }) => {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unpaid: overdue ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200",
    free: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[status] ?? "bg-slate-100 text-slate-400 border-slate-200"}`}
    >
      {status === "paid" && <CheckCircle2 size={9} />}
      {status === "unpaid" && (overdue ? <AlertTriangle size={9} /> : <Clock size={9} />)}
      {status === "free" && <Zap size={9} />}
      {overdue && status === "unpaid" ? "Overdue" : status}
    </span>
  );
};

const MonthTag = ({ label, isOverdue: over }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${over ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-100"}`}
  >
    {over && <AlertTriangle size={9} />}
    {label}
  </span>
);

// ─── Month/Year Picker ────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MonthYearPicker = ({ value, onChange, label, maxYear, maxMonth }) => {
  const [viewYear, setViewYear] = useState(value?.year ?? maxYear ?? new Date().getFullYear());
  const isDisabled = (y, m) => maxYear && (y > maxYear || (y === maxYear && m > maxMonth));

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <ChevronLeft size={13} className="text-slate-500" />
          </button>
          <span className="text-[13px] font-bold text-slate-700">{viewYear}</span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <ChevronRight size={13} className="text-slate-500" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1 p-2">
          {MONTHS.map((m, i) => {
            const mn = i + 1;
            const dis = isDisabled(viewYear, mn);
            const sel = value?.year === viewYear && value?.month === mn;
            return (
              <button
                key={m}
                type="button"
                disabled={dis}
                onClick={() => onChange({ year: viewYear, month: mn })}
                className={`py-1.5 rounded-lg text-[12px] font-semibold transition cursor-pointer ${sel ? "bg-indigo-500 text-white shadow-sm" : !dis ? "hover:bg-indigo-50 text-slate-700" : "text-slate-200 cursor-not-allowed"}`}
              >
                {m}
              </button>
            );
          })}
        </div>
        {value && (
          <div className="px-3 pb-2.5 pt-1.5 flex items-center justify-between border-t border-slate-50">
            <span className="text-[12px] text-indigo-600 font-semibold">
              {MONTHS[value.month - 1]} {value.year}
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] text-slate-400 hover:text-red-500 transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Lab History Drawer — lazy loaded on expand ───────────────────────────────

const LabHistoryDrawer = ({ labKey, onPay, onExtend }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const limit = 12;

  const load = useCallback(
    async (skip = 0) => {
      setLoading(true);
      setError("");
      try {
        const res = await billingService.getLabHistoryByKey(labKey, { skip, limit });
        setData(res.data);
      } catch (e) {
        setError(e?.response?.data?.error ?? "Failed to load history");
      } finally {
        setLoading(false);
      }
    },
    [labKey],
  );

  useEffect(() => {
    load(page * limit);
  }, [load, page]);

  const bills = data?.bills ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-slate-50/60 border-t border-slate-100">
      {/* Stats row — show skeleton while loading first page */}
      <div className="px-5 py-3 flex items-center gap-3 flex-wrap border-b border-slate-100 bg-white/70 min-h-[44px]">
        {loading && !data ? (
          <>
            <Bone className="h-3.5 w-24" />
            <Bone className="h-3.5 w-20" />
            <Bone className="h-3.5 w-16 ml-auto" />
          </>
        ) : (
          <>
            {[
              { key: "paid", label: "Paid", color: "text-emerald-600" },
              { key: "unpaid", label: "Unpaid", color: "text-amber-600" },
              { key: "free", label: "Free", color: "text-slate-400" },
            ].map(
              ({ key, label, color }) =>
                data?.stats?.[key]?.count > 0 && (
                  <span key={key} className="text-[12px]">
                    <span className={`font-bold ${color}`}>
                      {data.stats[key].count} {label}
                    </span>
                    {data.stats[key].total > 0 && (
                      <span className="text-slate-400 ml-1">({fmtCurrency(data.stats[key].total)})</span>
                    )}
                  </span>
                ),
            )}
            <span className="text-[11px] text-slate-300 ml-auto">{total} total</span>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-4 text-[12px] text-red-500 flex items-center gap-1.5">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* Bill rows */}
      {loading ? (
        // Skeleton rows while loading
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <HistoryRowSkeleton key={i} />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="px-5 py-6 text-[13px] text-slate-400 text-center">No billing history</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {bills.map((bill) => {
            const over = isOverdue(bill.dueDate) && bill.status === "unpaid";
            return (
              <div
                key={bill._id}
                className={`px-5 py-3 flex items-center gap-3 flex-wrap transition-colors ${over ? "bg-red-50/40" : "bg-white/50"}`}
              >
                <StatusBadge status={bill.status} overdue={over} />

                <div className="min-w-[110px]">
                  <div className="text-[12.5px] font-semibold text-slate-700">{fmtMonth(bill.billingPeriodStart)}</div>
                  <div className="text-[11px] text-slate-400">
                    {fmtDate(bill.billingPeriodStart)} – {fmtDate(bill.billingPeriodEnd)}
                  </div>
                </div>

                <span className="text-[13px] font-bold text-slate-800 min-w-[90px]">
                  {fmtCurrency(bill.totalAmount)}
                </span>

                {bill.invoiceCount != null && (
                  <span className="text-[11.5px] text-slate-400">{bill.invoiceCount} inv.</span>
                )}

                {bill.status === "paid" && bill.paidAt && (
                  <span className="text-[11.5px] text-emerald-600 font-medium flex items-center gap-1">
                    <BadgeCheck size={12} /> Paid {fmtDate(bill.paidAt)}
                  </span>
                )}

                {bill.status === "unpaid" && (
                  <span
                    className={`text-[11.5px] flex items-center gap-1 ${over ? "text-red-500 font-semibold" : "text-slate-400"}`}
                  >
                    {over ? <AlertTriangle size={11} /> : <Clock size={11} />}
                    Due {fmtDate(bill.dueDate)}
                  </span>
                )}

                {bill.breakdown && (
                  <div className="flex flex-wrap gap-1 w-full mt-1">
                    {Object.entries(bill.breakdown).map(([k, v]) => (
                      <span
                        key={k}
                        className="text-[10.5px] bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5"
                      >
                        <span className="text-slate-400 capitalize">{k}:</span>{" "}
                        <span className="font-bold text-slate-600">{typeof v === "number" ? fmtCurrency(v) : v}</span>
                      </span>
                    ))}
                  </div>
                )}

                {bill.status === "unpaid" && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Btn variant="success" className="!px-2.5 !py-1.5 !text-[11px]" onClick={() => onPay(bill)}>
                      <CheckCircle2 size={10} /> Pay
                    </Btn>
                    <Btn variant="secondary" className="!px-2.5 !py-1.5 !text-[11px]" onClick={() => onExtend(bill)}>
                      <Calendar size={10} /> Extend
                    </Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100">
          <span className="text-[11.5px] text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Btn
              variant="ghost"
              className="!px-2 !py-1 !text-[11px]"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={11} /> Prev
            </Btn>
            <Btn
              variant="ghost"
              className="!px-2 !py-1 !text-[11px]"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={11} />
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Unpaid Lab Row ───────────────────────────────────────────────────────────

const UnpaidLabRow = ({ lab, onPay, onExtend }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header row */}
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[14px] font-bold text-slate-800 truncate">{lab.labName ?? "Unknown Lab"}</span>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200">
              {lab.labKey}
            </span>
            {!lab.isActive && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Ban size={9} /> Inactive
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lab.unpaidMonths.map((um) => (
              <MonthTag key={um.billingId} label={um.month} isOverdue={um.isOverdue} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Total Unpaid</div>
            <div className="text-[16px] font-black text-amber-600">{fmtCurrency(lab.unpaidTotal)}</div>
          </div>
          {/* History toggle — triggers lazy fetch on first click */}
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            History
          </button>
        </div>
      </div>

      {/* Unpaid quick-pay rows */}
      {lab.unpaidMonths.length > 0 && (
        <div className="px-5 pb-4 flex flex-col gap-2">
          {lab.unpaidMonths.map((um) => (
            <div
              key={um.billingId}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border flex-wrap ${um.isOverdue ? "bg-red-50/60 border-red-100" : "bg-amber-50/40 border-amber-100"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-bold text-slate-700">{um.month}</span>
                  {um.isOverdue && (
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                      <AlertTriangle size={9} /> OVERDUE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {fmtDate(um.billingPeriodStart)} – {fmtDate(um.billingPeriodEnd)} · Due {fmtDate(um.dueDate)} ·{" "}
                  {um.invoiceCount} inv.
                </div>
              </div>
              <span className="text-[13px] font-black text-slate-800">{fmtCurrency(um.totalAmount)}</span>
              <div className="flex items-center gap-1.5">
                <Btn
                  variant="success"
                  className="!px-2.5 !py-1.5 !text-[11px]"
                  onClick={() =>
                    onPay({
                      _id: um.billingId,
                      labId: lab.labId,
                      totalAmount: um.totalAmount,
                      dueDate: um.dueDate,
                      month: um.month,
                    })
                  }
                >
                  <CheckCircle2 size={10} /> Pay
                </Btn>
                <Btn
                  variant="secondary"
                  className="!px-2.5 !py-1.5 !text-[11px]"
                  onClick={() => onExtend({ _id: um.billingId, dueDate: um.dueDate, month: um.month })}
                >
                  <Calendar size={10} /> Extend
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History drawer — only mounted (and fetched) when expanded */}
      {expanded && <LabHistoryDrawer labKey={lab.labKey} onPay={onPay} onExtend={onExtend} />}
    </div>
  );
};

// ─── Run Row ──────────────────────────────────────────────────────────────────

const RunRow = ({ run, onRetry }) => (
  <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition group">
    <td className="px-4 py-3 text-[12.5px] font-bold text-slate-700">{run.period}</td>
    <td className="px-4 py-3 text-[12px] text-slate-500">{fmtDate(run.triggeredAt)}</td>
    <td className="px-4 py-3 text-[12px] text-slate-500">{run.triggeredBy}</td>
    <td className="px-4 py-3 text-[12px] text-slate-700 font-semibold">{run.totalLabs}</td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2 text-[11.5px]">
        <span className="text-emerald-600 font-bold">{run.generated} gen</span>
        <span className="text-slate-200">·</span>
        <span className="text-slate-400">{run.free} free</span>
        <span className="text-slate-200">·</span>
        <span className="text-slate-400">{run.skipped} skip</span>
      </div>
    </td>
    <td className="px-4 py-3">
      {run.failedCount > 0 ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
          <AlertCircle size={10} /> {run.failedCount} failed
        </span>
      ) : (
        <span className="text-[11px] text-emerald-500 font-bold">✓ All OK</span>
      )}
    </td>
    <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition">
      {run.failedCount > 0 && (
        <Btn variant="danger" className="!px-2.5 !py-1.5 !text-[11px]" onClick={() => onRetry(run)}>
          <RotateCcw size={10} /> Retry
        </Btn>
      )}
    </td>
  </tr>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "unpaid", label: "Unpaid Bills", icon: Clock },
  { id: "runs", label: "Billing Runs", icon: Activity },
  { id: "lab", label: "Lab Lookup", icon: Building2 },
];

const UNPAID_LIMIT = 20;

export default function AdminBilling() {
  const [tab, setTab] = useState("unpaid");

  // ── Unpaid labs ──
  const [unpaidLabs, setUnpaidLabs] = useState([]);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [unpaidLoading, setUnpaidLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [unpaidSkip, setUnpaidSkip] = useState(0);
  const searchTimer = useRef(null);

  // ── Runs ──
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsFilter, setRunsFilter] = useState({ hasErrors: "", skip: 0, limit: 20 });

  // ── Lab lookup ──
  const [labKeyInput, setLabKeyInput] = useState("");
  const [labData, setLabData] = useState(null);
  const [labLoading, setLabLoading] = useState(false);
  const [labError, setLabError] = useState("");

  // ── Modals ──
  const [payModal, setPayModal] = useState(null);
  const [extendModal, setExtendModal] = useState(null);
  const [extendDate, setExtendDate] = useState("");
  const [generateModal, setGenerateModal] = useState(false);
  const [genPeriod, setGenPeriod] = useState(null);
  const [genDueDate, setGenDueDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch unpaid labs — explicit args, no stale closure ──
  const fetchUnpaid = useCallback(async (skip, searchVal) => {
    setUnpaidLoading(true);
    try {
      const params = { skip, limit: UNPAID_LIMIT };
      if (searchVal) params.search = searchVal;
      const res = await billingService.getUnpaidLabs(params);
      setUnpaidLabs(res.data.labs);
      setUnpaidTotal(res.data.total);
    } catch {
      showToast("Failed to fetch unpaid labs", "error");
    } finally {
      setUnpaidLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "unpaid") fetchUnpaid(unpaidSkip, search);
  }, [tab, unpaidSkip, search, fetchUnpaid]);

  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setUnpaidSkip(0);
      setSearch(val);
    }, 400);
  };

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
    if (tab === "runs") fetchRuns();
  }, [tab, fetchRuns]);

  // ── Lab lookup ──
  const handleLabLookup = async () => {
    const key = labKeyInput.trim();
    if (!key) {
      setLabError("Please enter a Lab Key.");
      return;
    }
    setLabLoading(true);
    setLabError("");
    setLabData(null);
    try {
      const res = await billingService.getLabSummaryByKey(key);
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
      fetchUnpaid(unpaidSkip, search);
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
      fetchUnpaid(unpaidSkip, search);
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
      if (genPeriod?.year) body.year = genPeriod.year;
      if (genPeriod?.month) body.month = genPeriod.month;
      if (genDueDate) body.dueDate = genDueDate;
      await billingService.generate(body);
      showToast("Bill generation started ✓");
      setGenerateModal(false);
      setGenPeriod(null);
      setGenDueDate("");
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

  const now = new Date();
  const maxYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const maxMonth = now.getMonth() === 0 ? 12 : now.getMonth();

  const unpaidPages = Math.ceil(unpaidTotal / UNPAID_LIMIT);
  const unpaidPage = Math.floor(unpaidSkip / UNPAID_LIMIT);

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-[13px] font-semibold animate-[fadeUp_0.2s_ease] ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
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
              {t.id === "unpaid" && unpaidTotal > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === "unpaid" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}
                >
                  {unpaidTotal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── UNPAID BILLS TAB ─── */}
      {tab === "unpaid" && (
        <div>
          {/* Toolbar */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              />
              <input
                className="w-full pl-8 pr-3 py-2 text-[13px] border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition placeholder:text-slate-300"
                placeholder="Search by lab name or key…"
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
              />
            </div>
            <Btn variant="secondary" onClick={() => fetchUnpaid(unpaidSkip, search)} loading={unpaidLoading}>
              <RefreshCw size={12} /> Refresh
            </Btn>
            {!unpaidLoading && (
              <span className="ml-auto text-[12px] text-slate-400">
                {unpaidTotal} lab{unpaidTotal !== 1 ? "s" : ""} with unpaid bills
              </span>
            )}
          </div>

          {/* Skeleton list OR real list */}
          {unpaidLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <LabCardSkeleton key={i} />
              ))}
            </div>
          ) : unpaidLabs.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center shadow-sm">
              <CheckCircle2 size={28} className="text-emerald-300 mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-slate-400">
                {search ? "No results found" : "All labs are paid up!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unpaidLabs.map((lab) => (
                <UnpaidLabRow
                  key={lab.labId}
                  lab={lab}
                  onPay={setPayModal}
                  onExtend={(bill) => {
                    setExtendModal(bill);
                    setExtendDate("");
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {unpaidPages > 1 && !unpaidLoading && (
            <div className="flex items-center justify-between mt-4 px-1">
              <span className="text-[12px] text-slate-400">
                Page {unpaidPage + 1} of {unpaidPages}
              </span>
              <div className="flex gap-2">
                <Btn
                  variant="secondary"
                  className="!px-3 !py-1.5 !text-[12px]"
                  disabled={unpaidSkip === 0}
                  onClick={() => setUnpaidSkip((s) => Math.max(0, s - UNPAID_LIMIT))}
                >
                  ← Prev
                </Btn>
                <Btn
                  variant="secondary"
                  className="!px-3 !py-1.5 !text-[12px]"
                  disabled={unpaidSkip + UNPAID_LIMIT >= unpaidTotal}
                  onClick={() => setUnpaidSkip((s) => s + UNPAID_LIMIT)}
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── RUNS TAB ─── */}
      {tab === "runs" && (
        <div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
            <Filter size={13} className="text-slate-300" />
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
                    Array.from({ length: 5 }).map((_, i) => <RunRowSkeleton key={i} />)
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
            <p className="text-[13px] font-semibold text-slate-600 mb-3">Look up a lab by its Key</p>
            <div className="flex gap-2">
              <Input
                placeholder="Lab Key (e.g. 11111)"
                value={labKeyInput}
                onChange={(e) => setLabKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLabLookup()}
              />
              <Btn onClick={handleLabLookup} loading={labLoading} disabled={!labKeyInput.trim()}>
                <Search size={13} /> Lookup
              </Btn>
            </div>
            {labError && (
              <p className="text-[12px] text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={11} /> {labError}
              </p>
            )}
          </div>

          {/* Lab lookup skeleton */}
          {labLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Bone className="h-5 w-48" />
                    <Bone className="h-3.5 w-24" />
                  </div>
                  <Bone className="h-7 w-16 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-2">
                    <Bone className="h-3 w-12" />
                    <Bone className="h-7 w-10" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {labData && !labLoading && (
            <div className="space-y-4 animate-[fadeUp_0.2s_ease]">
              {/* Lab card */}
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
                {[
                  { label: "Paid", key: "paid", border: "border-emerald-100" },
                  { label: "Unpaid", key: "unpaid", border: "border-amber-100" },
                  { label: "Free", key: "free", border: "border-slate-100" },
                ].map(({ label, key, border }) => (
                  <div key={key} className={`bg-white rounded-2xl border ${border} p-4 shadow-sm`}>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-[22px] font-black text-slate-900 leading-tight">
                      {labData.stats?.[key]?.count ?? 0}
                    </p>
                    {labData.stats?.[key]?.total > 0 && (
                      <p className="text-[11.5px] text-slate-400 mt-0.5">{fmtCurrency(labData.stats[key].total)}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Current unpaid bill */}
              {labData.currentBill ? (
                <div
                  className={`bg-white border rounded-2xl p-5 shadow-sm ${labData.currentBill.isOverdue ? "border-red-200 bg-red-50/20" : "border-amber-100"}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      {labData.currentBill.isOverdue ? (
                        <AlertTriangle size={16} className="text-red-500" />
                      ) : (
                        <Clock size={16} className="text-amber-500" />
                      )}
                      <span className="text-[14px] font-bold text-slate-800">Current Unpaid Bill</span>
                    </div>
                    <span className="text-[20px] font-black text-slate-900">
                      {fmtCurrency(labData.currentBill.amount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[12px] mb-4">
                    <div>
                      <span className="text-slate-400">Period: </span>
                      <span className="font-semibold text-slate-700">
                        {fmtDate(labData.currentBill.billingPeriodStart)} –{" "}
                        {fmtDate(labData.currentBill.billingPeriodEnd)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Due: </span>
                      <span
                        className={`font-semibold ${labData.currentBill.isOverdue ? "text-red-600" : "text-slate-700"}`}
                      >
                        {fmtDate(labData.currentBill.dueDate)}
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
                      onClick={() =>
                        setPayModal({ ...labData.currentBill, _id: labData.currentBill.id, labId: labData.lab?._id })
                      }
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

              {/* Full history — lazy loaded via LabHistoryDrawer */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Receipt size={14} className="text-slate-400" />
                  <span className="text-[13px] font-bold text-slate-700">Full Billing History</span>
                </div>
                <LabHistoryDrawer
                  labKey={labData.lab?.labKey}
                  onPay={setPayModal}
                  onExtend={(bill) => {
                    setExtendModal(bill);
                    setExtendDate("");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PAY MODAL ─── */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Confirm Payment">
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-[13px] text-emerald-700">
            Mark this bill as paid? This will unblock the lab immediately.
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="text-slate-400 block mb-0.5">Amount</span>
              <span className="font-bold text-slate-800">{fmtCurrency(payModal?.totalAmount ?? payModal?.amount)}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="text-slate-400 block mb-0.5">Period</span>
              <span className="font-bold text-slate-800">
                {payModal?.month ?? fmtMonth(payModal?.billingPeriodStart)}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="text-slate-400 block mb-0.5">Due Date</span>
              <span className="font-bold text-slate-800">{fmtDate(payModal?.dueDate)}</span>
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
            Max extension: <strong>+10 days</strong> from current due date ({fmtDate(extendModal?.dueDate)}).
            {extendModal?.month && <span className="ml-1 font-semibold">· {extendModal.month}</span>}
          </div>
          <Input label="New Due Date" type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} />
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
      <Modal
        open={generateModal}
        onClose={() => {
          setGenerateModal(false);
          setGenPeriod(null);
          setGenDueDate("");
        }}
        title="Generate Bills"
        width="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-[12.5px] text-slate-500">
            Leave period blank to auto-generate for the previous BST month.
          </p>
          <MonthYearPicker
            label="Billing Period (optional)"
            value={genPeriod}
            onChange={setGenPeriod}
            maxYear={maxYear}
            maxMonth={maxMonth}
          />
          <Input
            label="Due Date (optional)"
            type="date"
            value={genDueDate}
            onChange={(e) => setGenDueDate(e.target.value)}
          />
          <div className="flex gap-2 justify-end pt-1">
            <Btn
              variant="secondary"
              onClick={() => {
                setGenerateModal(false);
                setGenPeriod(null);
                setGenDueDate("");
              }}
            >
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
