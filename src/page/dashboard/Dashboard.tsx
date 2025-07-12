import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import GmailIntegration from "../../components/GmailIntegration";
import ProfilePopUp from "../../components/profilepopup";
import "./index.css";

export default function Dashboard() {
  const location = useLocation();
  const activePath = location.pathname.split("/")[2] || "";
  const [showGmailIntegration, setShowGmailIntegration] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [emailProcessing, setEmailProcessing] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleGmailProcessComplete = () => {
    setShowGmailIntegration(false);
    setIsGmailConnected(true);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setShowGmailIntegration(false);
    }
  };

  useEffect(() => {
    if (showGmailIntegration) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showGmailIntegration]);

  useEffect(() => {
    const checkConnectionAndProcessEmails = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/api/gmail/accounts/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        const connected = data.some((acc) => acc.is_connected);
        setIsGmailConnected(connected);

        if (connected) {
          setEmailProcessing(true);
          await fetch("http://localhost:8000/api/gmail/process-emails/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("✅ Emails processed automatically on login");
          setEmailProcessing(false);
        }
      } catch (error) {
        console.error("❌ Error processing emails:", error);
        setEmailProcessing(false);
      }
    };

    checkConnectionAndProcessEmails();
  }, []);

  const menuItems = [
    { path: "", label: "Dashboard", icon: "X7vJfTYzc2" },
    { path: "manageorders", label: "Manage Orders", icon: "iCkre7gWZW" },
    { path: "Inventory", label: "Inventory", icon: "OsKDoSAPKM" },
    { path: "DeliveryExec", label: "Delivery Exec", icon: "WfYy0kOP6N" },
    { path: "Report", label: "Report", icon: "WTLNPTPGWQ" },
  ];

  return (
    <div className="flex h-screen bg-[#fff] overflow-hidden">
      <div className="w-[220px] h-full bg-[#ffffff] shadow-[0_1px_4px_0_rgba(12,12,13,0.05)] px-[24px] py-[16px] flex flex-col gap-[16px] relative">
        <div className="border-t border-[#d9d9d9] pb-[12px] flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center justify-between">
             <span className="font-['Poppins'] text-[24px] font-semibold leading-[36px] text-[#09091a] whitespace-nowrap">
                RCMS
                </span>
                <button
                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                 className="w-[28px] h-[28px] shrink-0 bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-11/ZnvZCoRLwV.png')] bg-cover bg-no-repeat"
                />
            </div>
            <span className="text-[12px] font-medium text-[#b9babd] font-['Poppins'] leading-[18px]">
              IRCTC Master Kitchen
            </span>
          </div>
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
        <div className="flex flex-col gap-[4px]">
          {menuItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`flex items-center px-[16px] py-[12px] rounded-[16px] ${isActive ? "bg-[#09091a]" : "bg-[#ffffff]"}`}
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
        <div className="w-full  pt-[10px] pb-[16px] border-b border-[#e5e7eb] mt-auto">
           <div className="relative">
          <div
             className="flex items-center gap-[12px] cursor-pointer transition-colors duration-200 active:bg-gray-100 rounded-full px-2 py-1"
          >
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

  </div>    
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-end p-6 bg-white h-[81px] shadow-sm">
          <div className="flex items-center gap-5">
            {!isGmailConnected && (
              <button
                onClick={() => setShowGmailIntegration(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                Connect Gmail
              </button>
            )}
            {!isGmailConnected && (
              <p className="text-red-600 text-sm mt-2">
                📩 Please connect your Gmail to fetch order emails.
              </p>
            )}
            {emailProcessing && (
              <p className="text-sm text-blue-500 mt-2">⏳ Processing your emails...</p>
            )}
          </div>

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

        <div className="relative flex-1 overflow-y-auto">
          <Outlet />

          {showGmailIntegration && (
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 z-[999] flex items-center justify-center">
              <div ref={popupRef} className="relative w-[90%] max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-[1000]">
                <button
                  onClick={() => setShowGmailIntegration(false)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg font-bold"
                >
                  x
                </button>
                <GmailIntegration onProcessComplete={handleGmailProcessComplete} />
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
