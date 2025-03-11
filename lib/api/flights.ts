import api from './axios';

export type Flight = {
  id: number;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  airline: {
    id: number;
    name: string;
    iataCode: string;
    logoUrl: string;
  };
  hasBookings?: boolean;
};

export type FlightSearchRequest = {
  departureCity: string;
  arrivalCity: string;
  departureDate?: string;
  returnDate?: string;
};

export const searchFlights = async (searchData: FlightSearchRequest): Promise<Flight[]> => {
  const response = await api.post<Flight[]>('/flights/search', searchData);
  return response.data;
};

export const searchFlightsGet = async (searchData: FlightSearchRequest): Promise<Flight[]> => {
  const { departureCity, arrivalCity, departureDate, returnDate } = searchData;
  const params: Record<string, string> = {
    departureCity,
    arrivalCity,
  };
  
  if (departureDate) {
    params.departureDate = departureDate;
  }
  
  if (returnDate) {
    params.returnDate = returnDate;
  }
  
  const response = await api.get<Flight[]>('/flights/search', { params });
  return response.data;
};

export const getAllFlights = async (): Promise<Flight[]> => {
  const response = await api.get<Flight[]>('/flights');
  return response.data;
};

export const getFlightById = async (id: number): Promise<Flight> => {
  const response = await api.get<Flight>(`/flights/${id}`);
  return response.data;
};

// Admin-only endpoints
export const createFlight = async (flight: Omit<Flight, 'id'>): Promise<Flight> => {
  const response = await api.post<Flight>('/flights', flight);
  return response.data;
};

export const updateFlight = async (id: number, flight: Omit<Flight, 'id'>): Promise<Flight> => {
  const response = await api.put<Flight>(`/flights/${id}`, flight);
  return response.data;
};

export const deleteFlight = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/flights/${id}`);
  return response.data;
};

// Add this new function to check if a flight has bookings
export const checkFlightHasBookings = async (id: number): Promise<boolean> => {
  try {
    const response = await api.get<{ hasBookings: boolean }>(`/flights/${id}/has-bookings`);
    return response.data.hasBookings;
  } catch (error) {
    console.error('Error checking if flight has bookings:', error);
    return true; // Default to true (safer to prevent deletion) in case of error
  }
}; 