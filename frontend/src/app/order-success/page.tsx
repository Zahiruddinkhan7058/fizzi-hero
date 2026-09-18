"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  return (
    <main className="min-h-screen bg-[#fff4b8] px-6 py-16 text-sky-950 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        {/* Success Animation Card */}
        <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-14">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl shadow-inner">
            🎉
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-orange-600">
            Order Confirmed
          </p>

          <h1 className="mt-2 text-4xl font-black uppercase md:text-5xl">
            THANK YOU FOR YOUR ORDER!
          </h1>

          <p className="mt-4 text-slate-600">
            Your Fizzi cans are being prepared for dispatch and will be on their way shortly.
          </p>

          {orderId && (
            <div className="mt-8 rounded-2xl bg-yellow-50 p-5 border border-yellow-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Order ID
              </span>
              <p className="mt-1 font-mono text-lg font-black text-sky-950 break-all">
                {orderId}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {orderId ? (
              <Link
                href={`/orders/${orderId}/tracking`}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-7 py-4 text-base font-black text-white shadow-lg transition hover:bg-orange-700"
              >
                🚚 TRACK ORDER
              </Link>
            ) : null}

            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-950 px-7 py-4 text-base font-black text-white shadow-lg transition hover:bg-sky-900"
            >
              📦 MY ORDERS
            </Link>

            <Link
              href="/products"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-7 py-4 text-base font-bold text-slate-700 transition hover:bg-slate-100"
            >
              SHOP MORE
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fff4b8] text-sky-950 font-bold">
          Loading order details...
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}