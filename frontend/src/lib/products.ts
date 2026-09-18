import { getApiBaseUrl } from "./api";

export type Product = {
  _id: string;
  name: string;
  flavor: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
};

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Products API failed: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data.products)) {
      return data.products;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    console.error("getProducts error:", error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/products/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Product API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.product || data || null;
  } catch (error) {
    console.error("getProductById error:", error);
    return null;
  }
}