import { apiRequest } from "./api";

export async function getCart() {
  return apiRequest("/cart");
}

export async function addToCart(
  productId: string,
  quantity: number = 1
) {
  return apiRequest("/cart", {
    method: "POST",
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });
}

export async function updateCartItem(
  productId: string,
  quantity: number
) {
  return apiRequest(`/cart/${productId}`, {
    method: "PUT",
    body: JSON.stringify({
      quantity,
    }),
  });
}

export async function removeFromCart(productId: string) {
  return apiRequest(`/cart/${productId}`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  return apiRequest("/cart", {
    method: "DELETE",
  });
}

export async function syncLocalCartToBackend(
  localItems: { product: { _id: string }; quantity: number }[]
) {
  for (const item of localItems) {
    if (item.product?._id) {
      await addToCart(item.product._id, item.quantity).catch(() => {});
    }
  }
}