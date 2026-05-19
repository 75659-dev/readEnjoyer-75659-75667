import api from "../api/axios";

export interface Author {
  id: number;
  name: string;
  bio?: string | null;
  image?: string | null;
}

export interface CreateAuthorDto {
  name: string;
  bio?: string;
  image?: string;
}

class AuthorsService {
  async getAll(): Promise<Author[]> {
    const response = await api.get<Author[]>("/authors");
    return response.data;
  }

  async getById(id: string | number): Promise<Author> {
    const response = await api.get<Author>(`/authors/${id}`);
    return response.data;
  }

  async create(data: CreateAuthorDto): Promise<Author> {
    const response = await api.post<Author>("/authors", data);
    return response.data;
  }

  async update(id: string | number, data: CreateAuthorDto): Promise<Author> {
    const response = await api.put<Author>(`/authors/${id}`, data);
    return response.data;
  }

  async remove(id: string | number): Promise<Author> {
    const response = await api.delete<Author>(`/authors/${id}`);
    return response.data;
  }
}

export const authorsService = new AuthorsService();
