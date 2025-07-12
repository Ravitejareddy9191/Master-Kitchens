import React from "react";
import DateRangeFilter from "./DateRangeFilter";
import StatusFilter from "./StatusFilter";
import TrainFilter from "./TrainFilter";
import PaymentFilter from "./PaymentFilter";

const Filters = () => {
  return (
    <div className="flex gap-6 flex-wrap w-[1000px] p-4 bg-[#fff] rounded-lg">
      <DateRangeFilter />
      <StatusFilter />
      <TrainFilter />
      <PaymentFilter />
    </div>
  );
};

export default Filters;
