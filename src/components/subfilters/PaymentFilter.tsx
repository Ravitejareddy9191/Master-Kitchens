import React from "react";

const PaymentFilter = () => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Payment Mode</label>
      <select className="p-2 border rounded-md">
        <option>All</option>
        <option>Online</option>
        <option>COD</option>
        <option>Card</option>
      </select>
    </div>
  );
};

export default PaymentFilter;
