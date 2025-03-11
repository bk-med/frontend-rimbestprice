'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiDownload, 
  FiInfo, 
  FiMap, 
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiChevronRight,
  FiShield,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';
import { RiFlightTakeoffLine, RiFlightLandLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Booking, getBookingById, cancelBooking } from '@/lib/api/bookings';
import { formatDate, formatTime, formatPrice } from '@/lib/utils/formatters';
import { generateTicketPDF, formatTicketFileName } from '@/lib/utils/pdfGenerator';
import { toast } from 'react-hot-toast';

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, token, handleAuthFailure, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (!authLoading && isAuthenticated) {
      fetchBookingDetails();
    }
  }, [isAuthenticated, authLoading, router, params]);
  
  const fetchBookingDetails = async () => {
    if (!params.id) {
      console.error('Missing booking ID in URL parameters');
      setError('ID de réservation manquant');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching booking with ID:', params.id);
      
      // Ensure we have a valid ID - handle both numeric and string IDs
      let bookingId: number;
      try {
        bookingId = parseInt(params.id as string);
        if (isNaN(bookingId)) {
          throw new Error('Invalid booking ID format');
        }
      } catch (parseError) {
        console.error('Error parsing booking ID:', parseError);
        setError('Format d\'ID de réservation invalide');
        setLoading(false);
        return;
      }
      
      // Make the API call with proper error handling
      try {
        const data = await getBookingById(bookingId);
        console.log('Booking data received:', data);
        setBooking(data);
      } catch (apiError: any) {
        console.error('API Error details:', apiError?.response?.data || apiError.message || apiError);
        if (apiError?.response?.status === 404) {
          setError('Réservation introuvable. Veuillez vérifier l\'ID de réservation.');
        } else if (apiError?.response?.status === 401) {
          setError('Vous n\'êtes pas autorisé à accéder à cette réservation.');
          // Optionally redirect to login
          // router.push('/auth/login');
        } else {
          setError(`Erreur lors de la récupération de la réservation: ${apiError.message || 'Erreur inconnue'}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch booking details', err);
      setError('Impossible de récupérer les détails de la réservation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelBooking = async () => {
    if (!booking) return;
    
    // Set cancelling state
    setCancellingBooking(true);
    setError(null);
    
    try {
      console.log('Starting booking cancellation process for booking ID:', booking.id);
      
      // Try to cancel via API
      const result = await cancelBooking(booking.id);
      console.log('Cancellation API call successful:', result);
      
      // Success path - API call worked
      toast.success('Réservation annulée avec succès');
      setShowCancelModal(false); // Close the modal on success
      proceedWithCancellationSuccess();
    } catch (err: any) {
      console.error('Failed to cancel booking - detailed error:', err);
      
      // Check for specific error types
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', err.response.data);
        
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Vous n\'êtes pas autorisé à annuler cette réservation. Veuillez vous reconnecter.');
          toast.error('Erreur d\'authentification');
        } else if (err.response.status === 400) {
          // Backend validation error 
          setError(err.response.data?.message || 'Impossible d\'annuler cette réservation. Veuillez contacter le support.');
          toast.error('Annulation impossible');
        } else {
          setError('Une erreur s\'est produite lors de l\'annulation. Veuillez réessayer ou contacter le support.');
          toast.error('Erreur du serveur');
        }
        
        // For demo/testing purposes, still proceed if the backend is not working
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            console.log('DEV MODE: Proceeding with cancellation flow despite API error');
            setShowCancelModal(false);
            proceedWithCancellationSuccess();
          }, 3000);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.log('No response received:', err.request);
        setError('Impossible de joindre le serveur. Veuillez vérifier votre connexion et réessayer.');
        toast.error('Erreur de connexion');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error message:', err.message);
        setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
        toast.error('Erreur inattendue');
      }
    } finally {
      setCancellingBooking(false);
      // Note: We don't close the modal here so the user can see any error message
    }
  };
  
  // Helper function to handle successful cancellation flow
  const proceedWithCancellationSuccess = () => {
    // Get formatted booking number
    const bookingNumber = getBookingNumber(booking!);
    
    // Redirect to cancel confirmation page
    router.push(`/bookings/${booking!.id}/cancel-confirmation?bookingNumber=${bookingNumber}&amount=${booking!.totalPrice}`);
  };
  
  const handleDownloadTicket = async () => {
    if (!booking) {
      console.error('Cannot download ticket: Booking data is not available');
      setError('Impossible de télécharger le billet: données de réservation non disponibles. Veuillez réessayer.');
      return;
    }
    
    if (!booking.tickets || booking.tickets.length === 0) {
      console.error('Cannot download ticket: No tickets found in booking');
      setError('Impossible de télécharger le billet: aucun billet trouvé dans cette réservation.');
      return;
    }
    
    try {
      const passengerName = booking.tickets[0]?.passengerName || 'passenger';
      const bookingNumber = getBookingNumber(booking);
      const fileName = formatTicketFileName(bookingNumber, passengerName);
      
      // Create a modified booking object with the generated booking number
      const bookingWithNumber = {
        ...booking,
        bookingNumber: bookingNumber
      };
      
      // Pass the modified booking object directly to the PDF generator
      await generateTicketPDF('', fileName, bookingWithNumber);
    } catch (error) {
      console.error('Failed to download ticket:', error);
      setError('Échec du téléchargement du billet');
    }
  };
  
  /**
   * Gets the booking number from the booking data or generates one if missing
   */
  const getBookingNumber = (booking: any): string => {
    if (booking.bookingNumber) {
      return booking.bookingNumber;
    }
    
    // If bookingNumber is missing, generate one based on the ID
    // Format: RB-00000{id} (e.g., RB-000034)
    return `RB-${booking.id.toString().padStart(6, '0')}`;
  }
  
  // Update the canCancelBooking function to check booking status
  const canCancelBooking = (booking: Booking): boolean => {
    // If booking is already cancelled, can't cancel again
    if (booking.status === 'CANCELLED') return false;
    
    if (!booking || !booking.tickets || booking.tickets.length === 0) return false;

    const flight = booking.tickets[0].flight;
    if (!flight || !flight.departureTime) return false;

    // Check if it's not within 48 hours of departure
    const departureTime = new Date(flight.departureTime);
    const now = new Date();
    const diffInHours = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return diffInHours >= 48;
  };
  
  // Add this function after handleCancelBooking
  useEffect(() => {
    // Clean up any error or cancellation state when the modal closes
    if (!showCancelModal) {
      setError(null);
      setCancellingBooking(false);
    }
  }, [showCancelModal]);
  
  // Add refresh function
  const refreshBookingDetails = () => {
    setLoading(true);
    setError(null);
    fetchBookingDetails().finally(() => {
      setLoading(false);
      toast.success('Réservation mise à jour');
    });
  };
  
  // Loading state
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                  <FiAlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex justify-center">
                  <Link href="/bookings">
                    <Button size="lg">
                      <FiArrowLeft className="mr-2" /> Retour aux réservations
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // No booking found
  if (!booking) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                  <FiInfo className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation introuvable</h2>
                <p className="text-gray-600 mb-6">
                  Nous n'avons pas pu trouver la réservation demandée. Il est possible qu'elle ait été supprimée ou que vous n'ayez pas les permissions nécessaires.
                </p>
                <div className="flex justify-center">
                  <Link href="/bookings">
                    <Button size="lg">
                      <FiArrowLeft className="mr-2" /> Retour aux réservations
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  const isPaid = booking.status === 'CONFIRMED';
  const isCancelled = booking.status === 'CANCELLED';
  const ticket = booking.tickets[0]; // Get the first ticket for simplicity
  
  // Update the cancel confirmation modal
  const CancelConfirmationModal = () => {
    if (!showCancelModal) return null;
    
    // Check if booking can be cancelled
    const canCancel = booking ? canCancelBooking(booking) : false;
    
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirmation d'annulation</h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-500"
                disabled={cancellingBooking}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!error && !canCancel && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      Cette réservation ne peut pas être annulée car le départ est prévu dans moins de 48 heures.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!error && canCancel && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      Cette action est irréversible.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="mb-6 text-gray-600">
              Êtes-vous sûr de vouloir annuler cette réservation? Une fois annulée, le remboursement sera traité dans les prochains jours.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelModal(false)}
                disabled={cancellingBooking}
              >
                Conserver ma réservation
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleCancelBooking}
                isLoading={cancellingBooking}
                disabled={cancellingBooking || !canCancel}
              >
                {cancellingBooking ? 'Annulation...' : 'Confirmer l\'annulation'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-6 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Top Navigation */}
          <div className="mb-6 flex justify-between items-center">
            <Link href="/bookings" className="text-primary-600 hover:text-primary-800 inline-flex items-center">
              <FiArrowLeft className="mr-2" /> 
              <span className="text-sm font-medium">Retour à mes réservations</span>
            </Link>
            <button
              onClick={refreshBookingDetails}
              className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
              aria-label="Rafraîchir"
              title="Rafraîchir les détails de la réservation"
            >
              <FiRefreshCw className="h-5 w-5" />
            </button>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between bg-white p-4 md:p-6 rounded-t-lg border-b border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                <FiUser className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Réservation #{getBookingNumber(booking)}
                </h1>
                <p className="text-sm text-gray-500">
                  Réservée le {formatDate(booking.bookingDate)}
                </p>
              </div>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isCancelled 
                  ? 'bg-red-100 text-red-800' 
                  : isPaid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isCancelled 
                  ? 'Annulée' 
                  : isPaid 
                    ? 'Confirmée' 
                    : 'En attente'}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-b-lg shadow-md overflow-hidden mb-6">
            {/* Action Buttons */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto py-2 px-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadTicket}
                  className="flex flex-col items-center justify-center min-w-[100px] py-3 px-4 text-primary-600 rounded-md hover:bg-primary-50"
                >
                  <FiDownload className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Télécharger</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCancelModal(true)}
                  className="flex flex-col items-center justify-center min-w-[100px] py-3 px-4 text-red-600 rounded-md hover:bg-red-50"
                >
                  <FiTrash2 className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Annuler</span>
                </motion.button>
              </div>
            </div>
            
            {/* Flight Information */}
            {ticket && (
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex-1 text-center md:text-left flex flex-col md:flex-row items-center mb-4 md:mb-0">
                    <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mb-3 md:mb-0 md:mr-4">
                      <RiFlightTakeoffLine className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Vol</h3>
                      <p className="text-lg font-bold">{ticket.flight.flightNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center mb-4 md:mb-0">
                    <div className="flex items-center justify-center">
                      <div className="text-right mr-3">
                        <p className="text-2xl font-bold">{ticket.flight.departureCity}</p>
                        <p className="text-xs text-gray-500">Départ</p>
                      </div>
                      
                      <div className="w-20 h-px bg-gray-300 mx-2 relative">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <RiFlightTakeoffLine className="text-primary-600" />
                        </div>
                      </div>
                      
                      <div className="text-left ml-3">
                        <p className="text-2xl font-bold">{ticket.flight.arrivalCity}</p>
                        <p className="text-xs text-gray-500">Arrivée</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <h3 className="text-sm font-medium text-gray-500">Prix</h3>
                    <p className="text-xl font-bold text-primary-600">{formatPrice(booking.totalPrice)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Departure Card */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start mb-4">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <RiFlightTakeoffLine className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Départ</h3>
                        <p className="text-sm text-gray-600">{formatDate(ticket.flight.departureTime)}</p>
                      </div>
                    </div>
                    
                    <div className="ml-12">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Heure</h4>
                        <p className="text-xl font-bold">{formatTime(ticket.flight.departureTime)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Aéroport</h4>
                        <p className="text-lg font-medium">{ticket.flight.departureCity}</p>
                        <p className="text-sm text-gray-600">{ticket.flight.departureAirportCode || 'Code Aéroport'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrival Card */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start mb-4">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <RiFlightLandLine className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Arrivée</h3>
                        <p className="text-sm text-gray-600">{formatDate(ticket.flight.arrivalTime)}</p>
                      </div>
                    </div>
                    
                    <div className="ml-12">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Heure</h4>
                        <p className="text-xl font-bold">{formatTime(ticket.flight.arrivalTime)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Aéroport</h4>
                        <p className="text-lg font-medium">{ticket.flight.arrivalCity}</p>
                        <p className="text-sm text-gray-600">{ticket.flight.arrivalAirportCode || 'Code Aéroport'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Passenger Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FiUser className="mr-2 text-primary-600" />
                    Informations Passager
                  </h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {booking.tickets.map((ticket, index) => (
                      <div key={ticket.id} className={`p-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-1">Nom du passager</h4>
                            <p className="text-base font-semibold">{ticket.passengerName}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-1">Siège</h4>
                            <p className="text-base font-semibold">{ticket.seatNumber || 'Non assigné'}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-1">Email</h4>
                            <p className="text-base font-semibold">{ticket.passengerEmail}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                          <div className="flex items-center text-xs">
                            <div className={`flex items-center ${ticket.checkedIn ? 'text-green-600' : 'text-gray-500'}`}>
                              <FiCheckCircle className="mr-1" />
                              <span>{ticket.checkedIn ? 'Enregistré' : 'Non enregistré'}</span>
                            </div>
                            <span className="mx-2 text-gray-300">|</span>
                            <div className={`flex items-center ${ticket.baggageChecked ? 'text-green-600' : 'text-gray-500'}`}>
                              <FiCheckCircle className="mr-1" />
                              <span>{ticket.baggageChecked ? 'Bagages enregistrés' : 'Bagages non enregistrés'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Booking Summary */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FiInfo className="mr-2 text-primary-600" />
                    Résumé de la réservation
                  </h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Numéro de réservation</h4>
                        <p className="text-base font-bold">{getBookingNumber(booking)}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Date de réservation</h4>
                        <p className="text-base font-medium">{formatDate(booking.bookingDate)}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Statut</h4>
                        <p className={`text-base font-medium ${
                          isCancelled 
                            ? 'text-red-600' 
                            : isPaid 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                        }`}>
                          {isCancelled 
                            ? 'Annulée' 
                            : isPaid 
                              ? 'Confirmée' 
                              : 'En attente'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Prix total</span>
                        <span className="text-lg font-bold text-primary-600">{formatPrice(booking.totalPrice)}</span>
                      </div>
                      
                      {/* Add the cancellation button */}
                      {canCancelBooking(booking) && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                          <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            <FiTrash2 className="mr-2" />
                            Annuler cette réservation
                          </button>
                          <p className="text-xs text-gray-500 mt-1">
                            Vous pouvez annuler votre réservation jusqu'à 48 heures avant le départ.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Assistance Information Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                <FiShield className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-1">Besoin d'aide ?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Notre équipe de service client est disponible pour répondre à toutes vos questions concernant votre réservation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 mb-1">Email</p>
                    <p className="text-sm font-bold">support@rimbest.com</p>
                  </div>
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 mb-1">Téléphone</p>
                    <p className="text-sm font-bold">+222 45 25 25 25</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add cancel confirmation modal */}
      <CancelConfirmationModal />
    </Layout>
  );
} 