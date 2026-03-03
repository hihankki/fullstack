const API_URL = "http://127.0.0.1:8000";

let accessToken: string | null = localStorage.getItem("access_token");

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem("access_token", token);
  else localStorage.removeItem("access_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include", // важно для cookie refresh
  });

  if (!res.ok) return null;
  const data = await res.json();
  const token = data.access_token as string;
  setAccessToken(token);
  return token;
}

export async function apiFetch(input: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${API_URL}${input}`, {
    ...init,
    headers,
    credentials: "include",
  });

  // если access истёк -> пробуем refresh и повторяем
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res;

    const headers2 = new Headers(init.headers || {});
    headers2.set("Authorization", `Bearer ${newToken}`);

    return fetch(`${API_URL}${input}`, {
      ...init,
      headers: headers2,
      credentials: "include",
    });
  }

  return res;
}