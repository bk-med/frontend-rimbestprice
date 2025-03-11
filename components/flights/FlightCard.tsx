'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flight } from '@/lib/api/flights';
import { formatDate, formatTime, formatPrice, formatDuration } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { FiClock, FiCalendar, FiMap, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Image from 'next/image';
import { RiFlightTakeoffLine } from 'react-icons/ri';

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
}

export const FlightCard = ({ flight, onSelect }: FlightCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Airline info */}
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 mr-4 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
              {!imageError && flight.airline.logoUrl ? (
                <img 
                  src={flight.airline.logoUrl} 
                  alt={flight.airline.name} 
                  className="w-10 h-10 object-contain"
                  onError={handleImageError}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600">
                  <span className="text-lg font-bold">{flight.airline.iataCode}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{flight.airline.name}</h3>
              <p className="text-sm text-gray-500">Vol {flight.flightNumber}</p>
            </div>
          </div>
          
          {/* Price */}
          <div className="flex flex-col items-end">
            <p className="text-2xl font-bold text-primary-600">{formatPrice(flight.price)}</p>
            <p className="text-sm text-gray-500">{flight.availableSeats} places restantes</p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
          {/* Departure */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-xs text-gray-500 mb-1">Départ</p>
            <p className="text-xl font-semibold">{formatTime(flight.departureTime)}</p>
            <p className="text-sm text-gray-700">{flight.departureCity} ({flight.departureAirportCode})</p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <FiCalendar className="mr-1" /> {formatDate(flight.departureTime)}
            </div>
          </div>
          
          {/* Flight duration */}
          <div className="flex flex-col items-center my-4 md:my-0">
            <div className="text-xs text-gray-500 mb-1">
              <FiClock className="inline mr-1" /> {formatDuration(flight.departureTime, flight.arrivalTime)}
            </div>
            <div className="relative w-24 md:w-32 h-0.5 bg-gray-300 my-2">
              <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-primary-600"></div>
              <RiFlightTakeoffLine className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-primary-600" />
              <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-primary-600"></div>
            </div>
            <div className="text-xs text-gray-500">Direct</div>
          </div>
          
          {/* Arrival */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-500 mb-1">Arrivée</p>
            <p className="text-xl font-semibold">{formatTime(flight.arrivalTime)}</p>
            <p className="text-sm text-gray-700">{flight.arrivalCity} ({flight.arrivalAirportCode})</p>
            <div className="flex items-center justify-center md:justify-end text-xs text-gray-500 mt-1">
              <FiCalendar className="mr-1" /> {formatDate(flight.arrivalTime)}
            </div>
          </div>
        </div>
        
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <h4 className="font-medium text-gray-900 mb-2">Détails du Vol</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-500">Compagnie aérienne:</span> {flight.airline.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-500">Numéro de vol:</span> {flight.flightNumber}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-500">Avion:</span> Boeing 737
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-500">Classe:</span> Économique
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-500">Bagage:</span> 23kg
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-500">À bord:</span> Repas inclus
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="mt-6 flex justify-between items-center">
          <button 
            onClick={toggleExpanded}
            className="flex items-center text-primary-600 text-sm font-medium hover:underline"
          >
            {expanded ? (
              <>
                <FiChevronUp className="mr-1" /> Masquer les détails
              </>
            ) : (
              <>
                <FiChevronDown className="mr-1" /> Voir les détails
              </>
            )}
          </button>
          
          <Button onClick={() => onSelect(flight)}>
            Réserver
          </Button>
        </div>
      </div>
    </motion.div>
  );
}; 