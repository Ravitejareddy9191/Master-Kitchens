import React from "react";

export default function DateRangeFilter() {
  return (
    <div className="main-container flex w-[264px] pt-[12px] pr-[12px] pb-[12px] pl-[12px] flex-col gap-[8px] items-start flex-nowrap bg-[#fff] rounded-[4px] border-solid border border-[#e7e7eb] relative box-content shadow-[0_0_6px_0_rgba(0,0,0,0.15)] mx-auto my-0">
      <div className="flex pt-[2px] pr-0 pb-[2px] pl-0 gap-[10px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[4px] relative">
        <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/OiKq84gZBB.png)] bg-cover bg-no-repeat relative z-[1]" />
        <div className="flex w-[14px] gap-[10px] items-center shrink-0 flex-nowrap relative z-[2]">
          <div className="flex w-[14px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[3]">
            <span className="h-[18px] shrink-0 basis-auto font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#707683] relative text-left whitespace-nowrap z-[4]">
              All
            </span>
          </div>
        </div>
      </div>
      <div className="flex pt-[2px] pr-0 pb-[2px] pl-0 gap-[10px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[4px] relative z-[5]">
        <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/w3iyzLHiEn.png)] bg-cover bg-no-repeat relative z-[6]" />
        <div className="flex w-[67px] gap-[10px] items-center shrink-0 flex-nowrap relative z-[7]">
          <div className="flex w-[67px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[8]">
            <span className="h-[18px] shrink-0 basis-auto font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#707683] relative text-left whitespace-nowrap z-[9]">
              Last 7 Days
            </span>
          </div>
        </div>
      </div>
      <div className="flex pt-[2px] pr-0 pb-[2px] pl-0 gap-[10px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[4px] relative z-10">
        <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/MVdkge2H4e.png)] bg-cover bg-no-repeat relative z-[11]" />
        <div className="flex w-[72px] gap-[10px] items-center shrink-0 flex-nowrap relative z-[12]">
          <div className="flex w-[72px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[13]">
            <span className="h-[18px] shrink-0 basis-auto font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#707683] relative text-left whitespace-nowrap z-[14]">
              Last 1 Month
            </span>
          </div>
        </div>
      </div>
      <div className="flex pt-[2px] pr-0 pb-[2px] pl-0 gap-[10px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[4px] relative z-[15]">
        <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/bFZA3pzXXV.png)] bg-cover bg-no-repeat relative z-[16]" />
        <div className="flex w-[82px] gap-[10px] items-center shrink-0 flex-nowrap relative z-[17]">
          <div className="flex w-[82px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[18]">
            <span className="h-[18px] shrink-0 basis-auto font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#707683] relative text-left whitespace-nowrap z-[19]">
              Last 3 Months
            </span>
          </div>
        </div>
      </div>
      <div className="flex pt-[2px] pr-0 pb-[2px] pl-0 gap-[10px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[4px] relative z-20">
        <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-10/F6eVJw43b5.png)] bg-cover bg-no-repeat relative z-[21]" />
        <div className="flex w-[80px] gap-[10px] items-center shrink-0 flex-nowrap relative z-[22]">
          <div className="flex w-[80px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[23]">
            <span className="h-[18px] shrink-0 basis-auto font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#707683] relative text-left whitespace-nowrap z-[24]">
              Custom Date
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
