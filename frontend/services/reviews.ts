import api from './api';

export interface ReviewResponse {
  id: number;
  username: string;
  userAvatar?: string;
  googleBookId: string;
  bookTitle: string;
  bookCover?: string;
  rating: number;
  reviewText?: string;
  favoriteQuote?: string;
  whatChanged?: string;
  isSpoiler: boolean;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  createdAt: string;
}

export interface CommentResponse {
  id: number;
  username: string;
  commentText: string;
  createdAt: string;
}

export const createReview = async (payload: {
  googleBookId: string;
  rating: number;
  reviewText?: string;
  favoriteQuote?: string;
  whatChanged?: string;
  isSpoiler: boolean;
}): Promise<ReviewResponse> => {
  const response = await api.post<ReviewResponse>('/reviews', payload);
  return response.data;
};

export const toggleLike = async (reviewId: number): Promise<{ liked: boolean }> => {
  const response = await api.post<{ liked: boolean }>(`/reviews/${reviewId}/like`);
  return response.data;
};

export const addComment = async (reviewId: number, commentText: string): Promise<CommentResponse> => {
  const response = await api.post<CommentResponse>(`/reviews/${reviewId}/comment`, { commentText });
  return response.data;
};

export const getComments = async (reviewId: number): Promise<CommentResponse[]> => {
  const response = await api.get<CommentResponse[]>(`/reviews/${reviewId}/comments`);
  return response.data;
};

export const getBookReviews = async (googleBookId: string): Promise<ReviewResponse[]> => {
  const response = await api.get<ReviewResponse[]>(`/reviews/book/${googleBookId}`);
  return response.data;
};

export const getFeed = async (): Promise<ReviewResponse[]> => {
  const response = await api.get<ReviewResponse[]>('/reviews/feed');
  return response.data;
};

export const getUserTimeline = async (username: string): Promise<ReviewResponse[]> => {
  const response = await api.get<ReviewResponse[]>(`/reviews/user/${username}`);
  return response.data;
};
