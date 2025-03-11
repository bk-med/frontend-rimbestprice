import api from './axios';
import { Airline } from './airlines';
import { Flight } from './flights';

export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
};

export type Booking = {
  id: number;
  user: User;
  bookingDate: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  tickets: any[];
};

export type StatsResponse = {
  totalUsers: number;
  totalBookings: number;
  totalFlights: number;
  totalRevenue: number;
  recentBookings: Booking[];
  popularRoutes: Record<string, number>;
};

export type MonthlyRevenueData = Record<string, number>;

// User Management
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/admin/users/${id}`);
  return response.data;
};

export const updateUserRole = async (id: number, role: string): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(`/admin/users/${id}/role?role=${role}`);
  return response.data;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/admin/users/${id}`);
  return response.data;
};

// Booking Management
export const getAllBookings = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>('/admin/bookings');
  return response.data;
};

export const updateBookingStatus = async (id: number, status: string): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(`/admin/bookings/${id}/status?status=${status}`);
  return response.data;
};

// Statistics and Dashboard Data
export const getStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>('/admin/stats');
  return response.data;
};

export const getMonthlyRevenue = async (): Promise<MonthlyRevenueData> => {
  const response = await api.get<MonthlyRevenueData>('/admin/revenue/monthly');
  return response.data;
}; 