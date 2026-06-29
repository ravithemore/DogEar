import api from './api';

export interface BookDto {
  googleBookId: string;
  title: string;
  authors: string;
  coverImage?: string;
  description?: string;
  pageCount?: number;
  publishedDate?: string;
}

export interface UserBookDto {
  id: number;
  book: BookDto;
  status: 'WANT_TO_READ' | 'READING' | 'COMPLETED';
  currentPage: number;
  startedAt?: string;
  completedAt?: string;
}

export const searchBooks = async (query: string): Promise<BookDto[]> => {
  const response = await api.get<BookDto[]>('/books/search', { params: { query } });
  return response.data;
};

export const updateShelfStatus = async (
  googleBookId: string,
  status: 'WANT_TO_READ' | 'READING' | 'COMPLETED'
): Promise<UserBookDto> => {
  const response = await api.post<UserBookDto>('/books/shelf', { googleBookId, status });
  return response.data;
};

export const getUserShelf = async (status?: string, username?: string): Promise<UserBookDto[]> => {
  const response = await api.get<UserBookDto[]>('/books/shelf', { params: { status, username } });
  return response.data;
};
