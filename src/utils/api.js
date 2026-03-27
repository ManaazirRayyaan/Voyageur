const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "voyageur-auth-tokens";

export function getApiBase() {
  return API_BASE;
}

export function getStoredTokens() {
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens) {
  if (!tokens) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export async function apiRequest(path, { method = "GET", body, token, headers = {}, parse = "json" } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (parse === "blob") {
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Request failed.");
    }
    return response.blob();
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const detail = data?.detail || data?.message || "Request failed.";
    const error = new Error(typeof detail === "string" ? detail : "Request failed.");
    error.payload = data;
    throw error;
  }
  return data;
}
