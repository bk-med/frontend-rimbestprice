'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import { getBookingById, getUserBookings } from '@/lib/api/bookings';

export default function BookingDebugPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [bookingId, setBookingId] = useState('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const testGetBookings = async () => {
    setLoading(true);
    setTestOutput('Loading bookings...');
    
    try {
      const bookings = await getUserBookings();
      setTestOutput(
        `Success! Found ${bookings.length} bookings:\n\n` +
        bookings.map(b => `ID: ${b.id}, Number: ${b.bookingNumber}, Date: ${b.bookingDate}`).join('\n')
      );
    } catch (error: any) {
      setTestOutput(`Error getting bookings: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const testGetBookingById = async () => {
    if (!bookingId.trim()) {
      setTestOutput('Please enter a booking ID');
      return;
    }
    
    setLoading(true);
    setTestOutput(`Loading booking ID: ${bookingId}...`);
    
    try {
      const id = parseInt(bookingId);
      if (isNaN(id)) {
        throw new Error('Invalid ID format');
      }
      
      const booking = await getBookingById(id);
      setTestOutput(
        `Success! Booking details:\n` +
        `ID: ${booking.id}\n` +
        `Number: ${booking.bookingNumber}\n` +
        `Date: ${booking.bookingDate}\n` +
        `Status: ${booking.paymentStatus}\n` +
        `Tickets: ${booking.tickets.length}`
      );
    } catch (error: any) {
      setTestOutput(`Error getting booking: ${error.message || JSON.stringify(error)}`);
      console.error('Booking fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">You need to be logged in to use this debug page.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Booking API Debug Tool</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Get All Bookings</h2>
          <Button 
            onClick={testGetBookings} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Loading...' : 'Get All Bookings'}
          </Button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Get Booking By ID</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter Booking ID"
              className="flex-1 border border-gray-300 rounded px-4 py-2"
            />
            <Button onClick={testGetBookingById} disabled={loading}>
              {loading ? 'Loading...' : 'Get Booking'}
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Test Output</h2>
          <pre className="bg-gray-800 text-white p-4 rounded whitespace-pre-wrap h-80 overflow-auto">
            {testOutput || 'Run a test to see output here...'}
          </pre>
        </div>
      </div>
    </Layout>
  );
} 