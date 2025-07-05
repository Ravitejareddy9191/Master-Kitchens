// src/pages/dashboard/Dashboard.tsx
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./index.css";

export default function Dashboard() {
  const location = useLocation();
  const activePath = location.pathname.split("/")[2] || ""; // handle empty path

  const menuItems = [
    { path: "", label: "Dashboard", icon: "X7vJfTYzc2" },
    { path: "manage-orders", label: "Manage Orders", icon: "iCkre7gWZW" },
    { path: "inventory", label: "Inventory", icon: "OsKDoSAPKM" },
    { path: "delivery-exec", label: "Delivery Exec", icon: "WfYy0kOP6N" },
    { path: "report", label: "Report", icon: "WTLNPTPGWQ" },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Sidebar */}
      <div className="w-[220px] h-full bg-[#ffffff] shadow-[0_1px_4px_0_rgba(12,12,13,0.05)] px-[24px] py-[16px] flex flex-col gap-[16px]">
        {/* Header */}
        <div className="border-t border-[#d9d9d9] pb-[12px] flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[2px]">
            <div className="w-[71px] h-[36px] relative">
              <span className="absolute top-0 left-0 text-[24px] font-semibold text-[#09091a] font-['Poppins'] leading-[36px]">
                RCMS
              </span>
            </div>
            <span className="text-[12px] font-medium text-[#b9babd] font-['Poppins'] leading-[18px]">
              IRCTC Master Kitchen
            </span>
          </div>

          {/* Kitchen Location */}
          <div className="bg-[#e6e6e6] rounded-[16px] px-[8px] py-[8px] flex items-center gap-[12px]">
            <div className="w-[30px] h-[30px] bg-white rounded-full flex justify-center items-center">
              <div className="w-[16.67px] h-[16px] bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/7jGWEuyqWx.png')] bg-cover bg-no-repeat" />
            </div>
            <div>
              <p className="text-[10px] text-[#6b7280] font-['Inter'] leading-[16px]">
                Kitchen Location
              </p>
              <p className="text-[12px] text-[#1f2937] font-medium font-['Inter'] leading-[24px] whitespace-nowrap">
                New Delhi Central
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div className="flex flex-col gap-[4px]">
          {menuItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`flex items-center px-[16px] py-[12px] rounded-[16px] ${
                  isActive ? "bg-[#09091a]" : "bg-[#ffffff]"
                }`}
              >
                <div
                  className="w-[20px] h-[20px] bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: `url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/${item.icon}.png')`,
                  }}
                />
                <span
                  className={`ml-[12px] text-[14px] font-['Poppins'] leading-[24px] whitespace-nowrap ${
                    isActive ? "text-white font-semibold" : "text-[#4b5563] font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Profile Section */}
        <div className="w-full pt-[17px] pb-[16px] border-b border-[#e5e7eb] mt-auto">
          <div className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-full bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/m9NB7jBp5Z.png')] bg-cover bg-no-repeat" />
            <div>
              <p className="text-[14px] text-[#1f2937] font-medium font-['Poppins'] leading-[20px]">
                Rajesh Kumar
              </p>
              <p className="text-[11px] text-[#6b7280] font-['Poppins'] leading-[16px]">
                North Railway
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <div className="flex justify-between items-end p-6 bg-white h-[81px] shadow-sm">
          <div className="flex items-center w-[616px] border border-[#ebebeb] rounded-[8px] p-[12px] bg-[#fdfdfd]">
            <input
              type="text"
              placeholder="Search for trains, Reports etc"
              className="w-full bg-transparent text-sm text-[#969ba0] outline-none"
            />
            <div className="w-[20px] h-[20px] bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/43W13qn68e.png')] bg-cover ml-2" />
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-[36px] h-[36px] bg-[rgba(116,116,116,0.15)] rounded-[15px] flex justify-center items-center">
              <div className="w-[20px] h-[20px] bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/RpH4AwcRf0.png')] bg-cover" />
              <span className="absolute -top-2 -right-1 bg-black text-white text-[8px] rounded-full px-[4px]">
                21
              </span>
            </div>
            <div className="relative w-[36px] h-[36px] bg-[rgba(116,116,116,0.15)] rounded-[15px] flex justify-center items-center">
              <div className="w-[20px] h-[20px] bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/XbksDVCFWR.png')] bg-cover" />
              <span className="absolute -top-2 -right-1 bg-black text-white text-[8px] rounded-full px-[4px]">
                21
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
