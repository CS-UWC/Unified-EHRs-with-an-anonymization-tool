const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers);

  /*
   * Only set JSON Content-Type when we are not sending
   * FormData. The browser must set the multipart boundary
   * automatically for FormData requests.
   */
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  /*
   * Authentication has expired or is invalid.
   */
  if (response.status === 401) {
    localStorage.removeItem("access_token");

    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  /*
   * Handle other API errors.
   */
  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === "string") {
        message = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        message = errorData.detail
          .map((error: { msg?: string }) => error.msg)
          .filter(Boolean)
          .join(", ");
      }
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  /*
   * Some endpoints may return 204 No Content.
   */
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}