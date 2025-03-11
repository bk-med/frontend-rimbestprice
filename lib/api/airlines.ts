import api from './axios';

export type Airline = {
  id: number;
  name: string;
  iataCode: string;
  logoUrl: string;
};

export const getAllAirlines = async (): Promise<Airline[]> => {
  const response = await api.get<Airline[]>('/airlines');
  return response.data;
};

export const getAirlineById = async (id: number): Promise<Airline> => {
  const response = await api.get<Airline>(`/airlines/${id}`);
  return response.data;
};

export const getAirlineByCode = async (iataCode: string): Promise<Airline> => {
  const response = await api.get<Airline>(`/airlines/code/${iataCode}`);
  return response.data;
};

// Admin-only endpoints
export const createAirline = async (airline: Omit<Airline, 'id'>): Promise<Airline> => {
  const response = await api.post<Airline>('/airlines', airline);
  return response.data;
};

export const updateAirline = async (id: number, airline: Omit<Airline, 'id'>): Promise<Airline> => {
  const response = await api.put<Airline>(`/airlines/${id}`, airline);
  return response.data;
};

export const deleteAirline = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/airlines/${id}`);
  return response.data;
}; 