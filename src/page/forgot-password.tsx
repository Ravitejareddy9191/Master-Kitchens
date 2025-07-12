import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/forgot-password/", { email });
      alert("Reset link sent to your email.");
      setError("");
    } catch {
      setError("Failed to send reset link.");
    }
  };

  return (
    <div className="main-container w-[1440px] h-[720px] bg-[#fff] relative overflow-hidden mx-auto my-0">
      <div className="flex w-[962px] items-start flex-nowrap bg-[#fff] rounded-[12px] relative overflow-hidden shadow-[0_0_12px_0_rgba(0,0,0,0.15)] z-[1] mt-[60px] ml-[239px]">
        <div className="w-[480px] h-[600px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/H5aT4NhBXR.png)] bg-cover bg-no-repeat relative z-[2]" />
        <div className="flex h-[600px] pt-[60px] px-[20px] flex-col gap-[8px] items-center grow bg-white rounded-[10px] z-[3]">
          <div className="flex w-[380px] flex-col gap-[50px] items-center z-[4]">
            <div className="flex flex-col gap-[16px] items-center w-full">
              <div className="w-[82px] h-[42px] relative z-[7]">
                <span className="flex h-[42px] justify-start items-center font-['Poppins'] text-[28px] font-semibold leading-[42px] text-[#09091a] text-left z-[8]">RCMS</span>
              </div>
              <div className="flex justify-between w-full z-[9]">
                <span className="w-[243px] h-[24px] font-['Poppins'] text-[16px] text-[#323c47] text-center">IRCTC Verified Master Kitchens</span>
              </div>
            </div>

            <div className="flex w-[380px] flex-col gap-[24px] z-[11]">
              <div className="flex flex-col gap-[12px]">
                <div className="flex w-[141px] gap-[4px] items-center z-[13]">
                  <div className="w-[20px] h-[20px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/9m2vFHQBwG.png)] bg-cover z-[14]" />
                  <span className="font-['Poppins'] text-[14px] font-medium text-[#09091a] z-[15]">Forget Password</span>
                </div>
              </div>

              <div className="flex flex-col gap-[12px] items-center z-[16]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abcd@gmail.com"
                  className="w-[380px] h-[48px] px-[14px] border border-[#e7e7eb] rounded-[8px] font-['Poppins'] text-[14px] text-[#323c47]"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div
                  className="flex h-[48px] px-[18px] justify-center items-center bg-[#09091a] rounded-[8px] cursor-pointer"
                  onClick={handleSend}
                >
                  <div className="flex w-[109px] justify-center">
                    <span className="text-white font-['Poppins'] text-[14px] font-medium">Send Reset Link</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[103.47%] h-[124.44%] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/fr8Mv9eqUd.png)] bg-cover opacity-10 absolute top-[-6.25%] left-[-1.74%]" />
    </div>
  );
}
