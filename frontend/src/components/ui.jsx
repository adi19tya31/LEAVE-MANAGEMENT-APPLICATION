import { CheckCircle2, Clock, Info, Loader2, XCircle } from "lucide-react";

export function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium text-[#33395C] mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[12px] text-[#D9534F]">{error}</p>}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#1E2761] placeholder:text-[#AEB4D1] outline-none focus:ring-2 focus:ring-[#6C8CFF]/40 border-[#D9DEF0] ${className}`}
    />
  );
}

export function SelectInput({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#1E2761] outline-none focus:ring-2 focus:ring-[#6C8CFF]/40 border-[#D9DEF0] bg-white ${className}`}
    />
  );
}

export function PrimaryButton({ children, loading, className = "", ...rest }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2761] px-4 py-[11px] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

export function Banner({ tone = "info", children }) {
  const tones = {
    info: "bg-[#F4F6FC] text-[#33395C]",
    error: "bg-[#FBEAEA] text-[#B23B3B]",
    success: "bg-[#E6F5EC] text-[#1F7A4D]",
  };
  return (
    <div className={`rounded-lg px-3 py-2.5 text-[13px] ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }) {
  const cfg = {
    pending: { icon: Clock, color: "#B8860B", bg: "#FBF3DF", label: "Pending" },
    approved: {
      icon: CheckCircle2,
      color: "#1F7A4D",
      bg: "#E6F5EC",
      label: "Approved",
    },
    rejected: {
      icon: XCircle,
      color: "#B23B3B",
      bg: "#FBEAEA",
      label: "Rejected",
    },
    cancelled: {
      icon: XCircle,
      color: "#5B6485",
      bg: "#F0F1F7",
      label: "Cancelled",
    },
  }[status] || { icon: Info, color: "#5B6485", bg: "#F0F1F7", label: status };
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
