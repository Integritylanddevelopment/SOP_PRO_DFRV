import { apiRequest } from "@/lib/queryClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ssn: string;
  dateOfBirth: string;
  position: string;
  password: string;
  companyId: string;
  role: "employee" | "manager" | "owner";
}

export async function login(credentials: LoginCredentials) {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return response.json();
}

export async function register(data: RegisterData) {
  const response = await apiRequest("POST", "/api/auth/register", data);
  return response.json();
}

export async function getCurrentUser(token: string) {
  const response = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return response.json();
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${token}`,
  };
}
