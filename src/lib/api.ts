export function getApiBaseUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const cleanUrl = rawUrl.replace(/\/+$/, "").replace(/\/api$/, "");
  return `${cleanUrl}/api`;
}

export const API_URL = getApiBaseUrl();

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(`${getApiBaseUrl()}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
}