import React from "react";
import { useNavigate} from 'react-router-dom';
import "./index.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  return (
    <div className="main-container w-[1440px] h-[720px] bg-[#fff] relative overflow-hidden mx-auto my-0">
      <div className="flex w-[962px] items-start flex-nowrap bg-[#fff] rounded-[12px] relative overflow-hidden shadow-[0_0_12px_0_rgba(0,0,0,0.15)] z-[1] mt-[60px] mr-0 mb-0 ml-[239px]">
        <div className="w-[480px] h-[600px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/H5aT4NhBXR.png)] bg-cover bg-no-repeat relative z-[2]" />
        <div className="flex h-[600px] pt-[60px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[8px] items-center grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[10px] relative z-[3]">
          <div className="flex w-[380px] flex-col gap-[50px] items-center shrink-0 flex-nowrap relative z-[4]">
            <div className="flex flex-col gap-[16px] items-center self-stretch shrink-0 flex-nowrap relative z-[5]">
              <div className="flex flex-col gap-[40px] items-center self-stretch shrink-0 flex-nowrap relative z-[6]">
                <div className="w-[82px] h-[42px] shrink-0 relative z-[7]">
                  <span className="flex h-[42px] justify-start items-center font-['Poppins'] text-[28px] font-semibold leading-[42px] text-[#09091a] absolute top-0 left-[calc(50%-41px)] text-left whitespace-nowrap z-[8]">
                    RCMS
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start self-stretch shrink-0 flex-nowrap relative z-[9]">
                <span className="flex w-[243px] h-[24px] justify-center items-center shrink-0 basis-auto font-['Poppins'] text-[16px] font-normal leading-[24px] text-[#323c47] relative text-center whitespace-nowrap z-10">
                  IRCTC Verified Master Kitchens
                </span>
              </div>
            </div>
            <div className="flex w-[380px] flex-col gap-[24px] items-start shrink-0 flex-nowrap relative z-[11]">
              <div className="flex flex-col gap-[12px] items-start self-stretch shrink-0 flex-nowrap relative z-[12]">
                <div className="flex w-[141px] gap-[4px] items-center shrink-0 flex-nowrap relative z-[13]">
                  <div className="w-[20px] h-[20px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/9m2vFHQBwG.png)] bg-[length:100%_100%] bg-no-repeat relative z-[14]" />
                  <span className="h-[21px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[21px] text-[#09091a] relative text-left whitespace-nowrap z-[15]">
                    Forget Password
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-[12px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[16]">
                <div className="flex w-[380px] h-[48px] pt-[12px] pr-[14px] pb-[12px] pl-[14px] gap-[8px] items-center shrink-0 flex-nowrap bg-[#fff] rounded-[8px] border-solid border border-[#e7e7eb] relative z-[17]">
                  <div className="flex w-[120px] h-[15px] pt-0 pr-[3px] pb-0 pl-[3px] gap-[10px] items-center shrink-0 flex-nowrap bg-[#fff] absolute top-[-6px] left-[12px] z-[18]">
                    <div className="w-[114px] shrink-0 font-['Roboto'] text-[10px] font-normal leading-[11.719px] relative text-left whitespace-nowrap z-[19]">
                      <span className="font-['Poppins'] text-[10px] font-normal leading-[11.719px] text-[#334d6e] relative text-left">
                        Email/Phone Number{" "}
                      </span>
                      <span className="font-['Poppins'] text-[10px] font-normal leading-[11.719px] text-[#f7685b] relative text-left">
                        *{" "}
                      </span>
                    </div>
                  </div>
                  <span className="h-[21px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[21px] text-[#323c47] relative text-left whitespace-nowrap z-20">
                    abcd@gmail.com
                  </span>
                </div>
                
                <div className="flex h-[48px] pt-[12px] pr-[18px] pb-[12px] pl-[18px] gap-[4px] justify-center items-center self-stretch shrink-0 flex-nowrap bg-[#09091a] rounded-[8px] relative overflow-hidden z-[21]">
                  <div className="flex w-[109px] gap-[4px] justify-center items-center shrink-0 flex-nowrap relative z-[22]">
                    <span className="h-[21px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[21px] text-[#fff] relative text-left capitalize whitespace-nowrap z-[23] cursor-pointer" onClick={() => navigate('resetpassword')} >
                      Send Reset Link
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-[130px] h-[15px] p-0 gap-[1186px] items-start flex-nowrap opacity-80 relative z-[24] mt-[38px] mr-0 mb-0 ml-[655.5px]" />
      <div className="w-[103.47%] h-[124.44%] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/fr8Mv9eqUd.png)] bg-cover bg-no-repeat opacity-10 absolute top-[-6.25%] left-[-1.74%]" />
    </div>
  );
}

