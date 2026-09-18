"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

type OrderItem = {
  product: {
    _id: string;
    name?: string;
    image?: string;
  };
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type OrderDetail = {
  _id: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
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
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view order details.");
          return;
        }

        const data = await apiRequest(`/orders/${orderId}`);
        setOrder(data.order || data);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-yellow-100 text-sky-950 font-bold text-xl">
        Loading order details...
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-yellow-100 px-6 py-16 text-sky-950">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="text-5xl">⚠️</div>
          <h2 className="mt-4 text-2xl font-black">Order Not Found</h2>
          <p className="mt-2 text-slate-600">{error || "Unable to retrieve order details."}</p>
          <Link
            href="/orders"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-7 py-3 font-bold text-white hover:bg-orange-700"
          >
            ← BACK TO ORDERS
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-100 px-6 py-12 text-sky-950">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/orders"
            className="w-fit rounded-xl bg-sky-950 px-5 py-3 text-sm font-bold text-white hover:bg-sky-900"
          >
            ← ALL ORDERS
          </Link>

          <Link
            href={`/orders/${order._id}/tracking`}
            className="w-fit rounded-xl bg-orange-600 px-6 py-3 text-sm font-black text-white shadow hover:bg-orange-700"
          >
            🚚 TRACK THIS ORDER
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order ID
              </span>
              <p className="font-mono text-lg font-black text-sky-950">{order._id}</p>
              <p className="text-xs text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex gap-3">
              <span className="rounded-full bg-orange-100 px-4 py-1.5 text-xs font-black uppercase text-orange-600">
                Status: {order.orderStatus || "Pending"}
              </span>
              <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-black uppercase text-green-700">
                Payment: {order.paymentStatus || "Pending"}
              </span>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid gap-6 py-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                Customer Details
              </h3>
              <p className="mt-2 font-bold text-sky-950">{order.customer?.name}</p>
              <p className="text-sm text-slate-600">{order.customer?.email}</p>
              <p className="text-sm text-slate-600">{order.customer?.phone}</p>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                Shipping Address
              </h3>
              <p className="mt-2 font-bold text-sky-950">{order.shippingAddress?.address}</p>
              <p className="text-sm text-slate-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">
              Items Ordered
            </h3>

            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-[#fff8d9]/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl">
                        🥤
                      </div>
                    )}
                    <div>
                      <p className="font-black text-sky-950">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>

                  <p className="font-black text-lg text-sky-950">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Delivery Charge</span>
                <span>{order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-sky-950 border-t border-slate-200 pt-2">
                <span>Total Amount</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <p className="text-xs text-slate-400 text-right">Payment Method: {order.paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
