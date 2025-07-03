import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/reset-password/${uid}/${token}/`, { password });
      alert("Password reset successful!");
      navigate("/login");
    } catch {
      setError("Reset failed. Link may have expired.");
    }
  };

  return (
    <div className="main-container w-[1440px] h-[720px] bg-[#fff] relative overflow-hidden mx-auto my-0">
      <div className="flex w-[962px] items-start bg-white rounded-[12px] shadow z-[1] mt-[60px] ml-[239px]">
        <div className="w-[480px] h-[600px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/N2GpD7Gc1t.png)] bg-cover" />
        <div className="flex flex-col pt-[60px] px-[20px] h-[600px] items-center grow bg-white rounded-[10px]">
          <div className="flex flex-col gap-[50px] w-[380px] items-center">
            <div className="flex flex-col gap-[16px] items-center">
              <span className="text-[28px] font-semibold text-[#09091a]">RCMS</span>
              <span className="text-[16px] text-[#323c47]">Reset Password</span>
            </div>

            <div className="flex flex-col gap-[12px] w-[380px]">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[48px] px-4 border border-[#e7e7eb] rounded-[8px] font-['Poppins'] text-[14px] text-[#323c47]"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[48px] px-4 border border-[#e7e7eb] rounded-[8px] font-['Poppins'] text-[14px] text-[#323c47]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div
                className="flex h-[48px] px-[18px] justify-center items-center bg-[#09091a] rounded-[8px] cursor-pointer"
                onClick={handleReset}
              >
                <span className="text-white font-medium text-[14px]">Reset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[103.47%] h-[124.44%] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-03/3GZSogoRUB.png)] bg-cover opacity-10 absolute top-[-6%] left-[-1.5%]" />
    </div>
  );
}
