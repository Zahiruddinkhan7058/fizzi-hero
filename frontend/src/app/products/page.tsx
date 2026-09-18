"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts, Product } from "@/lib/products";
import { getApiBaseUrl } from "@/lib/api";
import AntiGravityBoutiqueModal from "@/components/boutique/AntiGravityBoutiqueModal";

type CartItem = {
  product: Product;
  quantity: number;
};

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [isBoutiqueOpen, setIsBoutiqueOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  async function addToCart(product: Product) {
    try {
      setAddingId(product._id);

      const savedCart = localStorage.getItem("fizzi-cart");

      let cart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const existingItem = cart.find(
        (item) => item.product._id === product._id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          product,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "fizzi-cart",
        JSON.stringify(cart)
      );

      // Sync with backend cart if logged in
      const token = localStorage.getItem("token") || localStorage.getItem("fizzi-token");
      if (token) {
        fetch(`${getApiBaseUrl()}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: 1,
          }),
        }).catch(() => {});
      }

      router.push("/cart");
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      alert("Failed to add product to cart.");
      setAddingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff4b8] text-sky-950">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-sky-950/10 bg-[#fff4b8]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl bg-sky-950 px-5 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-sky-900"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>
            HOME
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-lg"
          >
            🛒
            CART
          </Link>
        </div>
      </header>

      {/* HERO TITLE */}
      <section className="px-5 pb-6 pt-12 md:pt-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-orange-600">
            Fizzi Collection
          </p>

          <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Shop All Cans
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium text-slate-700 md:text-lg">
            Pick your favorite Fizzi flavor and get it delivered
            straight to your door.
          </p>

          {/* Luxury Anti-Gravity Boutique Feature Pill */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setIsBoutiqueOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-400/25 to-amber-500/15 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-sm transition-all duration-300 hover:scale-105 hover:border-amber-500 hover:shadow-md active:scale-95"
            >
              <span className="text-amber-600 animate-pulse">✦</span>
              <span>Explore Anti-Gravity Menswear Atelier (3D Floating Showcase)</span>
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        {loading ? (
          <div
            key="products-loading-skeleton"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={`skeleton-${item}`}
                className="animate-pulse overflow-hidden rounded-3xl bg-white p-5 shadow-lg"
              >
                <div className="aspect-square rounded-2xl bg-slate-200" />
                <div className="mt-6 h-7 w-3/4 rounded-lg bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded bg-slate-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
                <div className="mt-5 h-7 w-20 rounded bg-slate-200" />
                <div className="mt-5 h-12 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            key="products-empty-state"
            className="mx-auto mt-10 max-w-xl rounded-3xl bg-white p-12 text-center shadow-xl"
          >
            <div className="text-5xl">🥤</div>

            <h2 className="mt-5 text-3xl font-black">
              No Products Found
            </h2>

            <p className="mt-3 text-slate-600">
              We could not load the Fizzi products right now.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 rounded-xl bg-orange-600 px-7 py-3 font-bold text-white transition hover:bg-orange-700"
            >
              TRY AGAIN
            </button>
          </div>
        ) : (
          <div
            key="products-grid-list"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {products.map((product) => (
              <article
                key={`product-${product._id}`}
                className="group overflow-hidden rounded-3xl bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* IMAGE */}
                <Link
                  href={`/products/${product._id}`}
                  className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#fff8d9]"
                >
                  <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-orange-600 shadow-sm">
                    FIZZI
                  </div>

                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-7 transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

                {/* DETAILS */}
                <div className="px-1 pt-5">
                  <Link href={`/products/${product._id}`}>
                    <h2 className="line-clamp-1 text-2xl font-black uppercase hover:text-orange-600 transition-colors">
                      {product.name}
                    </h2>
                  </Link>

                  <p className="mt-2 line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-slate-500">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-2xl font-black text-sky-950">
                      ₹{product.price}
                    </span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      IN STOCK
                    </span>
                  </div>

                  {/* ADD TO CART */}
                  <button
                    type="button"
                    disabled={addingId === product._id}
                    onClick={() => addToCart(product)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-4 text-base font-black text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {addingId === product._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>ADDING...</span>
                      </span>
                    ) : (
                      <span>🛒 ADD TO CART</span>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      {!loading && products.length > 0 ? (
        <section key="products-bottom-cta" className="border-t border-sky-950/10 px-5 py-14">
          <div className="mx-auto max-w-4xl rounded-3xl bg-sky-950 px-7 py-10 text-center text-white shadow-xl md:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-300">
              Ready to refresh?
            </p>

            <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">
              Your Fizzi Is Waiting.
            </h2>

            <Link
              href="/cart"
              className="mt-7 inline-block rounded-xl bg-orange-600 px-8 py-4 font-black transition hover:bg-orange-700"
            >
              VIEW YOUR CART →
            </Link>
          </div>
        </section>
      ) : null}

      <AntiGravityBoutiqueModal
        isOpen={isBoutiqueOpen}
        onClose={() => setIsBoutiqueOpen(false)}
      />
    </main>
  );
}