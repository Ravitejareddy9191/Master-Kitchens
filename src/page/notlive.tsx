import React from "react";
import "./index.css";

export default function NotLive() {
  return (
    <div className="main-container flex w-[304px] pt-[24px] pr-[24px] pb-[24px] pl-[24px] flex-col gap-[24px] items-center flex-nowrap bg-[#fff] rounded-[12px] relative mx-auto my-0">
      <div className="flex w-[250px] flex-col gap-[65px] items-center shrink-0 flex-nowrap relative">
        <span className="flex w-[129px] h-[27px] justify-center items-start shrink-0 basis-auto font-['Poppins'] text-[20px] font-semibold leading-[27px] text-[#334756] tracking-[-0.5px] relative text-center whitespace-nowrap z-[1]">
          Working on it
        </span>
        <div className="flex w-[250px] flex-col gap-[12px] items-center shrink-0 flex-nowrap relative z-[2]">
          <div className="w-[250px] h-[216.971px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-05/Peut1EvkMi.png)] bg-cover bg-no-repeat relative z-[3]" />
        </div>
      </div>
      <span className="flex w-[256px] h-[40px] justify-center items-start shrink-0 font-['Hind_Guntur'] text-[14px] font-normal leading-[20px] text-[#77848d] tracking-[-0.35px] relative text-center z-[4]">
        This feature isn’t live yet, but it’s coming soon. Stay tuned!
      </span>
    </div>
  );
}

