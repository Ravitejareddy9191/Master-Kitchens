import React from "react";

const TrainFilter = () => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">By Train</label>
      <select className="p-2 border rounded-md">
        <option>All Trains</option>
        <option>Train 001</option>
        <option>Train 002</option>
      </select>
    </div>
  );
};

export default TrainFilter;
