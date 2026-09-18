"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser, getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

type OrderItem = {
  _id?: string;
  product?: {
    _id: string;
    name: string;
    image?: string;
    flavor?: string;
  };
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
  { value: "CONFIRMED", label: "Confirmed", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { value: "PROCESSING", label: "Processing", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { value: "SHIPPED", label: "Shipped", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
  { value: "DELIVERED", label: "Delivered", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { value: "CANCELLED", label: "Cancelled", badge: "bg-red-500/20 text-red-300 border-red-500/40" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name?: string; role?: string; email?: string } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Authentication & Role Check
  useEffect(() => {
    const token = getToken();
    const user = getCurrentUser();

    if (!token || !user) {
      router.push("/login");
      return;
    }

    setCurrentUser(user);

    if (user.role !== "admin") {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setIsAuthorized(true);
    fetchOrders();
  }, [router]);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/admin/orders");
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        // If an order is currently selected, refresh its details
        if (selectedOrder) {
          const updated = data.orders.find((o: Order) => o._id === selectedOrder._id);
          if (updated) setSelectedOrder(updated);
        }
      } else {
        throw new Error(data.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      setError(err instanceof Error ? err.message : "Failed to load admin orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingOrderId(orderId);
    setError("");
    setSuccessMessage("");
    try {
      const data = await apiRequest(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          orderStatus: newStatus,
          message: `Order status updated to ${newStatus} by admin`,
        }),
      });

      if (data.success) {
        setSuccessMessage(`Order status successfully updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(""), 4000);

        // Update local state immediately
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (order.orderStatus || "").toUpperCase() === statusFilter.toUpperCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
        (order._id && order._id.toLowerCase().includes(query)) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(query)) ||
        (order.customer?.email && order.customer.email.toLowerCase().includes(query)) ||
        (order.customer?.phone && order.customer.phone.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => (o.orderStatus || "").toUpperCase() === "PENDING").length;
    const confirmed = orders.filter((o) => (o.orderStatus || "").toUpperCase() === "CONFIRMED").length;
    const processing = orders.filter((o) => (o.orderStatus || "").toUpperCase() === "PROCESSING").length;
    const shipped = orders.filter((o) => (o.orderStatus || "").toUpperCase() === "SHIPPED").length;
    const delivered = orders.filter((o) => (o.orderStatus || "").toUpperCase() === "DELIVERED").length;
    const cancelled = orders.filter((o) => (o.orderStatus || "").toUpperCase() === "CANCELLED").length;
    const revenue = orders
      .filter((o) => (o.orderStatus || "").toUpperCase() !== "CANCELLED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, pending, confirmed, processing, shipped, delivered, cancelled, revenue };
  }, [orders]);

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  // Access Denied Screen for non-admin users
  if (isAuthorized === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-red-500/30 bg-red-950/20 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-6xl">🚫</div>
          <h1 className="mt-4 text-3xl font-black text-red-400">Access Denied</h1>
          <p className="mt-2 text-white/70">
            This section is strictly restricted to authorized administrators. Your account does not have admin privileges.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
              Return to Store
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Login as Different User
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090e] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-purple-600/30 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-300 border border-purple-500/40">
                Admin Control Panel
              </span>
              <span className="text-xs text-white/50">Fizzi E-Commerce</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Order Management
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Logged in as <strong className="text-yellow-400">{currentUser?.name || "Admin"}</strong> ({currentUser?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Store Home
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              My Account
            </Link>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-red-300">
            <p className="font-medium">⚠️ {error}</p>
            <button onClick={() => setError("")} className="text-sm underline">Dismiss</button>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-300 font-medium">
            ✅ {successMessage}
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Total Orders</p>
            <p className="mt-1 text-2xl font-bold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/[0.05] p-4">
            <p className="text-xs uppercase tracking-wider text-yellow-300">Pending</p>
            <p className="mt-1 text-2xl font-bold text-yellow-400">{metrics.pending}</p>
          </div>
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/[0.05] p-4">
            <p className="text-xs uppercase tracking-wider text-blue-300">Confirmed</p>
            <p className="mt-1 text-2xl font-bold text-blue-400">{metrics.confirmed}</p>
          </div>
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.05] p-4">
            <p className="text-xs uppercase tracking-wider text-purple-300">Processing</p>
            <p className="mt-1 text-2xl font-bold text-purple-400">{metrics.processing}</p>
          </div>
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.05] p-4">
            <p className="text-xs uppercase tracking-wider text-indigo-300">Shipped</p>
            <p className="mt-1 text-2xl font-bold text-indigo-400">{metrics.shipped}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4">
            <p className="text-xs uppercase tracking-wider text-emerald-300">Delivered</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{metrics.delivered}</p>
          </div>
          <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/[0.08] p-4 col-span-2 sm:col-span-1">
            <p className="text-xs uppercase tracking-wider text-yellow-300">Total Revenue</p>
            <p className="mt-1 text-2xl font-bold text-yellow-400">₹{metrics.revenue.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase transition ${
                  statusFilter === st
                    ? "bg-yellow-400 text-black shadow-lg"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by order #, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-yellow-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Main Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {loading ? (
            <div className="py-20 text-center font-bold text-white/60">
              Loading orders from database...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-white/50">
              No orders found matching the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/60">
                  <tr>
                    <th className="px-5 py-4">Order ID & Date</th>
                    <th className="px-5 py-4">Customer Details</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Total Amount</th>
                    <th className="px-5 py-4">Current Status</th>
                    <th className="px-5 py-4 text-right">Quick Update Status</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => {
                    const statusObj =
                      STATUS_OPTIONS.find((s) => s.value === (order.orderStatus || "").toUpperCase()) ||
                      STATUS_OPTIONS[0];

                    return (
                      <tr key={order._id} className="transition hover:bg-white/[0.02]">
                        {/* Order ID & Date */}
                        <td className="px-5 py-4">
                          <p className="font-mono font-bold text-yellow-400">
                            {order.orderNumber || order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="mt-0.5 text-xs text-white/40">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Customer Details */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{order.customer?.name || "Customer"}</p>
                          <p className="text-xs text-white/60">{order.customer?.email}</p>
                          <p className="text-xs text-white/40">{order.customer?.phone}</p>
                        </td>

                        {/* Items */}
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {order.items?.length || 0} product(s)
                          </p>
                          <p className="text-xs text-white/50 truncate max-w-[180px]">
                            {order.items?.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                          </p>
                        </td>

                        {/* Total Amount & Payment */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">₹{order.totalAmount}</p>
                          <span className="inline-block mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70">
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusObj.badge}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>

                        {/* Quick Update Dropdown */}
                        <td className="px-5 py-4 text-right">
                          <select
                            value={(order.orderStatus || "PENDING").toUpperCase()}
                            disabled={updatingOrderId === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="rounded-xl border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white focus:border-yellow-400 focus:outline-none"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                → {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* View Details Action */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-yellow-400 hover:text-black"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal / Drawer */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-[#0d1017] p-6 shadow-2xl sm:p-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-yellow-400">Order Details</span>
                  <h2 className="mt-1 text-2xl font-bold">
                    {selectedOrder.orderNumber || selectedOrder._id}
                  </h2>
                  <p className="text-xs text-white/50">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Status Update Control Inside Modal */}
              <div className="mt-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Update Order Status
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      disabled={updatingOrderId === selectedOrder._id}
                      onClick={() => handleStatusChange(selectedOrder._id, opt.value)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold uppercase transition ${
                        (selectedOrder.orderStatus || "").toUpperCase() === opt.value
                          ? "bg-yellow-400 text-black shadow-md"
                          : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/15"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50">Customer</p>
                  <p className="mt-2 font-bold text-white">{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-white/70">{selectedOrder.customer?.email}</p>
                  <p className="text-sm text-white/70">Phone: {selectedOrder.customer?.phone}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50">Shipping Address</p>
                  <p className="mt-2 text-sm text-white/90">{selectedOrder.shippingAddress?.address}</p>
                  <p className="text-sm text-white/70">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Ordered Products List */}
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">Ordered Items</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
                    >
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-xs text-white/60">
                          ₹{item.price} × {item.quantity} unit(s)
                        </p>
                      </div>
                      <p className="font-bold text-yellow-400">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Delivery Charge</span>
                  <span>₹{selectedOrder.deliveryCharge || 0}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-base text-white">
                  <span>Total Amount</span>
                  <span className="text-yellow-400">₹{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-white/50 pt-1">
                  <span>Payment Method: {selectedOrder.paymentMethod}</span>
                  <span>Payment Status: {selectedOrder.paymentStatus}</span>
                </div>
              </div>

              {/* Direct links to customer views */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/orders/${selectedOrder._id}`}
                  target="_blank"
                  className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                >
                  🔗 View Customer Order Page
                </Link>
                <Link
                  href={`/orders/${selectedOrder._id}/tracking`}
                  target="_blank"
                  className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                >
                  🚚 View Customer Tracking Page
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
