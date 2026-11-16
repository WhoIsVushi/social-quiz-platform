"use client";
export async function api<T = Record<string, unknown>>(
  path: string,
  method = "POST",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/v1/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "İşlem tamamlanamadı.");
  return result as T;
}
