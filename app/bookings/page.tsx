'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  FiCalendar, 
  FiClock, 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp,
  FiRefreshCw
} from 'react-icons/fi';
// Use a different icon as a replacement for FiPlane
import { RiFlightTakeoffLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Booking, getUserBookings } from '@/lib/api/bookings';
import { formatDate, formatTime, formatPrice } from '@/lib/utils/formatters';
import { toast } from 'react-hot-toast';

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect to login if not authenticated using useEffect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, router]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      setError('Impossible de récupérer vos réservations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (statusFilter !== 'all' && booking.status.toLowerCase() !== statusFilter) {
      return false;
    }
    
    // If no search query, return all bookings that match the status filter
    if (!searchQuery.trim()) {
      return true;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Search in flight number, departure city, arrival city, and passenger names
    return (
      booking.tickets.some(ticket => 
        ticket.flight.flightNumber.toLowerCase().includes(query) ||
        ticket.flight.departureCity.toLowerCase().includes(query) ||
        ticket.flight.arrivalCity.toLowerCase().includes(query) ||
        ticket.passengerName.toLowerCase().includes(query) ||
        ticket.passengerEmail.toLowerCase().includes(query)
      ) ||
      booking.bookingNumber.toLowerCase().includes(query)
    );
  });
  
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  const refreshBookings = () => {
    setLoading(true);
    fetchBookings().finally(() => {
      setLoading(false);
      toast.success('Réservations mises à jour');
    });
  };
  
  // Show loading state while checking authentication or fetching bookings
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  // Show error state if there was a problem fetching bookings
  if (error) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-red-500 mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <Button onClick={fetchBookings} size="lg">
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshBookings}
                className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Rafraîchir"
                title="Rafraîchir les réservations"
              >
                <FiRefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FiFilter className="text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
              </div>
              <button 
                onClick={toggleFilter}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {filterOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            
            {filterOpen && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut de la réservation
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={`px-4 py-2 rounded-full text-sm ${
                          statusFilter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setStatusFilter('all')}
                      >
                        Tous
                      </button>
                      <button
                        className={`px-4 py-2 rounded-full text-sm ${
                          statusFilter === 'confirmed'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setStatusFilter('confirmed')}
                      >
                        Confirmées
                      </button>
                      <button
                        className={`px-4 py-2 rounded-full text-sm ${
                          statusFilter === 'cancelled'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setStatusFilter('cancelled')}
                      >
                        Annulées
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Rechercher par destination, numéro de vol..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune réservation</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore effectué de réservation.
              </p>
              <div className="mt-6">
                <Link href="/flights">
                  <Button size="lg">
                    <RiFlightTakeoffLine className="mr-2" /> Rechercher des vols
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center">
                          <RiFlightTakeoffLine className="text-primary-600 mr-2" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {booking.tickets[0]?.flight.departureCity} → {booking.tickets[0]?.flight.arrivalCity}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Vol {booking.tickets[0]?.flight.flightNumber} • {booking.tickets.length} {booking.tickets.length > 1 ? 'passagers' : 'passager'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : booking.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status === 'CANCELLED'
                            ? 'Annulée'
                            : booking.status === 'CONFIRMED' 
                              ? 'Confirmée' 
                              : 'Annulée'}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatPrice(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                    
                    {booking.tickets[0]?.flight && (
                      <div className="border-t border-b border-gray-200 py-4 my-4">
                        <div className="flex justify-between mb-2">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Départ</p>
                            <p className="text-lg font-semibold">{formatTime(booking.tickets[0].flight.departureTime)}</p>
                            <p className="text-sm">{booking.tickets[0].flight.departureCity}</p>
                          </div>
                          <div className="flex-1 flex items-center justify-center px-4">
                            <div className="w-full h-0.5 bg-gray-300 relative">
                              <div className="absolute left-0 right-0 -top-3 flex justify-center">
                                <RiFlightTakeoffLine className="text-primary-600" />
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Arrivée</p>
                            <p className="text-lg font-semibold">{formatTime(booking.tickets[0].flight.arrivalTime)}</p>
                            <p className="text-sm">{booking.tickets[0].flight.arrivalCity}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          <FiCalendar className="text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600">{formatDate(booking.tickets[0].flight.departureTime)}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          <FiClock className="inline mr-1" /> Réservé le {formatDate(booking.bookingDate)}
                        </p>
                      </div>
                      <div>
                        <Link href={`/bookings/${booking.id}`}>
                          <Button size="sm">
                            Détails
                          </Button>
                        </Link>
                        {/* Cancel button removed - cancellation only available on booking details page */}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 