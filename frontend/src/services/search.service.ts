import api from "../api/axios";
import type { Book } from "./books.service";

class SearchService {
  async searchBooks(query: string): Promise<Book[]> {
    const response = await api.get<Book[]>("/search", {
      params: { q: query },
    });
    return response.data;
  }
}

export const searchService = new SearchService();
