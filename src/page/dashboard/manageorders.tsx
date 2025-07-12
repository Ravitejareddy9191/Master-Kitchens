import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Filter } from "lucide-react";
import "./index.css";
import FilterDropdown from "../../components/FilterDropdown";
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
}

interface OrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
}

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      let url = "http://localhost:8000/api/orders/";
      if (selectedStatus !== "all") url += `?status=${selectedStatus}`;

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
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchStats();
    setRefreshing(false);
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
    <div className="flex flex-col gap-6 p-6 flex-grow min-h-full relative">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-3">
            <h1 className="text-[18px] font-semibold text-[#1f2937]">
              Manage Orders
            </h1>
            <span className="text-[14px] text-[#6b7280] font-medium">
              Showing {orders.length} of {stats?.total_orders || 0} Orders
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <Download className="w-4 h-4" /> Export Data
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">
              + Create Order
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm bg-white border border-gray-300 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Component */}
      {showFilters && (
        <div className="absolute top-[130px] right-[30px] z-50">
          <FilterDropdown />
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden p-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No orders found</div>
            <div className="text-sm text-gray-400">
              Connect your Gmail account to automatically fetch orders from
              your emails.
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[75vh]">
            <table className="min-w-full text-sm text-left text-gray-700 table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Order Details</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer Details</th>
                  <th className="px-4 py-3 text-left font-semibold">Train/Station</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Total Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Booking Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Delivery Date (ETA)</th>
                  <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                  <th className="px-4 py-3 text-left font-semibold">Updated By</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{order.order_id}</td>
                    <td className="px-4 py-3">{order.vendor_display}</td>
                    <td className="px-4 py-3">{order.formatted_customer_details}</td>
                    <td className="px-4 py-3">{order.formatted_train_station}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs border rounded-md ${getPaymentBadge(
                          order.payment_type_display
                        )}`}
                      >
                        {order.payment_type_display}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹ {order.grand_total}</td>
                    <td className="px-4 py-3">{formatDate(order.BookingDate)}</td>
                    <td className="px-4 py-3">{order.delivery_date}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">{order.updated_by}</td>
                    <td className="px-4 py-3">
                      <OrderStatusDropdown
                        value={order.status_display}
                        onChange={(newStatus) =>
                          console.log("Selected new status:", newStatus)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
