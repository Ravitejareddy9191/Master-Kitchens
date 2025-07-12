import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./index.css";

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUp() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/signup/", {
        username: data.email,
        email: data.email,
        password: data.password,
      });

      alert("Signup successful!");
      navigate("/");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Signup failed: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div className="main-container w-full min-h-screen bg-white flex justify-center items-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/UQK3q4UK3Z.png)] bg-cover bg-no-repeat opacity-10 z-0" />

      {/* Signup Form Card */}
      <div className="flex flex-col md:flex-row w-[90%] max-w-[962px] min-h-[400px] bg-white rounded-xl shadow-lg overflow-hidden z-10">
        {/* Left Image */}
        <div className="w-full md:w-1/2 h-[200px] md:h-auto bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/TbNTTA49zM.png)] bg-cover bg-center bg-no-repeat" />

        {/* Right Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center w-full md:w-1/2 px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-12 bg-white overflow-y-auto"
        >
          <div className="flex flex-col gap-6 w-full max-w-[380px] items-center">
            {/* Logo and Tagline */}
            <div className="flex flex-col gap-4 items-center">
              <span className="text-2xl sm:text-3xl md:text-[28px] font-semibold text-[#09091a]">RCMS</span>
              <span className="text-sm sm:text-base md:text-[16px] text-[#323c47] text-center">
                Rail Catering Management System
              </span>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-4 w-full">
              {/* Email */}
              <div className="relative">
                <label className="absolute -top-2 left-3 text-[10px] sm:text-xs text-[#334d6e] bg-white px-1">
                  Email/Phone Number <span className="text-[#f7685b]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="abcd@gmail.com"
                  className="w-full h-10 sm:h-12 border border-[#e7e7eb] rounded-md px-4 text-sm sm:text-[14px] text-[#323c47]"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
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
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="absolute -top-2 left-3 text-[10px] sm:text-xs text-[#334d6e] bg-white px-1">
                  Confirm Password <span className="text-[#f7685b]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="***********"
                  className="w-full h-10 sm:h-12 border border-[#e7e7eb] rounded-md px-4 text-sm sm:text-[14px] text-[#323c47]"
                  {...register("confirmPassword", {
                    required: "Please confirm password",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full h-10 sm:h-12 bg-[#09091a] text-white text-sm sm:text-[14px] font-medium rounded-md"
              >
                Sign Up
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-[21px]"></div>
              <div className="flex gap-1 text-sm sm:text-[14px] font-medium">
                <span className="text-[rgba(0,0,0,0.54)]">Already have a RCMS vendor account?</span>
                <span
                  className="underline text-[#09091a] cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  Sign In
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center w-full gap-2">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="text-xs sm:text-[12px] text-[#4e4e4e]">Or continue with</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Google Sign Up */}
            <div className="w-full">
              <button className="w-full h-10 sm:h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm sm:text-[14px] text-[rgba(0,0,0,0.54)] font-medium">
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-02/4nwC3t65gC.png)] bg-cover bg-no-repeat" />
                Sign Up with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
