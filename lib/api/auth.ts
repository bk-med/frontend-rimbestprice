import api from './axios';

export type LoginRequest = {
  username: string;
  password: string;
};

export type SignupRequest = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
};

export type UserData = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  token: string;
  id: number;
  username: string;
  email: string;
  role: string;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signin', data);
  return response.data;
};

export const signup = async (data: SignupRequest): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/signup', data);
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Retrieves the auth token from localStorage
 */
export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return null;
  }
}; 