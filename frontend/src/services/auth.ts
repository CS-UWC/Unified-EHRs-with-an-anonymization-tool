import { apiRequest } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export async function login(
  credentials: LoginRequest
): Promise<TokenResponse> {
  const response = await apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  localStorage.setItem("access_token", response.access_token);

  return response;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/me");
}

export function logout() {
  localStorage.removeItem("access_token");
}