import api from "../api/axios";

export interface Book {
  id: number | string;
  title: string;
  author:
    | string
    | {
        id: number;
        name: string;
      };
  price: number;
  stock: number;
  description?: string | null;
  pages?: number | null;
  publishYear?: number | null;
  image?: string | null;
  coverUrl?: string | null;
  categories?: {
    id: number;
    name: string;
  }[];
  reviews?: {
    rating: number;
  }[];
}

export interface CreateBookDto {
  title: string;
  description?: string;
  price: number;
  stock: number;
  authorId: number;
  categoryIds?: number[];
  image?: string;
  pages?: number;
  publishYear?: number;
}

class BooksService {
  async getAll(): Promise<Book[]> {
    const response = await api.get<Book[]>("/books");
    return response.data;
  }

  async getById(id: string | number): Promise<Book> {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  }

  async create(data: CreateBookDto): Promise<Book> {
    const response = await api.post<Book>("/books", data);
    return response.data;
  }

  async update(id: string | number, data: CreateBookDto): Promise<Book> {
    const response = await api.put<Book>(`/books/${id}`, data);
    return response.data;
  }

  async remove(id: string | number): Promise<Book> {
    const response = await api.delete<Book>(`/books/${id}`);
    return response.data;
  }
}

export const booksService = new BooksService();
