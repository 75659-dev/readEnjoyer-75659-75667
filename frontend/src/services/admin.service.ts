import api from "../api/axios";

class AdminService {
  async seedFakeData(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/seed/fake-data");
    return response.data;
  }

  async checkDatabase(): Promise<unknown> {
    const response = await api.get("/health/db");
    return response.data;
  }
}

export const adminService = new AdminService();
