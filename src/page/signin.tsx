import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./index.css";

type LoginForm = {
  username: string;
  password: string;
};

export default function SignIn() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        username: data.username,
        password: data.password,
      });

      // Store JWT tokens in localStorage
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // ✅ Directly go to dashboard — Welcome popup handled there
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Invalid username or password");
    }
  };

  return (
    <div className="main-container w-full min-h-screen bg-white flex justify-center items-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/UQK3q4UK3Z.png)] bg-cover bg-no-repeat opacity-10 z-0" />

      {/* Login Form */}
      <div className="flex flex-col md:flex-row w-[80%] max-w-[962px] h-[600px] bg-white rounded-xl shadow-lg overflow-hidden z-10">
        {/* Left Image */}
        <div className="w-full md:w-1/2 h-[200px] md:h-auto bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/TbNTTA49zM.png)] bg-cover bg-center bg-no-repeat" />

        {/* Right Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center w-full md:w-1/2 px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-12 bg-white overflow-y-auto"
        >
          <div className="flex flex-col gap-6 w-full max-w-[380px] items-center">
            {/* Logo */}
            <div className="flex flex-col gap-4 items-center">
              <span className="text-2xl sm:text-3xl md:text-[28px] font-semibold text-[#09091a]">RCMS</span>
              <span className="text-sm sm:text-base md:text-[16px] text-[#323c47] text-center">
                Rail Catering Management System
              </span>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-4 w-full">
              {/* Username */}
              <div className="relative">
                <label className="absolute -top-2 left-3 text-[10px] sm:text-xs text-[#334d6e] bg-white px-1">
                  Email/Phone Number <span className="text-[#f7685b]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="abcd@gmail.com"
                  className="w-full h-10 sm:h-12 border border-[#e7e7eb] rounded-md px-4 text-sm sm:text-[14px] text-[#323c47]"
                  {...register("username", { required: "Username is required" })}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label className="absolute -top-2 left-3 text-[10px] sm:text-xs text-[#334d6e] bg-white px-1">
                  Password <span className="text-[#f7685b]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="***********"
                  className="w-full h-10 sm:h-12 border border-[#e7e7eb] rounded-md px-4 text-sm sm:text-[14px] text-[#323c47]"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full h-10 sm:h-12 bg-[#09091a] text-white text-sm sm:text-[14px] font-medium rounded-md"
              >
                Sign In
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-sm sm:text-[14px] font-medium underline text-[#09091a] cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
              <div className="flex gap-1 text-sm sm:text-[14px] font-medium">
                <span className="text-[rgba(0,0,0,0.54)]">Not Associated with RCMS as a vendor?</span>
                <span
                  className="underline text-[#09091a] cursor-pointer"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center w-full gap-2">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="text-xs sm:text-[12px] text-[#4e4e4e]">Or continue with</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Google Sign In */}
            <div className="w-full">
              <button className="w-full h-10 sm:h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm sm:text-[14px] text-[rgba(0,0,0,0.54)] font-medium">
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/4nwC3t65gC.png)] bg-cover bg-no-repeat" />
                Sign In with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
