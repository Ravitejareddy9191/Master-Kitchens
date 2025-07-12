import React from "react";

export default function StatusFilter() {
  return (
    <div className="main-container flex w-[264px] pt-[12px] pr-[12px] pb-[12px] pl-[12px] flex-col gap-[8px] items-start flex-nowrap bg-[#fff] rounded-[4px] border-solid border border-[#e7e7eb] relative box-content shadow-[0_0_6px_0_rgba(0,0,0,0.15)] mx-auto my-0">
      {[
        "All Status",
        "Placed",
        "Confirmed",
        "Delivered",
        "Undelivered",
        "Cancelled",
        "Partially delivered",
      ].map((label, index) => (
        <div
          key={index}
          className="flex pt-[2px] pr-0 pb-[2px] pl-0 gap-[10px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[4px] relative"
        >
          <div className="flex w-[24px] h-[24px] pt-[4px] pr-[4px] pb-[4px] pl-[4px] flex-col justify-center items-center shrink-0 flex-nowrap relative">
            <div className="flex w-[40px] pt-[11px] pr-[11px] pb-[11px] pl-[11px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] relative">
              <div className="w-[18px] h-[18px] shrink-0 bg-[#09091a] rounded-[2px]" />
            </div>
          </div>
          <div className="flex gap-[10px] items-center shrink-0 flex-nowrap relative">
            <span className="h-[18px] font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#707683] whitespace-nowrap">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

