import React from "react";
import "./index.css";

export default function WelcomePage() {
  return (
    <div className="main-container flex w-[320px] pt-[24px] pr-[24px] pb-[24px] pl-[24px] flex-col gap-[24px] items-center flex-nowrap bg-[#fff] rounded-[12px] relative mx-auto my-0">
      <div className="flex w-[233px] flex-col gap-[65px] items-center shrink-0 flex-nowrap relative">
        <span className="flex w-[233px] h-[27px] justify-center items-start shrink-0 basis-auto font-['Poppins'] text-[20px] font-semibold leading-[27px] text-[#334756] tracking-[-0.5px] relative text-center whitespace-nowrap z-[1]">
          Welcome, Food Partner!
        </span>
        <div className="w-[206px] h-[137px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/TSzJTsENFD.png)] bg-cover bg-no-repeat relative z-[2]" />
      </div>
      <span className="flex w-[256px] h-[80px] justify-center items-start shrink-0 font-['Hind_Guntur'] text-[14px] font-normal leading-[20px] text-[#77848d] tracking-[-0.35px] relative text-center z-[3]">
        We're excited to have you on board. Your delicious meals will now reach
        hungry travelers across the rails.{" "}
      </span>
      <div className="flex w-[272px] h-[60px] pt-[15px] pr-[15px] pb-[15px] pl-[15px] justify-between items-center shrink-0 flex-nowrap bg-[#09091a] rounded-[15px] relative shadow-[0_25px_50px_0_rgba(0,0,0,0.1)] z-[4]">
        <span className="h-[24px] shrink-0 basis-auto font-['Poppins'] text-[16px] font-medium leading-[24px] text-[#fff] tracking-[-0.4px] relative text-left whitespace-nowrap z-[5]">
          Get Started
        </span>
        <div className="w-[18px] h-[18px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/BVE3jzTaGp.png)] bg-cover bg-no-repeat relative z-[6]" />
      </div>
    </div>
  );
}

