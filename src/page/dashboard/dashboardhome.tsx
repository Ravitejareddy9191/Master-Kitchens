import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./index.css";
import OrderDetailsDropdown from "../../components/OrderDetailsDropdown";
import OrderStatusDropdown from "../../components/OrderStatusDropDown";

interface Order {
  id: number;
  vendor: string;
  vendor_display: string;
  order_id: string;
  BookingDate: string;
  delivery_date: string;
  formatted_customer_details: string;
  formatted_train_station: string;
  station: string;
  payment_type_display: string;
  grand_total: string;
  status: string;
  status_display: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  item_details: string;
  item_description: string;
  sub_total: string
  gst: string
}

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

interface OrderStats {
  todayOrders: number;
  pending: number;
  delivered: number;
  cancelled: number;
  undelivered: number;
}

export default function DashboardHome() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [openDropdownOrderId, setOpenDropdownOrderId] = useState<Number | null>(null);
  const [stats, setStats] = useState<OrderStats>({
    todayOrders: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    undelivered: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [selectedStatus]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("access");
      const response = await fetch("http://localhost:8000/api/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error("Failed to fetch notifications");
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      let url = "http://localhost:8000/api/orders/";
      if (selectedStatus !== "all") {
        url += `?status=${selectedStatus}`;
      }

      let allOrders: Order[] = [];
      let nextUrl: string | null = url;

      while (nextUrl) {
        const response = await fetch(nextUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          allOrders = [...allOrders, ...(data.results || [])];
          nextUrl = data.next;
        } else {
          console.error("Failed to fetch orders");
          break;
        }
      }

      setOrders(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch("http://localhost:8000/api/stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getPaymentBadge = (paymentType: string) => {
    return paymentType?.toLowerCase() === "online"
      ? "border-green-200 text-green-700"
      : "border-blue-200 text-blue-700";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  return (
    <div className="main-container flex flex-col w-full h-screen overflow-hidden">

      <div className="flex flex-col gap-[24px] items-start self-stretch grow shrink-0 basis-0 flex-nowrap bg-[#f5f5f5] relative overflow-hidden">
        <div className="flex flex-col gap-[10px] items-start self-stretch shrink-0 flex-nowrap relative z-[1]">
          <div className="flex h-[28px] justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[2]">
            <div className="flex pl-[15px] gap-[6px] items-center grow shrink-0 basis-0 flex-nowrap relative z-[3]">
              <span className="h-[27px] shrink-0 basis-auto font-['Poppins'] text-[16px] leading-[27px] text-[#334756] tracking-[-0.4px] relative text-left whitespace-nowrap z-[4] mt-[17px]">
                Dashboard
              </span>
            </div>
            <div className="flex w-[82.7px] pt-[7px] pr-[20px] pb-[5px] pl-[13px] flex-col gap-[4.71px] items-center shrink-0 flex-nowrap bg-[#fff] rounded-[8px] border-solid border border-[#d1d5db] relative z-[5] mt-[17px]">
              <div className="flex w-[56px] items-center shrink-0 flex-nowrap relative z-[6]">
                <div className="flex  w-[38px] gap-[8px] items-end shrink-0 flex-nowrap relative z-[7]">
                  <span className="flex w-[38px] h-[20px] justify-center items-center shrink-0 basis-auto font-['Poppins'] text-[12px] font-medium leading-[20px] text-[#4b5563] relative text-center whitespace-nowrap z-[8]">
                    Today
                  </span>
                </div>
                <div className="w-[18px] h-[18px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/Oc3F85Y2B2.png)] bg-[length:100%_100%] bg-no-repeat relative z-[9]" />
              </div>
            </div>
          </div>
          <div className="flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[10px] items-start self-stretch shrink-0 flex-nowrap relative z-10">
            <div className="flex w-[1353px] gap-[20px] md:gap-[40px] items-start shrink-0 flex-nowrap relative z-[11]">
              <div className="flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[16px] items-start grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_1px_4px_0_rgba(12,12,13,0.05)] z-[12]">
                <div className="flex justify-between items-start self-stretch shrink-0 flex-nowrap relative z-[13]">
                  <div className="flex w-[118px] flex-col items-start shrink-0 flex-nowrap relative z-[14]">
                    <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[15]">
                      Orders for Today
                    </span>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Poppins'] text-[24px] font-semibold leading-[36px] text-[#1f2937] relative text-left whitespace-nowrap z-[16]">
                    {stats.todayOrders}
                    </span>
                  </div>
                  <div className="w-[52px] h-[52.425px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/fn30BDLt7b.png)] bg-cover bg-no-repeat relative z-[17]" />
                </div>
                <div className="flex w-[147.157px] gap-[7px] items-center shrink-0 flex-nowrap relative z-[18]">
                  <div className="flex w-[51.157px] gap-px items-center shrink-0 flex-nowrap relative z-[19]">
                    <div className="w-[14.6px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/HYoPXCZR9X.png)] bg-cover bg-no-repeat relative z-20" />
                    <span className="flex w-[35.557px] h-[20px] justify-start items-center shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#22c55e] relative text-left whitespace-nowrap z-[21]">
                      3.2%
                    </span>
                  </div>
                  <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[22]">
                    vs yesterday
                  </span>
                </div>
              </div>
              <div className="flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[16px] items-start grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_1px_4px_0_rgba(12,12,13,0.05)] z-[23]">
                <div className="flex justify-between items-start self-stretch shrink-0 flex-nowrap relative z-[24]">
                  <div className="flex w-[132.052px] flex-col items-start shrink-0 flex-nowrap relative z-[25]">
                    <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[26]">
                      Pending orders
                    </span>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Poppins'] text-[24px] font-semibold leading-[36px] text-[#1f2937] relative text-left whitespace-nowrap z-[27]">
                      {stats.pending}
                    </span>
                  </div>
                  <div className="w-[52px] h-[52.425px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/ioHrNvHSBB.png)] bg-cover bg-no-repeat relative z-[28]" />
                </div>
                <div className="flex w-[147.157px] gap-[7px] items-center shrink-0 flex-nowrap relative z-[29]">
                  <div className="flex w-[51.157px] gap-px items-center shrink-0 flex-nowrap relative z-30">
                    <div className="w-[14.6px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/OKpHgfrUng.png)] bg-cover bg-no-repeat relative z-[31]" />
                    <span className="flex w-[35.557px] h-[20px] justify-start items-center shrink-0 basis-auto font-['Inter'] text-[14px] font-medium leading-[20px] text-[#22c55e] relative text-left whitespace-nowrap z-[32]">
                      5.7%
                    </span>
                  </div>
                  <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[33]">
                    vs yesterday
                  </span>
                </div>
              </div>
              <div className="flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[16px] items-start grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_1px_4px_0_rgba(12,12,13,0.05)] z-[34]">
                <div className="flex justify-between items-start self-stretch shrink-0 flex-nowrap relative z-[35]">
                  <div className="flex w-[132.052px] flex-col items-start shrink-0 flex-nowrap relative z-[36]">
                    <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[37]">
                      Delivered Order{" "}
                    </span>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Poppins'] text-[24px] font-semibold leading-[36px] text-[#1f2937] relative text-left whitespace-nowrap z-[38]">
                      {stats.delivered}
                    </span>
                  </div>
                  <div className="w-[52px] h-[52.425px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/bMR061EQad.png)] bg-cover bg-no-repeat relative z-[39]" />
                </div>
                <div className="flex w-[147.157px] gap-[7px] items-center shrink-0 flex-nowrap relative z-40">
                  <div className="flex w-[51.157px] gap-px items-center shrink-0 flex-nowrap relative z-[41]">
                    <div className="w-[14.6px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/jUrZC2OJX6.png)] bg-cover bg-no-repeat relative z-[42]" />
                    <span className="flex w-[35.557px] h-[20px] justify-start items-center shrink-0 basis-auto font-['Inter'] text-[14px] font-medium leading-[20px] text-[#ef4444] relative text-left whitespace-nowrap z-[43]">
                      0.3%
                    </span>
                  </div>
                  <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[44]">
                    vs yesterday
                  </span>
                </div>
              </div>
              <div className="flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[16px] items-start grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_1px_4px_0_rgba(12,12,13,0.05)] z-[45]">
                <div className="flex justify-between items-start self-stretch shrink-0 flex-nowrap relative z-[46]">
                  <div className="flex w-[132.052px] flex-col items-start shrink-0 flex-nowrap relative z-[47]">
                    <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[48]">
                      Cancelled Orders
                    </span>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Poppins'] text-[24px] font-semibold leading-[36px] text-[#1f2937] relative text-left whitespace-nowrap z-[49]">
                      {stats.cancelled}
                    </span>
                  </div>
                  <div className="w-[52px] h-[52.425px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/ZvbbNCV0g9.png)] bg-cover bg-no-repeat relative z-50" />
                </div>
                <div className="flex w-[151.6px] gap-[7px] items-center shrink-0 flex-nowrap relative z-[51]">
                  <div className="flex w-[55.6px] gap-px items-center shrink-0 flex-nowrap relative z-[52]">
                    <div className="w-[14.6px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/7kKTiLXe4q.png)] bg-cover bg-no-repeat relative z-[53]" />
                    <span className="h-[20px] shrink-0 basis-auto font-['Inter'] text-[14px] font-medium leading-[20px] text-[#ef4444] relative text-left whitespace-nowrap z-[54]">
                      12.8%
                    </span>
                  </div>
                  <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[55]">
                    vs yesterday
                  </span>
                </div>
              </div>
              <div className="flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[16px] items-start grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_1px_4px_0_rgba(12,12,13,0.05)] z-[56]">
                <div className="flex justify-between items-start self-stretch shrink-0 flex-nowrap relative z-[57]">
                  <div className="flex w-[132.052px] flex-col items-start shrink-0 flex-nowrap relative z-[58]">
                    <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[59]">
                      Undelivered orders
                    </span>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Poppins'] text-[24px] font-semibold leading-[36px] text-[#1f2937] relative text-left whitespace-nowrap z-[60]">
                      {stats.undelivered}
                    </span>
                  </div>
                  <div className="w-[52px] h-[52.425px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/zPROYP0xwX.png)] bg-cover bg-no-repeat relative z-[61]" />
                </div>
                <div className="flex w-[151.6px] gap-[7px] items-center shrink-0 flex-nowrap relative z-[62]">
                  <div className="flex w-[55.6px] gap-px items-center shrink-0 flex-nowrap relative z-[63]">
                    <div className="w-[14.6px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/mxAJuqNs9J.png)] bg-cover bg-no-repeat relative z-[64]" />
                    <span className="h-[20px] shrink-0 basis-auto font-['Inter'] text-[14px] font-medium leading-[20px] text-[#ef4444] relative text-left whitespace-nowrap z-[65]">
                      12.8%
                    </span>
                  </div>
                  <span className="h-[20px] shrink-0 basis-auto font-['Poppins'] text-[14px] font-normal leading-[20px] text-[#6b7280] relative text-left whitespace-nowrap z-[66]">
                    vs yesterday
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start self-stretch shrink-0 flex-nowrap relative z-[67]">
        <div className="w-[calc(100%-420px)] flex flex-col gap-[24px] px-[24px]">
  {/* Header Row */}
  <div className="flex justify-between items-center w-full">
    <div className="text-[18px] font-['Poppins'] font-['Poppins'] text-[#1f2937]">
      Up Coming Orders
    </div>
    <button className="flex items-center gap-[8px] px-[17px] py-[9px] bg-white rounded-[8px] border border-[#d1d5db] text-[#374151] font-['Poppins'] text-[14px] leading-[20px] hover:bg-gray-100 transition">
      <img
        src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/BRfma29FRT.png"
        alt="Refresh"

      />
      Refresh
    </button>
  </div>

  {/* Orders Table or Empty State */}
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    {orders.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">No orders found</div>
        <div className="text-sm text-gray-400">
          Connect your Gmail account to automatically fetch orders from your
          emails.
        </div>
      </div>
    ) : (
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
        <table className="w-full table-auto text-[13px] text-left text-[#4b5563] font-['Poppins'] border-collapse">
        <thead className="bg-gray-200 sticky top-0 z-10 text-[13px]">
            <tr>
              <th className=" px-4 py-3 ">Order ID</th>
              <th className=" px-0 py-3">Customer Details</th>
              <th className=" px-5 py-3">Train/Station</th>
              <th className=" px-4 py-3">Payment Type</th>
              <th className=" px-4 py-3">Total Amount</th>
              <th className=" px-4 py-3">Delivery Date</th>
              <th className=" px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                className='border-b hover:bg-gray-50 cursor-pointer'
                onClick={() =>
                  setOpenDropdownOrderId((prevId) => (prevId === order.id ? null : order.id))
                }
              >
           
                <td className="px-4 py-3">{order.order_id}</td>
                <td className="px-0 py-3">{order.formatted_customer_details}</td>
                <td className="px-30 py-7">{order.formatted_train_station}</td>
                <td className="px-4 py-3">
                    <span className="px-4 py-3">
                     {order.payment_type_display}
                    </span>

                </td>
                <td className="px-4 py-4 text-xs">₹ {order.grand_total}</td>
                <td className="px-4 py-4 text-xs">{formatDate (order.delivery_date)}</td>
                <td className="px-4 py-4 text-xs">
                  <OrderStatusDropdown 
                    value={order.status_display}
                    onChange={(newStatus) => console.log("Selected:", newStatus)}
                />
              </td>
              </tr>
              {openDropdownOrderId === order.id && (
        <tr>
          <td colSpan={7} className="bg-gray-200 px-4 py-3">
            {/* You can use real details later. This is demo layout like Main.tsx */}
            <div className="p-4 border rounded-lg bg-white shadow">
              <div className="text-[12px] font-medium text-gray-700">Order Breakdown</div>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Items</div>
                  <ul className="list-disc list-inside">
                    <li>{order.item_details}</li>
                    <div className="font-Poppins">Items Description</div>
                    <ul className="list-disc list-inside">
                    <li>{order.item_description}</li>
                  </ul>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold">Charges</div>
                  <p>Tax: </p>
                  <p>GST: {order.gst}</p>
                  <p>Total Amount:₹ {order.grand_total}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>

        </table>
      </div>
    )}
  </div>
</div>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden"></div>
          <div className="flex w-[400px] flex-col gap-[20px] items-start shrink-0 flex-nowrap relative z-[424]">
            <div className="flex w-[400px] px-[20px] py-[12px] flex-col gap-[20px] justify-center items-start shrink-0 flex-nowrap bg-[#fff] rounded-[12px] relative overflow-hidden z-[425]">
              <div className="flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[426]">
                <span className="h-[27px] grow shrink-0 basis-auto font-['Poppins'] text-[16px] font-semibold leading-[27px] text-[#334756] tracking-[-0.4px] relative text-left whitespace-nowrap z-[427]">
                  Quick Actions
                </span>
              </div>
              <div className="w-full overflow-x-auto scrollbar-hide touch-pan-x z-[400]">
              <div className="flex w-[366px] gap-[16px] items-start shrink-0 flex-nowrap relative z-[428]">
                <div className="flex pt-[20px] pr-[40px] pb-[10px] pl-[40px] flex-col gap-[10px] justify-center items-center grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[8px] border-solid border border-[#e3e9ed] relative z-[429]">
                  <div className="w-[20px] h-[20px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/aoykLTL64s.png)] bg-cover bg-no-repeat relative z-[430]" />
                  <span className="flex w-[60px] h-[15px] justify-center items-center shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#09091a] relative text-center whitespace-nowrap z-[431]">
                    Update Menu
                  </span>
                </div>
                <div className="flex pt-[20px] pr-[40px] pb-[10px] pl-[40px] flex-col gap-[10px] justify-center items-center grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[8px] border-solid border border-[#e3e9ed] relative z-[432]">
                  <div className="w-[20px] h-[20px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/3CKj0Z70Dj.png)] bg-cover bg-no-repeat relative z-[433]" />
                  <span className="flex w-[60px] h-[15px] justify-center items-center shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#09091a] relative text-center whitespace-nowrap z-[434]">
                    Alert Zone
                  </span>
                </div>
                <div className="flex pt-[20px] pr-[40px] pb-[10px] pl-[40px] flex-col gap-[10px] justify-center items-center grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[8px] border-solid border border-[#e3e9ed] relative z-[435]">
                  <div className="w-[20px] h-[20px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/NzBZS4ZmoX.png)] bg-cover bg-no-repeat relative z-[436]" />
                  <span className="flex w-[60px] h-[15px] justify-center items-center shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#09091a] relative text-center whitespace-nowrap z-[437]">
                    Create Order
                  </span>
                </div>
              </div>
              </div>
            </div>
            <div className="flex w-[400px] px-[20px] py-[12px] gap-[83px] items-start shrink-0 flex-wrap bg-[#fff] rounded-[8px] relative shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] z-[438]">
              <div className="flex w-[369.892px] justify-between items-start flex-nowrap relative z-[439]">
                <span className="h-[28px] grow shrink-0 basis-auto font-['Poppins'] text-[18px] font-medium leading-[28px] text-[#1f2937] relative text-left whitespace-nowrap z-[440]">
                  Notification
                </span>
                <div className="flex w-[95.01px] pt-[5px] pr-[13.7px] pb-[5px] pl-[13px] gap-[4.71px] items-center shrink-0 flex-nowrap bg-[#fff] rounded-[8px] border-solid border border-[#d1d5db] relative z-[441]">
                  <span className="flex w-[49px] h-[20px] justify-center items-center shrink-0 basis-auto font-['Poppins'] text-[14px] font-medium leading-[20px] text-[#4b5563] relative text-center whitespace-nowrap z-[442]">
                    Recent
                  </span>
                  <div className="w-[14.6px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/Hyporen4q6.png)] bg-cover bg-no-repeat relative z-[443]" />
                </div>
              </div>
              <div className="flex w-[370px] flex-col gap-[16px] items-start flex-nowrap relative z-[444]">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                   <div
                     key={n.id}
                     className="flex w-[370px] pt-[12px] pr-[12px] pb-[12px] pl-[12px] items-start bg-[#f0fdf4] rounded-[16px] relative"
                   >
                     <div className="flex w-[40px] h-[40px] justify-center items-center bg-[#dcfce7] rounded-full">
                       <div className="w-[16.68px] h-[16px] bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-07/eA9gqYExNR.png')] bg-cover bg-no-repeat" />
                     </div>
                     <div className="pl-[16px] flex flex-col justify-center items-start grow">
                       <div className="flex flex-col gap-[4px] items-start w-full">
                         <span className="text-[14px] font-medium leading-[20px] text-[#1f2937] font-['Poppins']">
                          {n.title}
                       </span>
                       <span className="text-[12px] leading-[20px] text-[#4b5563] font-['Poppins']">
                          {n.message}
                       </span>
                       <div className="flex justify-between items-center w-full pt-[4px]">
                         <span className="text-[12px] leading-[16px] text-[#6b7280] font-['Poppins']">
                            {new Date(n.created_at).toLocaleString()}
                         </span>
                         <span className="text-[12px] leading-[16px] text-[#16a34a] font-['Poppins']">
                            Details
                        </span>
          </div>
        </div>
      </div>
    </div>
  ))
)}
              </div>  
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
