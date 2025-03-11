'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { FlightSearchForm } from '@/components/flights/FlightSearchForm';
import { FlightCard } from '@/components/flights/FlightCard';
import { Button } from '@/components/ui/Button';
import { Flight, getAllFlights, searchFlightsGet } from '@/lib/api/flights';
import { FiArrowLeft, FiList, FiFilter, FiRefreshCw, FiSliders } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react';

export default function FlightsPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <FlightsContent />
    </Suspense>
  );
}

function FlightsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'price' | 'time' | 'destination'>('time');
  const [showAllFlights, setShowAllFlights] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 5;
  
  const departureCity = searchParams.get('departureCity') || '';
  const arrivalCity = searchParams.get('arrivalCity') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate') || '';
  
  // Load all flights once when component mounts
  useEffect(() => {
    fetchAllFlights();
  }, []);
  
  // Apply search filters when URL parameters or filter values change
  useEffect(() => {
    if (allFlights.length > 0) {
      // Reset to first page when search criteria change
      setCurrentPage(1);
      // We check if there are search parameters to decide if we should show filtered results
      setShowAllFlights(!(departureCity && arrivalCity));
    }
  }, [departureCity, arrivalCity, departureDate, returnDate, allFlights]);
  
  const fetchAllFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      const flightsData = await getAllFlights();
      setAllFlights(flightsData);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des vols:', err);
      if (err.response && err.response.status === 401) {
        setError('Accès non autorisé. Certains endpoints nécessitent peut-être une authentification.');
      } else {
        setError('Impossible de récupérer les vols. Veuillez réessayer ou contacter l\'administrateur.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectFlight = (flight: Flight) => {
    // Navigate to booking page with flight details
    const queryParams = new URLSearchParams();
    queryParams.set('flightId', flight.id.toString());
    
    router.push(`/bookings/new?${queryParams.toString()}`);
  };
  
  const handleSearch = () => {
    // This is now only used to toggle the display mode - actual filtering is done in filteredFlights
    setShowAllFlights(false);
  };
  
  const handleShowAllFlights = () => {
    setShowAllFlights(true);
    router.push('/flights');
  };
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchAllFlights();
  };
  
  // Filter flights based on search criteria
  const filteredFlights = allFlights.filter(flight => {
    // Always apply price filter
    const matchesPrice = flight.price >= priceRange[0] && flight.price <= priceRange[1];
    if (!matchesPrice) return false;
    
    // If showing all flights, only apply price filter
    if (showAllFlights) {
      return true;
    }
    
    // Filter by departure and arrival cities
    const matchesCities = 
      flight.departureCity.toLowerCase() === departureCity.toLowerCase() && 
      flight.arrivalCity.toLowerCase() === arrivalCity.toLowerCase();
    
    if (!matchesCities) return false;
    
    // Filter by departure date if provided
    if (departureDate) {
      const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
      if (flightDate !== departureDate) return false;
    }
    
    return true;
  });
  
  // Sort flights based on selected option
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortOption === 'price') {
      return a.price - b.price;
    } else if (sortOption === 'destination') {
      return a.arrivalCity.localeCompare(b.arrivalCity);
    } else {
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    }
  });
  
  // Get current flights for pagination
  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlights = sortedFlights.slice(indexOfFirstFlight, indexOfLastFlight);
  const totalPages = Math.ceil(sortedFlights.length / flightsPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {!showAllFlights ? 'Résultats de Recherche' : 'Tous les Vols Disponibles'}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {!showAllFlights 
                ? `Vols de ${departureCity} à ${arrivalCity}` 
                : 'Explorez tous nos vols et trouvez votre prochaine destination'}
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar with search and filters */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="font-bold text-xl mb-4">Vols</h2>
                <FlightSearchForm 
                  compact={true} 
                  onSearch={handleSearch} 
                  initialValues={{
                    departureCity,
                    arrivalCity,
                    departureDate: departureDate ? new Date(departureDate) : undefined,
                    returnDate: returnDate ? new Date(returnDate) : undefined,
                  }}
                />
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={handleShowAllFlights}
                    className="mt-2"
                  >
                    <FiList className="mr-2" /> Voir tous les vols
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-xl">Filtres</h2>
                  <FiSliders className="text-gray-500" />
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">Trier par</h3>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-md ${sortOption === 'price' ? 'bg-white shadow-sm' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setSortOption('price')}
                    >
                      Prix
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-md ${sortOption === 'time' ? 'bg-white shadow-sm' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setSortOption('time')}
                    >
                      Heure
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-md ${sortOption === 'destination' ? 'bg-white shadow-sm' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setSortOption('destination')}
                    >
                      Destination
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">Fourchette de Prix (MRU)</h3>
                  <div className="mb-4">
                    <label className="text-xs text-gray-500">Prix minimum</label>
                    <input 
                      type="range" 
                      min="0" 
                      max={priceRange[1]}
                      step="1000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="text-xs text-gray-500">Prix maximum</label>
                    <input 
                      type="range" 
                      min={priceRange[0]} 
                      max="50000" 
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm bg-gray-100 p-2 rounded-md">
                    <span className="font-medium">{priceRange[0].toLocaleString()} MRU</span>
                    <span>-</span>
                    <span className="font-medium">{priceRange[1].toLocaleString()} MRU</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side with flight results */}
            <div className="w-full lg:w-2/3">
              {/* Flight count and status */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {loading ? 'Chargement des vols...' : error ? 'Erreur de recherche' : `${sortedFlights.length} vols trouvés`}
                </h2>
              </div>
              
              {/* Flights List */}
              <div className="space-y-4">
                {loading ? (
                  // Loading State
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <FiRefreshCw className="animate-spin h-8 w-8 mx-auto text-primary-600 mb-4" />
                    <p className="text-gray-600">Recherche des meilleures offres de vols...</p>
                  </div>
                ) : error ? (
                  // Error State
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={handleRetry}>Réessayer</Button>
                  </div>
                ) : sortedFlights.length === 0 ? (
                  // No Results
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600 mb-4">Aucun vol trouvé pour vos critères de recherche.</p>
                    <Button onClick={handleShowAllFlights}>Voir tous les vols disponibles</Button>
                  </div>
                ) : (
                  // Flight Results
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    {currentFlights.map((flight) => (
                      <FlightCard 
                        key={flight.id} 
                        flight={flight} 
                        onSelect={handleSelectFlight} 
                      />
                    ))}
                    
                    {/* Pagination */}
                    {sortedFlights.length > flightsPerPage && (
                      <div className="flex justify-center items-center space-x-2 mt-6 pb-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={prevPage}
                          disabled={currentPage === 1}
                        >
                          Précédent
                        </Button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              // Show first page, last page, current page, and pages around current page
                              return page === 1 || 
                                     page === totalPages || 
                                     Math.abs(currentPage - page) <= 1;
                            })
                            .map((page, index, array) => {
                              // Add ellipsis when there are gaps in the sequence
                              const showEllipsis = index > 0 && page - array[index - 1] > 1;
                              
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && (
                                    <span className="px-3 py-1">...</span>
                                  )}
                                  
                                  <button 
                                    onClick={() => paginate(page)}
                                    className={`px-3 py-1 rounded-md ${
                                      currentPage === page
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 