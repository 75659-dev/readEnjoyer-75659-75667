import api from "../api/axios";
import type { Book as ApiBook } from "./books.service";

export type ReadingStatus = "WANT_TO_READ" | "READING" | "READ";

export interface LibraryItem {
  id: string;
  bookId: number;
  status: ReadingStatus;
  pagesRead: number;
  book: ApiBook;
}

class LibraryService {
  async getMine(): Promise<LibraryItem[]> {
    const response = await api.get<LibraryItem[]>("/users/me/library");
    return response.data;
  }

  async addBook(
    bookId: number,
    data: Partial<Pick<LibraryItem, "status" | "pagesRead">> = {},
  ): Promise<LibraryItem> {
    const response = await api.post<LibraryItem>(
      `/users/me/library/${bookId}`,
      data,
    );
    return response.data;
  }

  async updateBook(
    bookId: number,
    data: Partial<Pick<LibraryItem, "status" | "pagesRead">>,
  ): Promise<LibraryItem> {
    const response = await api.patch<LibraryItem>(
      `/users/me/library/${bookId}`,
      data,
    );
    return response.data;
  }

  async removeBook(bookId: number): Promise<LibraryItem> {
    const response = await api.delete<LibraryItem>(
      `/users/me/library/${bookId}`,
    );
    return response.data;
  }
}

export const libraryService = new LibraryService();
