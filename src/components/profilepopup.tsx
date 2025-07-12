import React from "react";

export default function ProfilePopUp() {
  return (
    <div className="main-container flex w-[190px] flex-col items-center flex-nowrap rounded-[8px] relative mx-auto my-0">
      <div className="flex pt-[4px] pr-[12px] pb-[8px] pl-[12px] flex-col items-start self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[8px] relative">
        <div className="flex pt-[4px] pr-[12px] pb-[20px] pl-[12px] flex-col gap-[16px] items-center self-stretch shrink-0 flex-nowrap relative z-[1]">
          <div className="flex w-[123px] flex-col gap-[10px] items-center shrink-0 flex-nowrap relative z-[2]">
            <div className="w-[80px] h-[80px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/FVfokGGfKi.png)] bg-cover bg-no-repeat rounded-full relative overflow-hidden z-[3]" />
            <div className="flex w-[123px] flex-col gap-[6px] items-center shrink-0 flex-nowrap relative z-[4]">
              <div className="flex w-[84px] gap-[4px] justify-center items-center shrink-0 flex-nowrap relative z-[5]">
                <span className="h-[24px] shrink-0 basis-auto font-['Poppins'] text-[16px] font-medium leading-[24px] text-[#555559] relative text-left capitalize whitespace-nowrap z-[6]">
                  Username
                </span>
              </div>
              <div className="flex gap-[4px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[7]">
                <span className="h-[18px] shrink-0 basis-auto font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#555559] relative text-left whitespace-nowrap z-[8]">
                  ID: INDRLY240873090
                </span>
              </div>
              <div className="flex gap-[4px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[9]">
                <span className="h-[18px] shrink-0 basis-auto font-['Poppins'] text-[12px] font-normal leading-[18px] text-[#555559] relative text-left whitespace-nowrap z-10">
                  Southern Railway
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative z-[11]">
            <div className="flex flex-col items-start self-stretch shrink-0 flex-nowrap relative z-[12]">
              <div className="flex pt-[8px] pr-0 pb-[8px] pl-0 gap-[8px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] relative z-[13]">
                <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/WoVfKbW7gs.png)] bg-cover bg-no-repeat relative z-[14]" />
                <div className="flex h-[24px] gap-[10px] justify-center items-center grow shrink-0 basis-0 flex-nowrap rounded-[1px] relative z-[15]">
                  <span className="h-[21px] grow shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[21px] text-[#555559] relative text-left whitespace-nowrap z-[16]">
                    My Profile
                  </span>
                </div>
              </div>
              <div className="flex pt-[8px] pr-0 pb-[8px] pl-0 gap-[8px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] relative z-[17]">
                <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/x6efJENYHq.png)] bg-cover bg-no-repeat relative z-[18]" />
                <div className="flex h-[24px] gap-[10px] justify-center items-center grow shrink-0 basis-0 flex-nowrap rounded-[1px] relative z-[19]">
                  <span className="h-[21px] grow shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[21px] text-[#555559] relative text-left whitespace-nowrap z-20">
                    Help & Support
                  </span>
                </div>
              </div>
              <div className="flex pt-[8px] pr-0 pb-[8px] pl-0 gap-[8px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] relative z-[21]">
                <div className="w-[24px] h-[13px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/si98tc4vH7.png)] bg-cover bg-no-repeat relative z-[22]" />
                <div className="flex h-[24px] gap-[10px] justify-center items-center grow shrink-0 basis-0 flex-nowrap rounded-[1px] relative z-[23]">
                  <span className="h-[12px] grow shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[21px] text-[#555559] relative text-left whitespace-nowrap z-[24]">
                    Logout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
