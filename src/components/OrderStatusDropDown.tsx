import React from "react";

const STATUS_OPTIONS = [
  { label: "Placed", bg: "#e6e6e6", text: "#4c4c4c" },
  { label: "Confirmed", bg: "#dcf7fc", text: "#165265" },
  { label: "Delivered", bg: "#dcfce7", text: "#166534" },
  { label: "Cancelled", bg: "#fcdcdc", text: "#651616" },
  { label: "Undelivered", bg: "#fceddc", text: "#652f16" },
  { label: "Partially Delivered", bg: "#f9ffd8", text: "#4b560e" },
];

interface Props {
  value: string;
  onChange: (status: string) => void;
}

export default function OrderStatusDropdown({ value, onChange }: Props) {
  const selected = STATUS_OPTIONS.find((s) => s.label === value) || STATUS_OPTIONS[0];

  return (
    <select
      className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300"
      style={{ backgroundColor: selected.bg, color: selected.text }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status.label} value={status.label}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
