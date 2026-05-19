import api from "../api/axios";

export interface ApiReview {
  id: string;
  bookId: number;
  rating: number;
  text?: string | null;
  createdAt: string;
  book?: {
    id: number;
    title: string;
  };
  user?: {
    id?: string;
    username: string;
    avatar?: string | null;
  };
}

export interface CreateReviewDto {
  bookId: number;
  rating: number;
  text?: string;
}

class ReviewsService {
  async getByBook(bookId: number): Promise<ApiReview[]> {
    const response = await api.get<ApiReview[]>(`/reviews/book/${bookId}`);
    return response.data;
  }

  async getMine(): Promise<ApiReview[]> {
    const response = await api.get<ApiReview[]>("/reviews/me");
    return response.data;
  }

  async create(data: CreateReviewDto): Promise<ApiReview> {
    const response = await api.post<ApiReview>("/reviews", data);
    return response.data;
  }

  async update(id: string, data: Omit<CreateReviewDto, "bookId">): Promise<ApiReview> {
    const response = await api.patch<ApiReview>(`/reviews/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<ApiReview> {
    const response = await api.delete<ApiReview>(`/reviews/${id}`);
    return response.data;
  }
}

export const reviewsService = new ReviewsService();
