import api, { API_BASE_URL } from "../api/axios";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface User {
  id: number | string;
  email: string;
  username: string;
  role: string;
  avatar?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user?: User;
}

export interface RegisterResponse {
  message: string;
}

class AuthService {
  getGoogleAuthUrl(): string {
    return `${API_BASE_URL}/auth/google`;
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  }

  async register(data: RegisterDto): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await api.get("/auth/verify-email", {
      params: { token },
    });
    return response.data;
  }

  async refresh(): Promise<{ accessToken: string }> {
    const response = await api.post<{ accessToken: string }>("/auth/refresh");
    return response.data;
  }

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/auth/logout");
    return response.data;
  }
}

export const authService = new AuthService();

export function getNameFromAccessToken(token: string) {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.email || "User";
  } catch {
    return "User";
  }
}
