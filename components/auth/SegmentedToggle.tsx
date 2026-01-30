"use client";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label"?: string;
};

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel = "Toggle",
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-full bg-white/80 p-1 shadow-sm"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
            value === opt.value
              ? "bg-trakoo-mood-2 text-white shadow"
              : "text-trakoo-muted hover:text-trakoo-text"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
