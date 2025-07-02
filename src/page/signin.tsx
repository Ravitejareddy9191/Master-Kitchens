import React from "react";
import "./index.css";

export default function SignIn({ togglePage }) {
  return (
    <div className="main-container w-full h-screen bg-white flex justify-center items-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/UQK3q4UK3Z.png)] bg-cover bg-no-repeat opacity-10 z-0" />

      {/* Login Card */}
      <div className="flex w-[90%] max-w-[962px] h-[600px] bg-white rounded-xl shadow-lg overflow-hidden z-10">
        {/* Left Image */}
        <div className="w-[600px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/TbNTTA49zM.png)] bg-cover bg-center bg-no-repeat" />

        {/* Right Form */}
        <div className="flex flex-col justify-center items-center w-[600px] px-10 py-12 bg-white overflow-y-auto">
          <div className="flex flex-col gap-6 w-full max-w-[380px] items-center">
            {/* Logo and Tagline */}
            <div className="flex flex-col gap-4 items-center">
              <span className="text-[28px] font-semibold text-[#09091a]">RCMS</span>
              <span className="text-[16px] text-[#323c47] text-center">
                IRCTC Verified Master Kitchens
              </span>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-4 w-full">
              {/* Email */}
              <div className="relative">
                <label className="absolute -top-2 left-3 text-[10px] text-[#334d6e] bg-white px-1">
                  Email/Phone Number <span className="text-[#f7685b]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="abcd@gmail.com"
                  className="w-full h-[48px] px-4 border border-[#e7e7eb] rounded-md text-[14px] text-[#323c47]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="absolute -top-2 left-3 text-[10px] text-[#334d6e] bg-white px-1">
                  Password <span className="text-[#f7685b]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="***********"
                  className="w-full h-[48px] px-4 border border-[#e7e7eb] rounded-md text-[14px] text-[#323c47]"
                />
              </div>

              {/* Sign In Button */}
              <button className="w-full h-[48px] bg-[#09091a] text-white text-[14px] font-medium rounded-md">
                Sign In
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[14px] font-medium underline text-[#09091a] cursor-pointer">
                Forgot Password?
              </span>
              <div className="flex gap-1 text-[14px] font-medium">
                <span className="text-[rgba(0,0,0,0.54)]">Create New Account?</span>
                <span className="underline text-[#09091a] cursor-pointer" onClick={togglePage}>Sign Up</span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center w-full gap-2">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="text-[12px] text-[#4e4e4e]">Or continue with</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Google Sign In */}
            <div className="w-full">
              <button className="w-full h-[48px] flex items-center justify-center gap-3 border border-gray-300 rounded-md shadow-sm bg-white text-[14px] text-[rgba(0,0,0,0.54)] font-medium">
                <div className="w-6 h-6 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/4nwC3t65gC.png)] bg-cover bg-no-repeat" />
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
