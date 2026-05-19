import api from "../api/axios";

export interface ApiComment {
  id: string;
  text: string;
  createdAt: string;
  user?: {
    id?: string;
    username: string;
    avatar?: string | null;
  };
}

export interface CreateCommentDto {
  reviewId: string;
  text: string;
}

class CommentsService {
  async getByReview(reviewId: string): Promise<ApiComment[]> {
    const response = await api.get<ApiComment[]>(
      `/comments/review/${reviewId}`,
    );
    return response.data;
  }

  async create(data: CreateCommentDto): Promise<ApiComment> {
    const response = await api.post<ApiComment>("/comments", data);
    return response.data;
  }

  async remove(id: string): Promise<ApiComment> {
    const response = await api.delete<ApiComment>(`/comments/${id}`);
    return response.data;
  }
}

export const commentsService = new CommentsService();
