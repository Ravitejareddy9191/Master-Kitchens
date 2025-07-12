import React from "react";

interface OrderDetailsDropdownProps {
  orderId: string;
}

export default function OrderDetailsDropdown({ orderId }: OrderDetailsDropdownProps) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
      {/* Replace below with your actual details structure from Main.tsx */}
      <div className="font-semibold">Details for Order ID: {orderId}</div>
      <ul className="mt-2 list-disc list-inside">
        <li>Sample Item 1 - ₹200</li>
        <li>Sample Item 2 - ₹150</li>
        <li>Total: ₹350</li>
      </ul>
    </div>
  );
}
