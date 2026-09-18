"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";
import { getCurrentUser, getToken } from "@/lib/auth";

type CartItem = {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  };
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    async function loadCheckout() {
      try {
        const user = getCurrentUser();
        if (user) {
          setForm((prev) => ({
            ...prev,
            name: prev.name || user.name || "",
            email: prev.email || user.email || "",
            phone: prev.phone || user.mobile || "",
          }));
        }

        const savedCart = localStorage.getItem("fizzi-cart");
        let localCart: CartItem[] = [];
        if (savedCart) {
          try {
            localCart = JSON.parse(savedCart);
            setCart(localCart);
          } catch {
            localStorage.removeItem("fizzi-cart");
          }
        }

        const token = getToken() || localStorage.getItem("token") || localStorage.getItem("fizzi-token");

        if (!token) {
          router.push("/login");
          return;
        }

        // Backend cart load
        const response = await fetch(`${getApiBaseUrl()}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.cart?.items && data.cart.items.length > 0) {
          const backendCart: CartItem[] = data.cart.items
            .filter((item: any) => item.product)
            .map((item: any) => ({
              product: {
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image || "",
                description: "",
              },
              quantity: item.quantity,
            }));

          setCart(backendCart);
          localStorage.setItem("fizzi-cart", JSON.stringify(backendCart));
        } else if (localCart.length > 0) {
          // If backend cart is empty, sync local cart to backend
          for (const item of localCart) {
            if (item.product?._id) {
              await fetch(`${getApiBaseUrl()}/cart`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  productId: item.product._id,
                  quantity: item.quantity,
                }),
              }).catch(() => null);
            }
          }

          // Reload backend cart as the single source of truth
          const refreshedRes = await fetch(`${getApiBaseUrl()}/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const refreshedData = await refreshedRes.json().catch(() => ({}));

          if (refreshedRes.ok && refreshedData.cart?.items && refreshedData.cart.items.length > 0) {
            const backendCart: CartItem[] = refreshedData.cart.items
              .filter((item: any) => item.product)
              .map((item: any) => ({
                product: {
                  _id: item.product._id,
                  name: item.product.name,
                  price: item.product.price,
                  image: item.product.image || "",
                  description: "",
                },
                quantity: item.quantity,
              }));

            setCart(backendCart);
            localStorage.setItem("fizzi-cart", JSON.stringify(backendCart));
          } else {
            // Local items were stale from an older seed and failed to sync
            setCart([]);
            localStorage.removeItem("fizzi-cart");
          }
        }
      } catch (error) {
        console.error("Checkout loading error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load checkout"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [router]);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const deliveryCharge = subtotal >= 500 ? 0 : 50;

  const total = subtotal + deliveryCharge;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    const token = getToken() || localStorage.getItem("token") || localStorage.getItem("fizzi-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setPlacingOrder(true);

      const orderData = {
        customer: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
        },

        shippingAddress: {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },

        paymentMethod: "COD",
        items: cart.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image || "",
        })),
      };

      const response = await fetch(
        `${getApiBaseUrl()}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.staleProductFound) {
          // Stale items were removed on backend; reload remaining valid cart items
          try {
            const cartRes = await fetch(`${getApiBaseUrl()}/cart`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const cartData = await cartRes.json();
            if (cartRes.ok && cartData.cart?.items) {
              const updatedCart: CartItem[] = cartData.cart.items
                .filter((item: any) => item.product)
                .map((item: any) => ({
                  product: {
                    _id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image || "",
                    description: "",
                  },
                  quantity: item.quantity,
                }));
              setCart(updatedCart);
              localStorage.setItem("fizzi-cart", JSON.stringify(updatedCart));
            }
          } catch {}
        }

        throw new Error(
          data.message || "Failed to place order"
        );
      }

      console.log("Order placed successfully:", data);

      localStorage.removeItem("fizzi-cart");
      setCart([]);

      const orderId =
        data.order?._id || data._id || (data.data && data.data._id) || "";

      router.push(
        `/order-success?orderId=${orderId}`
      );
    } catch (error) {
      console.error("Order error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-yellow-100 text-2xl font-bold text-sky-950">
        Loading checkout...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-100 px-6 py-12 text-sky-950">
      <div className="mx-auto max-w-6xl">

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            href="/cart"
            className="rounded-xl bg-sky-950 px-6 py-4 font-bold text-white"
          >
            ← BACK TO CART
          </Link>

          <h1 className="text-4xl font-black uppercase md:text-6xl">
            CHECKOUT
          </h1>

          <div className="hidden w-[150px] md:block" />
        </div>

        {error && (
          <div className="mt-8 rounded-xl bg-red-100 p-4 text-center font-bold text-red-600">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-white p-12 text-center shadow-xl">
            <h2 className="text-3xl font-black">
              YOUR CART IS EMPTY
            </h2>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-orange-600 px-8 py-4 font-bold text-white"
            >
              SHOP NOW
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-12 grid gap-8 lg:grid-cols-[1fr_400px]"
          >
            {/* DELIVERY */}
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <h2 className="text-3xl font-black">
                DELIVERY DETAILS
              </h2>

              <div className="mt-8 grid gap-5">

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="rounded-xl border-2 border-slate-200 px-5 py-4 outline-none focus:border-orange-500"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="rounded-xl border-2 border-slate-200 px-5 py-4 outline-none focus:border-orange-500"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="rounded-xl border-2 border-slate-200 px-5 py-4 outline-none focus:border-orange-500"
                />

                <textarea
                  name="address"
                  placeholder="Complete Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="rounded-xl border-2 border-slate-200 px-5 py-4 outline-none focus:border-orange-500"
                />

                <div className="grid gap-5 md:grid-cols-2">

                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="rounded-xl border-2 border-slate-200 px-5 py-4 outline-none focus:border-orange-500"
                  />

                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="rounded-xl border-2 border-slate-200 px-5 py-4 outline-none focus:border-orange-500"
                  />

                </div>

                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  className="rounded-xl border-2 border-slate-200 px-5 py-4 outline-none focus:border-orange-500"
                />

              </div>
            </div>

            {/* SUMMARY */}
            <div className="h-fit rounded-3xl bg-sky-950 p-8 text-white shadow-xl">

              <h2 className="text-3xl font-black">
                ORDER SUMMARY
              </h2>

              <div className="mt-6 space-y-4">

                {cart.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">

                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg bg-white object-contain"
                      />

                      <div>
                        <p className="font-bold">
                          {item.product.name}
                        </p>

                        <p className="text-sm text-slate-300">
                          Qty: {item.quantity}
                        </p>
                      </div>

                    </div>

                    <p className="font-bold">
                      ₹
                      {item.product.price *
                        item.quantity}
                    </p>
                  </div>
                ))}

              </div>

              <div className="mt-8 space-y-3 border-t border-white/20 pt-6">

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge}`}
                  </span>
                </div>

                <div className="mt-4 flex justify-between text-2xl font-black">
                  <span>TOTAL</span>
                  <span>₹{total}</span>
                </div>

              </div>

              <div className="mt-6 rounded-xl bg-white/10 p-4">
                <p className="text-sm text-white/60">
                  PAYMENT METHOD
                </p>

                <p className="mt-1 font-bold">
                  Cash on Delivery
                </p>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="mt-8 w-full rounded-xl bg-orange-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder
                  ? "PLACING ORDER..."
                  : "PLACE ORDER"}
              </button>

            </div>
          </form>
        )}
      </div>
    </main>
  );
}