import api from './axios';
import { getStoredToken } from './auth';

export type Passenger = {
  passengerName: string;
  passengerEmail: string;
};

export type BookingRequest = {
  flightId: number;
  passengers: Passenger[];
};

export type Ticket = {
  id: number;
  passengerName: string;
  passengerEmail: string;
  price: number;
  seatNumber: string;
  status: string;
  checkedIn: boolean;
  baggageChecked: boolean;
  flight: {
    id: number;
    flightNumber: string;
    departureCity: string;
    arrivalCity: string;
    departureTime: string;
    arrivalTime: string;
  };
};

export type Booking = {
  id: number;
  bookingNumber: string;
  bookingDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  tickets: Ticket[];
};

/**
 * Function to create a booking with proper auth handling
 */
export const createBooking = async (bookingData: BookingRequest): Promise<Booking> => {
  const token = getStoredToken();
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  try {
    const response = await api.post<Booking>('/bookings', bookingData, config);
    return response.data;
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

/**
 * Function to get all bookings for the authenticated user
 */
export const getUserBookings = async (): Promise<Booking[]> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    // Add timestamp to URL to bypass cache
    params: {
      _: new Date().getTime()
    }
  };
  
  try {
    console.log('Fetching user bookings');
    const response = await api.get<Booking[]>('/bookings', config);
    console.log(`Retrieved ${response.data.length} bookings`);
    return response.data;
  } catch (error) {
    console.error('Get user bookings error:', error);
    throw error;
  }
};

/**
 * Function to get a specific booking by ID
 */
export const getBookingById = async (id: number): Promise<Booking> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    // Add timestamp to URL to bypass cache
    params: {
      _: new Date().getTime()
    }
  };
  
  try {
    console.log(`Fetching booking details for ID: ${id}`);
    const response = await api.get<Booking>(`/bookings/${id}`, config);
    console.log('Booking details response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Get booking ${id} error:`, error);
    throw error;
  }
};

/**
 * Function to cancel a booking
 */
export const cancelBooking = async (id: number): Promise<{ message: string }> => {
  const token = getStoredToken();
  
  if (!token) {
    console.error('No token found for cancellation');
    throw new Error('No authentication token found');
  }
  
  // Log the first and last 4 characters of the token for debugging
  const tokenFirst4 = token.substring(0, 4);
  const tokenLast4 = token.substring(token.length - 4);
  console.log(`Using token: ${tokenFirst4}...${tokenLast4} for cancellation`);
  
  try {
    // Log the target API URL
    const apiUrl = `/bookings/${id}/cancel`;
    console.log(`Cancelling booking ${id} at: ${api.defaults.baseURL}${apiUrl}`);
    
    // Add authorization header directly to request
    const response = await api({
      method: 'PUT',
      url: apiUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {} // Empty body
    });
    
    console.log('Cancel booking response:', response.data);
    return response.data;
  } catch (err: any) {
    console.error('Booking cancellation failed:', err);
    
    if (err.response) {
      console.log('Error status:', err.response.status);
      console.log('Error data:', err.response.data);
    }
    
    throw err;
  }
}; 