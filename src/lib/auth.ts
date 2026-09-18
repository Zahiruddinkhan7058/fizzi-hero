import { apiRequest } from "./api";

type RegisterData = {
  mobile: string;
  email: string;
  name: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

export async function registerUser(data: RegisterData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginData) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function saveAuth(token: string, user: unknown) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export function isLoggedIn() {
  return !!getToken();
}