import api from "../api/axios";

export interface Category {
  id: number;
  name: string;
}

class CategoriesService {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  }

  async getById(id: string | number): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  }

  async create(name: string): Promise<Category> {
    const response = await api.post<Category>("/categories", { name });
    return response.data;
  }

  async update(id: string | number, name: string): Promise<Category> {
    const response = await api.patch<Category>(`/categories/${id}`, { name });
    return response.data;
  }

  async remove(id: string | number): Promise<Category> {
    const response = await api.delete<Category>(`/categories/${id}`);
    return response.data;
  }
}

export const categoriesService = new CategoriesService();
