import api from "../api/axios";
import { type User } from "./auth.service"; // Reusing the User interface

export interface UpdateProfileDto {
  username?: string;
  avatar?: string;
}

class UsersService {
  async getMe(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  }

  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await api.patch<User>("/users/me", data);
    return response.data;
  }

  async getPublicProfile(id: string | number): Promise<
    Pick<User, "id" | "username" | "avatar" | "createdAt"> & {
      _count: { library: number; reviews: number };
      reviews: Array<{
        id: string;
        rating: number;
        text?: string | null;
        createdAt: string;
        book: {
          id: number;
          title: string;
          image?: string | null;
          author?: {
            id: number;
            name: string;
          };
        };
      }>;
    }
  > {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async search(query: string): Promise<
    Array<
      Pick<User, "id" | "username" | "avatar" | "createdAt"> & {
        _count: { library: number; reviews: number };
      }
    >
  > {
    const response = await api.get("/users/search", {
      params: { q: query },
    });
    return response.data;
  }
}

export const usersService = new UsersService();
