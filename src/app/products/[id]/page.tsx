"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, Product } from "@/lib/products";
import { getApiBaseUrl } from "@/lib/api";

type CartItem = {
  product: Product;
  quantity: number;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        const data = await getProductById(productId);
        setProduct(data);
        if (data?.image) setSelectedImage(data.image);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleAddToCart() {
    if (!product) return;
    try {
      setAdding(true);

      const savedCart = localStorage.getItem("fizzi-cart");
      let cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const existingIndex = cart.findIndex(
        (item) => item.product._id === product._id
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          product,
          quantity,
        });
      }

      localStorage.setItem("fizzi-cart", JSON.stringify(cart));

      // Sync with backend if logged in
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
            quantity,
          }),
        }).catch(() => {});
      }

      router.push("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add product to cart.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <main key="product-detail-loading" className="flex min-h-screen items-center justify-center bg-[#fff4b8] text-sky-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p className="mt-4 text-xl font-bold">Loading Fizzi flavor...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main key="product-detail-not-found" className="flex min-h-screen flex-col items-center justify-center bg-[#fff4b8] px-6 text-center text-sky-950">
        <div className="rounded-3xl bg-white p-12 shadow-2xl">
          <div className="text-6xl">🥤</div>
          <h1 className="mt-4 text-3xl font-black">Product Not Found</h1>
          <p className="mt-2 text-slate-600">The flavor you are looking for might be retired or unavailable.</p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-8 py-4 font-bold text-white shadow-lg hover:bg-orange-700"
          >
            ← BACK TO SHOP
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main key={`product-detail-loaded-${product._id}`} className="min-h-screen bg-[#fff4b8] px-5 py-12 text-sky-950 md:px-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-8">
          <Link
            href="/products"
            className="group flex items-center gap-2 rounded-xl bg-sky-950 px-5 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-sky-900"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
            ALL PRODUCTS
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-orange-700"
          >
            🛒 VIEW CART
          </Link>
        </div>

        {/* Product Details Card */}
        <div className="mt-6 grid gap-10 rounded-3xl bg-white p-8 shadow-2xl md:grid-cols-2 md:p-14">
          {/* Product Image & Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-[#fff8d9] p-8 shadow-inner">
              <span className="absolute right-4 top-4 z-10 rounded-full bg-orange-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow">
                {product.flavor || "FIZZI"}
              </span>

              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={`gallery-img-${product._id}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-[#fff8d9] p-2 transition-all ${
                      (selectedImage || product.image) === imgUrl
                        ? "border-orange-600 shadow-md scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} - View ${idx + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 uppercase tracking-widest">
                  {product.category || "Sparkling Soda"}
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-black uppercase leading-tight md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="font-bold text-slate-800">{product.rating || 4.8}</span>
                <span className="text-sm text-slate-400">
                  ({product.totalReviews || 120} reviews)
                </span>
              </div>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {product.description}
              </p>

              {/* Price */}
              <div className="mt-8 flex items-baseline gap-3">
                <span className="text-5xl font-black text-sky-950">
                  ₹{product.price}
                </span>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="mt-8 flex items-center gap-4">
                <span className="font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center rounded-xl border-2 border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-sky-950 shadow-sm transition hover:bg-slate-200"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-lg font-black">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-sky-950 shadow-sm transition hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-3">
              <button
                type="button"
                disabled={adding || product.stock <= 0}
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-600 px-8 py-5 text-xl font-black uppercase text-white shadow-xl transition hover:bg-orange-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>ADDING TO CART...</span>
                  </span>
                ) : (
                  <span>🛒 ADD TO CART • ₹{product.price * quantity}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
