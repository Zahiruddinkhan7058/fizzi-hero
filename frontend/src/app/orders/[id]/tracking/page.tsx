"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

type TrackingData = {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", desc: "Your order has been recorded." },
  { key: "CONFIRMED", label: "Order Confirmed", desc: "Payment/Order verified." },
  { key: "PROCESSING", label: "Processing & Packing", desc: "Packing fresh Fizzi cans." },
  { key: "SHIPPED", label: "Out for Delivery", desc: "Courier partner on the way." },
  { key: "DELIVERED", label: "Delivered", desc: "Enjoy your refreshing Fizzi!" },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTracking() {
      if (!orderId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to track your order.");
          return;
        }

        const data = await apiRequest(`/orders/${orderId}/tracking`);
        setTracking(data.tracking || data);
      } catch (err) {
        console.error("Failed to track order:", err);
        setError(err instanceof Error ? err.message : "Failed to load tracking");
      } finally {
        setLoading(false);
      }
    }

    loadTracking();
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-yellow-100 text-sky-950 font-bold text-xl">
        Loading live tracking...
      </main>
    );
  }

  if (error || !tracking) {
    return (
      <main className="min-h-screen bg-yellow-100 px-6 py-16 text-sky-950">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="text-5xl">📦</div>
          <h2 className="mt-4 text-2xl font-black">Tracking Unavailable</h2>
          <p className="mt-2 text-slate-600">{error || "Unable to find tracking details."}</p>
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

  const currentStatus = (tracking.orderStatus || "PENDING").toUpperCase();
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <main className="min-h-screen bg-yellow-100 px-6 py-12 text-sky-950">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/orders/${orderId}`}
            className="rounded-xl bg-sky-950 px-5 py-3 text-sm font-bold text-white hover:bg-sky-900"
          >
            ← ORDER DETAILS
          </Link>

          <Link
            href="/orders"
            className="text-sm font-black uppercase text-orange-600 hover:underline"
          >
            All Orders
          </Link>
        </div>

        {/* Tracking Card */}
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-2xl md:p-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                Live Status
              </span>
              <h1 className="text-3xl font-black uppercase text-sky-950 md:text-4xl">
                Track Order
              </h1>
              <p className="font-mono text-sm text-slate-500 mt-1">ID: {orderId}</p>
            </div>

            <div className="rounded-2xl bg-yellow-50 px-5 py-3 border border-yellow-200">
              <span className="text-xs font-bold uppercase text-slate-500">Current Stage</span>
              <p className="font-black text-lg text-sky-950">
                {STATUS_STEPS[activeIndex]?.label || currentStatus}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-12">
            <div className="relative pl-6 sm:pl-10 space-y-10 border-l-4 border-orange-200 ml-4">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= activeIndex;
                const isCurrent = index === activeIndex;

                return (
                  <div key={step.key} className="relative">
                    {/* Step circle indicator */}
                    <div
                      className={`absolute -left-[35px] sm:-left-[51px] top-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full font-bold text-sm shadow-md transition-colors ${
                        isCompleted
                          ? "bg-orange-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      } ${isCurrent ? "ring-4 ring-orange-200" : ""}`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    <div>
                      <h3
                        className={`text-lg font-black uppercase ${
                          isCompleted ? "text-sky-950" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery destination card */}
          {tracking.shippingAddress && (
            <div className="mt-12 rounded-2xl bg-[#fff8d9]/70 p-6 border border-yellow-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Delivering To
              </h3>
              <p className="mt-2 font-bold text-sky-950">
                {tracking.shippingAddress.address}, {tracking.shippingAddress.city},{" "}
                {tracking.shippingAddress.state} - {tracking.shippingAddress.pincode}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
