import api from './api';

export interface UserProfileDto {
  username: string;
  bio: string;
  profilePicture: string;
  followersCount: number;
  followingCount: number;
  following: boolean;
}

export const getUserProfile = async (username: string): Promise<UserProfileDto> => {
  const response = await api.get<UserProfileDto>(`/users/${username}`);
  return response.data;
};

export const updateUserProfile = async (bio: string, profilePicture?: string): Promise<UserProfileDto> => {
  const response = await api.put<UserProfileDto>('/users/profile', { bio, profilePicture });
  return response.data;
};

export const toggleFollowUser = async (username: string): Promise<{ following: boolean }> => {
  const response = await api.post<{ following: boolean }>(`/users/${username}/follow`);
  return response.data;
};
