export async function fetchJson<T>(input: RequestInfo, init: RequestInit = {}) {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? (JSON.parse(text) as T) : (undefined as T));
}

async function safeParseError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data === "string") {
      return data;
    }
    if (data && typeof data.message === "string") {
      return data.message;
    }
    return JSON.stringify(data);
  } catch {
    return response.statusText || "Request failed";
  }
}
