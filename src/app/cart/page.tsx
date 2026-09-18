"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";

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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadCart() {
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

      const token = localStorage.getItem("token") || localStorage.getItem("fizzi-token");
      if (token) {
        try {
          const res = await fetch(`${getApiBaseUrl()}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (res.ok && data.cart?.items && data.cart.items.length > 0) {
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
            // Attempt to sync local items to backend
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

            // Reload backend cart
            const refreshRes = await fetch(`${getApiBaseUrl()}/cart`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const refreshData = await refreshRes.json().catch(() => ({}));
            if (refreshRes.ok && refreshData.cart?.items && refreshData.cart.items.length > 0) {
              const backendCart: CartItem[] = refreshData.cart.items
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
              setCart([]);
              localStorage.removeItem("fizzi-cart");
            }
          }
        } catch (err) {
          console.error("Cart loading error:", err);
        }
      }

      setLoaded(true);
    }

    loadCart();
  }, []);

  function updateCart(newCart: CartItem[]) {
    setCart(newCart);
    localStorage.setItem("fizzi-cart", JSON.stringify(newCart));
  }

  function increaseQuantity(productId: string) {
    const item = cart.find((i) => i.product._id === productId);
    const newQty = (item?.quantity || 0) + 1;
    const newCart = cart.map((i) =>
      i.product._id === productId ? { ...i, quantity: newQty } : i
    );
    updateCart(newCart);

    const token = localStorage.getItem("token") || localStorage.getItem("fizzi-token");
    if (token) {
      fetch(
        `${getApiBaseUrl()}/cart/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        }
      ).catch(() => {});
    }
  }

  function decreaseQuantity(productId: string) {
    const item = cart.find((i) => i.product._id === productId);
    const newQty = (item?.quantity || 1) - 1;
    const newCart = cart
      .map((i) => (i.product._id === productId ? { ...i, quantity: newQty } : i))
      .filter((i) => i.quantity > 0);
    updateCart(newCart);

    const token = localStorage.getItem("token") || localStorage.getItem("fizzi-token");
    if (token) {
      if (newQty <= 0) {
        fetch(
          `${getApiBaseUrl()}/cart/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => {});
      } else {
        fetch(
          `${getApiBaseUrl()}/cart/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQty }),
          }
        ).catch(() => {});
      }
    }
  }

  function removeItem(productId: string) {
    const newCart = cart.filter(
      (item) => item.product._id !== productId
    );
    updateCart(newCart);

    const token = localStorage.getItem("token") || localStorage.getItem("fizzi-token");
    if (token) {
      fetch(
        `${getApiBaseUrl()}/cart/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch(() => {});
    }
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="min-h-screen bg-yellow-100 p-10 text-center text-sky-950">
        Loading cart...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-100 px-6 py-12 text-sky-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="rounded-xl bg-sky-950 px-6 py-4 font-bold text-white"
          >
            ← CONTINUE SHOPPING
          </Link>

          <h1 className="text-4xl font-black uppercase md:text-6xl">
            YOUR CART
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-white p-16 text-center shadow-xl">
            <h2 className="text-3xl font-black">
              Your cart is empty
            </h2>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-xl bg-orange-600 px-8 py-4 font-bold text-white"
            >
              SHOP NOW
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_350px]">
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  className="flex gap-5 rounded-3xl bg-white p-5 shadow-lg"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-32 w-32 rounded-2xl bg-yellow-50 object-contain p-3"
                  />

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-black">
                        {item.product.name}
                      </h2>

                      <p className="mt-2 text-slate-600">
                        ₹{item.product.price}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            decreaseQuantity(item.product._id)
                          }
                          className="h-9 w-9 rounded-lg bg-sky-950 font-bold text-white"
                        >
                          −
                        </button>

                        <span className="font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(item.product._id)
                          }
                          className="h-9 w-9 rounded-lg bg-sky-950 font-bold text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.product._id)
                        }
                        className="font-bold text-red-600"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-3xl bg-sky-950 p-8 text-white shadow-xl">
              <h2 className="text-2xl font-black">
                ORDER SUMMARY
              </h2>

              <div className="mt-6 flex justify-between text-xl">
                <span>Total</span>

                <span className="font-black">
                  ₹{total}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-8 block w-full rounded-xl bg-orange-600 px-6 py-4 text-center font-bold transition hover:bg-orange-700"
              >
                CHECKOUT
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}