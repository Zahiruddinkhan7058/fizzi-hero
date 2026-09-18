"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Order = {
  _id: string;
  totalAmount: number;
  orderStatus?: string;
  paymentStatus?: string;
  createdAt?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("fizzi-token");

        if (!token) {
          setError("Please login to view your orders.");
          return;
        }

        const data = await apiRequest("/orders");

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Failed to load orders:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-yellow-100 px-6 py-12 text-sky-950">
      <div className="mx-auto max-w-6xl">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="w-fit rounded-xl bg-sky-950 px-6 py-4 font-bold text-white"
          >
            ← BACK TO HOME
          </Link>

          <h1 className="text-4xl font-black uppercase md:text-6xl">
            MY ORDERS
          </h1>
        </div>

        {loading && (
          <p className="mt-20 text-center text-xl font-bold">
            Loading orders...
          </p>
        )}

        {!loading && error && (
          <div className="mx-auto mt-12 max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
            <h2 className="text-3xl font-black">
              LOGIN REQUIRED
            </h2>

            <p className="mt-4 text-slate-600">
              {error}
            </p>

            <Link
              href="/login"
              className="mt-8 inline-block rounded-xl bg-orange-600 px-8 py-4 font-bold text-white"
            >
              LOGIN
            </Link>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-12 rounded-3xl bg-white p-12 text-center shadow-xl">
            <h2 className="text-3xl font-black">
              NO ORDERS YET
            </h2>

            <p className="mt-4 text-slate-600">
              Start shopping and your orders will appear here.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-xl bg-orange-600 px-8 py-4 font-bold text-white"
            >
              SHOP NOW
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-12 space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl bg-white p-6 shadow-xl"
              >
                <div className="grid gap-6 md:grid-cols-4">

                  <div>
                    <p className="text-sm font-bold uppercase text-slate-500">
                      ORDER ID
                    </p>

                    <p className="mt-1 break-all font-mono font-bold">
                      {order._id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase text-slate-500">
                      TOTAL
                    </p>

                    <p className="text-2xl font-black">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase text-slate-500">
                      ORDER STATUS
                    </p>

                    <p className="mt-1 font-bold text-orange-600">
                      {order.orderStatus || "Pending"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase text-slate-500">
                      PAYMENT
                    </p>

                    <p className="mt-1 font-bold text-green-600">
                      {order.paymentStatus || "Pending"}
                    </p>
                  </div>

                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/orders/${order._id}`}
                    className="rounded-xl bg-sky-950 px-6 py-3 font-bold text-white"
                  >
                    VIEW ORDER
                  </Link>

                  <Link
                    href={`/orders/${order._id}/tracking`}
                    className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white"
                  >
                    TRACK ORDER
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}