import React from "react";
import DateRangeFilter from "./subfilters/DateRangeFilter";

export default function FilterDropDown() {
  return (
    <div className="flex pt-0 pr-0 pb-[20px] pl-0 flex-col gap-[10px] items-start self-stretch shrink-0 flex-nowrap relative z-[67] w-[100%] max-w-[900px]">
      <div className="flex pt-[16px] pr-[20px] pb-[16px] pl-[20px] flex-col gap-[16px] items-start self-stretch bg-[#fff] rounded-[8px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <span className="text-[18px] font-semibold text-[#1f2937] font-['Poppins']">
            Order Filters
          </span>
          <div className="flex gap-2">
            <button className="flex items-center px-[13px] py-[9px] rounded-[8px] border border-[#d1d5db] bg-white text-[#374151] text-[14px] font-medium font-['Poppins']">
              <img
                src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/SB8PAjcO1O.png"
                className="w-[14px] h-[14px] mr-2"
                alt="reset"
              />
              Reset
            </button>
            <button className="flex items-center px-[12px] py-[9px] rounded-[8px] bg-[#09091a] text-white text-[14px] font-medium font-['Poppins']">
              <img
                src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/kwK7ZuLzcU.png"
                className="w-[14px] h-[14px] mr-2"
                alt="apply"
              />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Filter Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[24px] w-full">
          {/* Date Range dropdown component */}
          <div className="flex flex-col gap-[8px] w-full">
            <span className="text-[14px] font-medium text-[#374151] font-['Poppins']">
              Date Range
            </span>
            <DateRangeFilter />
          </div>

          {/* Placeholder dropdowns for Status, Train, and Payment Mode */}
          {[
            { label: "Status", icon: "kF6NQPwkzr.png", defaultText: "All Status" },
            { label: "By Train", icon: "5r2rPpJH6t.png", defaultText: "All Trains" },
            { label: "Payment Mode", icon: "c6xRECZR6O.png", defaultText: "All" },
          ].map(({ label, icon, defaultText }) => (
            <div key={label} className="flex flex-col gap-[8px] w-full">
              <span className="text-[14px] font-medium text-[#374151] font-['Poppins']">
                {label}
              </span>
              <div className="relative bg-[#f9fafb] rounded-[8px] h-[40px] flex items-center px-3">
                <span className="text-[14px] text-black font-['Poppins']">
                  {defaultText}
                </span>
                <img
                  src={`https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/${icon}`}
                  className="w-[21px] h-[21px] ml-auto"
                  alt={`${label} icon`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
