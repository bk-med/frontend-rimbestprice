'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCreditCard, 
  FiCalendar, 
  FiCheck, 
  FiChevronLeft, 
  FiChevronRight, 
  FiDownload 
} from 'react-icons/fi';
// Use a different icon as a replacement for FiPlane
import { RiFlightTakeoffLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Flight, getFlightById } from '@/lib/api/flights';
import { createBooking, BookingRequest, Booking } from '@/lib/api/bookings';
import { generateTicketPDF, formatTicketFileName } from '@/lib/utils/pdfGenerator';
import { formatDate, formatTime, formatPrice } from '@/lib/utils/formatters';

// Check if we're in development environment - in production, this should be false
const IS_DEV = process.env.NODE_ENV === 'development';

// Create a more lenient schema for dev mode
const createPaymentSchema = (isDevMode: boolean) => {
  if (isDevMode) {
    // More lenient schema for dev mode
    return z.object({
      cardNumber: z.string().min(1, "Le numéro de carte est requis"),
      cardHolder: z.string().min(1, "Le nom du titulaire est requis"),
      expiryDate: z.string().min(1, "La date d'expiration est requise"),
      cvv: z.string().min(1, "Le code CVV est requis"),
    });
  } else {
    // Original strict schema for production
    return z.object({
      cardNumber: z.string().regex(/^\d{16}$/, 'Le numéro de carte doit contenir 16 chiffres'),
      cardHolder: z.string().min(2, 'Veuillez entrer le nom sur la carte'),
      expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Format invalide (MM/YY)'),
      cvv: z.string().regex(/^\d{3,4}$/, 'CVV invalide (3 ou 4 chiffres)'),
    });
  }
};

// Validation schemas
const passengerSchema = z.object({
  fullName: z.string().min(2, 'Veuillez entrer le nom complet'),
  email: z.string().email('Adresse email invalide'),
  phoneNumber: z.string().min(8, 'Numéro de téléphone invalide'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  nationality: z.string().min(2, 'Veuillez entrer la nationalité'),
  passportNumber: z.string().min(5, 'Numéro de passeport invalide'),
  passportExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
});

// Define paymentSchema as a function of dev mode
let paymentSchema = createPaymentSchema(false);

type PassengerFormValues = z.infer<typeof passengerSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  
  // Update payment schema when dev mode changes
  useEffect(() => {
    paymentSchema = createPaymentSchema(devMode);
  }, [devMode]);
  
  // Form state
  const {
    register: registerPassenger,
    handleSubmit: handlePassengerSubmit,
    formState: { errors: passengerErrors, isValid: passengerIsValid }
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
    }
  });
  
  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    setValue: setPaymentValue,
    trigger: triggerPaymentValidation,
    formState: { errors: paymentErrors, isValid: paymentIsValid }
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    }
  });
  
  // Apply test data when dev mode is toggled on
  useEffect(() => {
    if (devMode && step === 2) {
      // Set test values
      setPaymentValue('cardNumber', '4111111111111111');
      setPaymentValue('cardHolder', 'TEST USER');
      setPaymentValue('expiryDate', '12/25');
      setPaymentValue('cvv', '123');
      
      // Trigger validation to update form state
      setTimeout(() => {
        triggerPaymentValidation();
      }, 100);
    }
  }, [devMode, step, setPaymentValue, triggerPaymentValidation]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Get flight ID from URL
    const flightId = searchParams.get('flightId');
    if (!flightId) {
      setError('ID de vol manquant. Veuillez sélectionner un vol à réserver.');
      setLoading(false);
      return;
    }
    
    // Fetch flight details
    const fetchFlight = async () => {
      try {
        const flightData = await getFlightById(parseInt(flightId));
        setFlight(flightData);
      } catch (err) {
        console.error('Error fetching flight:', err);
        setError('Impossible de charger les détails du vol. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlight();
  }, [isAuthenticated, authLoading, router, searchParams]);
  
  const nextStep = () => {
    setStep((current) => Math.min(current + 1, 3));
  };
  
  const prevStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };
  
  const [passengerData, setPassengerData] = useState<PassengerFormValues | null>(null);
  
  const handlePassengerFormSubmit = (data: PassengerFormValues) => {
    console.log('Passenger data:', data);
    setPassengerData(data);
    nextStep();
  };
  
  const handlePaymentFormSubmit = async (data: PaymentFormValues) => {
    console.log('Payment data:', data);
    
    if (!flight || !passengerData) {
      setError("Données du vol ou du passager manquantes");
      return;
    }
    
    // Simulate payment processing
    setLoading(true);
    try {
      // In dev mode, we'll just simulate the API call
      if (devMode) {
        console.log('DEV MODE: Payment processed with test data');
        console.log('DEV MODE: In production, this would connect to a real payment gateway');
        
        // Wait to simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate a random booking number for dev mode
        const mockBookingNumber = 'RB' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setBookingNumber(mockBookingNumber);
        
        // Create a mock booking response
        const mockBooking: Booking = {
          id: Math.floor(Math.random() * 10000),
          bookingNumber: mockBookingNumber,
          bookingDate: new Date().toISOString(),
          totalPrice: flight.price,
          paymentStatus: "PAID",
          tickets: [{
            id: Math.floor(Math.random() * 10000),
            passengerName: passengerData.fullName,
            passengerEmail: passengerData.email,
            price: flight.price,
            seatNumber: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
            status: "CONFIRMED",
            checkedIn: false,
            baggageChecked: false,
            flight: {
              id: flight.id,
              flightNumber: flight.flightNumber,
              departureCity: flight.departureCity,
              arrivalCity: flight.arrivalCity,
              departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime
            }
          }]
        };
        
        setCreatedBooking(mockBooking);
      } else {
        // Real API call for production
        const bookingRequest: BookingRequest = {
          flightId: flight.id,
          passengers: [{
            passengerName: passengerData.fullName,
            passengerEmail: passengerData.email
          }]
        };
        
        // Create the actual booking in the database
        let bookingResponse = await createBooking(bookingRequest);
        
        // If the booking was created but status is pending, update it to paid
        // Ideally this would be handled on the backend in a real payment flow
        if (bookingResponse.paymentStatus.toLowerCase() !== 'paid') {
          try {
            // In a real application, this would be a proper API call to update payment status
            // For now we'll simulate that the payment was successful
            console.log('Updating booking status to PAID');
            
            // Since we don't have an API to update payment status, we'll modify the response object
            bookingResponse = {
              ...bookingResponse,
              paymentStatus: "PAID"
            };
            
            // In a real application with a proper API:
            // await updateBookingPaymentStatus(bookingResponse.id, "PAID");
          } catch (updateErr) {
            console.error('Failed to update payment status:', updateErr);
            // Continue with original booking response
          }
        }
        
        setBookingNumber(bookingResponse.bookingNumber);
        setCreatedBooking(bookingResponse);
      }
      
      setBookingComplete(true);
      setStep(3);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Le paiement ou la création de la réservation a échoué. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add function to handle PDF download
  const handleDownloadTicket = async () => {
    if (!ticketRef.current || !createdBooking) return;
    
    try {
      const passengerName = createdBooking.tickets[0]?.passengerName || 'passenger';
      const fileName = formatTicketFileName(bookingNumber, passengerName);
      await generateTicketPDF('ticket-pdf', fileName);
    } catch (error) {
      console.error('Failed to download ticket:', error);
    }
  };
  
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-red-500 text-xl mb-4">Erreur</div>
              <p className="text-gray-700 mb-6">{error}</p>
              <Link href="/flights">
                <Button size="lg">
                  Retour à la recherche de vols
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!flight) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Réservation de vol
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Complétez vos informations pour finaliser votre réservation
            </p>
          </div>
          
          {/* Progress steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  <FiUser />
                </div>
                <p className="mt-2 text-sm font-medium">Passager</p>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  <FiCreditCard />
                </div>
                <p className="mt-2 text-sm font-medium">Paiement</p>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  <FiCheck />
                </div>
                <p className="mt-2 text-sm font-medium">Confirmation</p>
              </div>
            </div>
          </div>
          
          {/* Flight summary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-primary-600 text-white p-4">
              <h2 className="font-bold text-lg">Détails du vol</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <RiFlightTakeoffLine className="text-primary-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">
                      {flight.departureCity} → {flight.arrivalCity}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Vol {flight.flightNumber} • {flight.airline.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {flight.price.toLocaleString()} MRU
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Départ</p>
                    <p className="text-lg font-semibold">{formatTime(flight.departureTime)}</p>
                    <p className="text-sm">{flight.departureCity} ({flight.departureAirportCode})</p>
                    <p className="text-xs text-gray-500">{formatDate(flight.departureTime)}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="w-full h-0.5 bg-gray-300 relative">
                      <div className="absolute left-0 right-0 -top-3 flex justify-center">
                        <RiFlightTakeoffLine className="text-primary-600" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Arrivée</p>
                    <p className="text-lg font-semibold">{formatTime(flight.arrivalTime)}</p>
                    <p className="text-sm">{flight.arrivalCity} ({flight.arrivalAirportCode})</p>
                    <p className="text-xs text-gray-500">{formatDate(flight.arrivalTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 1: Passenger Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Informations sur le passager
              </h2>
              
              <form onSubmit={handlePassengerSubmit(handlePassengerFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        {...registerPassenger('fullName')}
                        className={`pl-10 block w-full rounded-md border ${
                          passengerErrors.fullName ? 'border-red-500' : 'border-gray-300'
                        } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        placeholder="Nom complet du passager"
                      />
                    </div>
                    {passengerErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{passengerErrors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        {...registerPassenger('dateOfBirth')}
                        className={`pl-10 block w-full rounded-md border ${
                          passengerErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      />
                    </div>
                    {passengerErrors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{passengerErrors.dateOfBirth.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        {...registerPassenger('email')}
                        className={`pl-10 block w-full rounded-md border ${
                          passengerErrors.email ? 'border-red-500' : 'border-gray-300'
                        } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        placeholder="Email du passager"
                        defaultValue={user?.email || ''}
                      />
                    </div>
                    {passengerErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{passengerErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        {...registerPassenger('phoneNumber')}
                        className={`pl-10 block w-full rounded-md border ${
                          passengerErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        placeholder="Numéro de téléphone"
                      />
                    </div>
                    {passengerErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{passengerErrors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations de voyage
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationalité
                      </label>
                      <input
                        type="text"
                        {...registerPassenger('nationality')}
                        className={`block w-full rounded-md border ${
                          passengerErrors.nationality ? 'border-red-500' : 'border-gray-300'
                        } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        placeholder="Nationalité"
                      />
                      {passengerErrors.nationality && (
                        <p className="mt-1 text-sm text-red-600">{passengerErrors.nationality.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de passeport
                      </label>
                      <input
                        type="text"
                        {...registerPassenger('passportNumber')}
                        className={`block w-full rounded-md border ${
                          passengerErrors.passportNumber ? 'border-red-500' : 'border-gray-300'
                        } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        placeholder="Numéro de passeport"
                      />
                      {passengerErrors.passportNumber && (
                        <p className="mt-1 text-sm text-red-600">{passengerErrors.passportNumber.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'expiration du passeport
                      </label>
                      <input
                        type="date"
                        {...registerPassenger('passportExpiry')}
                        className={`block w-full rounded-md border ${
                          passengerErrors.passportExpiry ? 'border-red-500' : 'border-gray-300'
                        } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      />
                      {passengerErrors.passportExpiry && (
                        <p className="mt-1 text-sm text-red-600">{passengerErrors.passportExpiry.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Link href="/flights">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="mr-4"
                    >
                      <FiChevronLeft className="mr-2" /> Annuler
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!passengerIsValid}
                  >
                    Suivant <FiChevronRight className="ml-2" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
          
          {/* Step 2: Payment Information */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informations de paiement
              </h2>
              
              {/* Add dev mode toggle - only shown in development */}
              {IS_DEV && (
                <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Mode développeur</h3>
                      <p className="text-xs text-gray-500">
                        Activez pour pré-remplir les champs avec des données de test
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox" 
                        className="sr-only peer"
                        checked={devMode}
                        onChange={() => setDevMode(!devMode)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  {devMode && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs text-yellow-800 font-medium">
                            Les champs seront pré-remplis avec des données de test. En mode production, cette option n'est pas disponible.
                          </p>
                          <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside ml-1">
                            <li>Numéro de carte: 4111 1111 1111 1111</li>
                            <li>Nom: TEST USER</li>
                            <li>Date d'expiration: 12/25</li>
                            <li>CVV: 123</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <form onSubmit={handlePaymentSubmit(handlePaymentFormSubmit)} className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Détails de la carte
                  </h3>
                  <p className="text-sm text-gray-600">
                    Entrez vos informations bancaires pour effectuer le paiement sécurisé
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de carte
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...registerPayment('cardNumber')}
                      className={`pl-10 block w-full rounded-md border ${
                        paymentErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                    />
                  </div>
                  {paymentErrors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{paymentErrors.cardNumber.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    {...registerPayment('cardHolder')}
                    className={`block w-full rounded-md border ${
                      paymentErrors.cardHolder ? 'border-red-500' : 'border-gray-300'
                    } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                    placeholder="NOM PRÉNOM"
                  />
                  {paymentErrors.cardHolder && (
                    <p className="mt-1 text-sm text-red-600">{paymentErrors.cardHolder.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      {...registerPayment('expiryDate')}
                      className={`block w-full rounded-md border ${
                        paymentErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                      } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {paymentErrors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{paymentErrors.expiryDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code de sécurité (CVV)
                    </label>
                    <input
                      type="password"
                      {...registerPayment('cvv')}
                      className={`block w-full rounded-md border ${
                        paymentErrors.cvv ? 'border-red-500' : 'border-gray-300'
                      } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      placeholder="123"
                      maxLength={4}
                    />
                    {paymentErrors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{paymentErrors.cvv.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Résumé de la réservation
                    </h3>
                    
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Vol</span>
                      <span className="font-semibold">{flight.flightNumber}</span>
                    </div>
                    
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Trajet</span>
                      <span className="font-semibold">{flight.departureCity} → {flight.arrivalCity}</span>
                    </div>
                    
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Date</span>
                      <span className="font-semibold">{formatDate(flight.departureTime)}</span>
                    </div>
                    
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Passagers</span>
                      <span className="font-semibold">1</span>
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t border-gray-200 mt-2">
                      <span className="text-gray-800 font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary-600">{formatPrice(flight.price)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={prevStep}
                  >
                    <FiChevronLeft className="mr-2" /> Retour
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={loading}
                    disabled={(!paymentIsValid && !devMode) || loading}
                    className={devMode ? "bg-gradient-to-r from-primary-600 to-blue-500" : ""}
                  >
                    {devMode ? (
                      <>
                        <span className="mr-2">🛠️</span>
                        Payer (Mode Test)
                      </>
                    ) : (
                      <>Confirmer et payer</>
                    )}
                  </Button>
                </div>
                
                {/* Add validation status indicator */}
                {devMode && !paymentIsValid && (
                  <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    <p>
                      <strong>Note:</strong> Le bouton est activé en mode test, même si la validation échoue.
                      En production, tous les champs doivent être correctement remplis.
                    </p>
                  </div>
                )}
              </form>
            </motion.div>
          )}
          
          {/* Step 3: Confirmation */}
          {step === 3 && bookingComplete && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-8 text-center"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <FiCheck className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Réservation confirmée
                {devMode && <span className="text-xs ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">TEST</span>}
              </h2>
              <p className="text-gray-600 mb-8">
                Votre réservation a été confirmée. Téléchargez votre billet en cliquant sur le bouton ci-dessous.
                {devMode && (
                  <span className="block mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    <strong>Mode test actif:</strong> Dans un environnement de production, un vrai paiement aurait été traité.
                  </span>
                )}
              </p>
              
              {/* Ticket section that will be converted to PDF */}
              <div id="ticket-pdf" ref={ticketRef} className="bg-white border-2 border-gray-200 p-6 rounded-lg mb-8 max-w-md mx-auto text-left">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">RimBest Airways</h3>
                    <p className="text-sm text-gray-500">Billet électronique</p>
                  </div>
                  <div className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {createdBooking?.tickets[0]?.status || 'CONFIRMÉ'}
                  </div>
                </div>
                
                <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">N° RÉSERVATION</span>
                    <span className="text-xs text-gray-500">DATE D'ÉMISSION</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">{bookingNumber}</span>
                    <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                  </div>
                </div>
                
                <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">PASSAGER</p>
                    <p className="font-bold">{createdBooking?.tickets[0]?.passengerName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">VOL</p>
                      <p className="font-bold">{flight.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SIÈGE</p>
                      <p className="font-bold">{createdBooking?.tickets[0]?.seatNumber || '--'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">DÉPART</p>
                      <p className="font-bold">{flight.departureCity}</p>
                      <p className="text-sm font-medium">{flight.departureAirportCode}</p>
                      <p className="text-sm">{formatDate(flight.departureTime)}</p>
                      <p className="text-sm font-medium">{formatTime(flight.departureTime)}</p>
                    </div>
                    
                    <div className="flex items-center px-2">
                      <RiFlightTakeoffLine className="text-primary-600 text-xl" />
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">ARRIVÉE</p>
                      <p className="font-bold">{flight.arrivalCity}</p>
                      <p className="text-sm font-medium">{flight.arrivalAirportCode}</p>
                      <p className="text-sm">{formatDate(flight.arrivalTime)}</p>
                      <p className="text-sm font-medium">{formatTime(flight.arrivalTime)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-dashed border-gray-300 pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Prix total</span>
                    <span className="text-lg font-bold">{formatPrice(flight.price)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg"
                  onClick={handleDownloadTicket}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FiDownload className="mr-2" /> Télécharger le billet
                </Button>
                
                <Link href="/bookings">
                  <Button size="lg">
                    Voir mes réservations
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline" size="lg">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
} 