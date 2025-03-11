'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getAllFlights, createFlight, updateFlight, deleteFlight, checkFlightHasBookings } from '@/lib/api/flights';
import { getAllAirlines } from '@/lib/api/airlines';
import type { Flight } from '@/lib/api/flights';
import type { Airline } from '@/lib/api/airlines';
import { toast } from 'react-hot-toast';
import { 
  Trash2, 
  Edit, 
  Search,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';

type FlightFormData = Omit<Flight, 'id'>;

const initialFormData: FlightFormData = {
  flightNumber: '',
  departureCity: '',
  arrivalCity: '',
  departureAirportCode: '',
  arrivalAirportCode: '',
  departureTime: '',
  arrivalTime: '',
  price: 0,
  availableSeats: 0,
  airline: {
    id: 0,
    name: '',
    iataCode: '',
    logoUrl: ''
  }
};

const formatDateTimeForInput = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr) return '';
  
  try {
    const date = new Date(dateTimeStr);
    // Check if the date is valid
    if (isNaN(date.getTime())) return '';
    
    // Format to ISO and slice to get YYYY-MM-DDThh:mm format needed for datetime-local input
    return date.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export default function FlightsManagement() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FlightFormData>(initialFormData);
  const [editingFlightId, setEditingFlightId] = useState<number | null>(null);

  useEffect(() => {
    fetchFlightsAndAirlines();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFlights(flights);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredFlights(
        flights.filter(
          (flight) =>
            flight.flightNumber.toLowerCase().includes(lowercasedSearch) ||
            flight.departureCity.toLowerCase().includes(lowercasedSearch) ||
            flight.arrivalCity.toLowerCase().includes(lowercasedSearch) ||
            flight.airline.name.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, flights]);

  const fetchFlightsAndAirlines = async () => {
    try {
      setLoading(true);
      const [flightsData, airlinesData] = await Promise.all([
        getAllFlights(),
        getAllAirlines()
      ]);
      
      setFlights(flightsData);
      setFilteredFlights(flightsData);
      setAirlines(airlinesData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Échec de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'airlineId') {
      const selectedAirline = airlines.find(airline => airline.id === Number(value));
      if (selectedAirline) {
        setFormData({
          ...formData,
          airline: selectedAirline
        });
      }
    } else if (name === 'price' || name === 'availableSeats') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else if (name === 'departureTime' || name === 'arrivalTime') {
      // Handle datetime-local inputs
      // The value will be in format YYYY-MM-DDThh:mm
      setFormData({
        ...formData,
        [name]: value ? new Date(value).toISOString() : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate that both dates are valid
      if (!formData.departureTime || !formData.arrivalTime) {
        toast.error('Les dates de départ et d\'arrivée sont requises');
        return;
      }
      
      // Make a copy of the form data to avoid modifying the state directly
      const flightData = { ...formData };
      
      if (isEditing) {
        // Use the stored flight ID
        if (!editingFlightId) {
          toast.error('Impossible de mettre à jour le vol. ID manquant.');
          return;
        }
        
        const updatedFlight = await updateFlight(editingFlightId, flightData);
        setFlights(flights.map(flight => flight.id === editingFlightId ? updatedFlight : flight));
        toast.success('Vol mis à jour avec succès');
      } else {
        const newFlight = await createFlight(flightData);
        setFlights([...flights, newFlight]);
        toast.success('Vol créé avec succès');
      }
      
      resetForm();
    } catch (error: any) {
      console.error('Error saving flight:', error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          toast.error('Données de vol invalides. Veuillez vérifier tous les champs.');
        } else if (status === 401 || status === 403) {
          toast.error('Vous n\'avez pas les droits nécessaires pour effectuer cette action');
        } else {
          toast.error(error.response.data?.message || 'Échec de l\'enregistrement du vol');
        }
      } else {
        toast.error('Échec de l\'enregistrement du vol');
      }
    }
  };

  const handleDeleteFlight = async (flightId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) return;

    try {
      await deleteFlight(flightId);
      setFlights(flights.filter(flight => flight.id !== flightId));
      toast.success('Vol supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting flight:', error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 400 || status === 409) {
          toast.error('Ce vol ne peut pas être supprimé car il a des réservations associées');
        } else if (status === 401 || status === 403) {
          toast.error('Vous n\'avez pas les droits nécessaires pour effectuer cette action');
        } else {
          toast.error('Échec de la suppression du vol');
        }
      } else {
        toast.error('Échec de la suppression du vol');
      }
    }
  };

  const openEditModal = (flight: Flight) => {
    setEditingFlightId(flight.id);
    setFormData({
      flightNumber: flight.flightNumber || '',
      departureCity: flight.departureCity || '',
      arrivalCity: flight.arrivalCity || '',
      departureAirportCode: flight.departureAirportCode || '',
      arrivalAirportCode: flight.arrivalAirportCode || '',
      departureTime: flight.departureTime || '',
      arrivalTime: flight.arrivalTime || '',
      price: flight.price || 0,
      availableSeats: flight.availableSeats || 0,
      airline: flight.airline || initialFormData.airline
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setShowModal(false);
    setIsEditing(false);
    setEditingFlightId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Vols</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des vols..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-1" />
            Ajouter un vol
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° de Vol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compagnie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itinéraire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Départ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrivée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sièges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFlights.map((flight) => (
                <tr key={flight.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {flight.flightNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {flight.airline.logoUrl && (
                        <img
                          src={flight.airline.logoUrl}
                          alt={flight.airline.name}
                          className="h-8 w-8 mr-2 object-contain"
                        />
                      )}
                      <span className="text-sm text-gray-900">{flight.airline.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flight.departureCity} ({flight.departureAirportCode}) → {flight.arrivalCity} ({flight.arrivalAirportCode})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(flight.departureTime).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })} {new Date(flight.departureTime).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(flight.arrivalTime).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })} {new Date(flight.arrivalTime).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flight.price} MRU
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flight.availableSeats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(flight)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteFlight(flight.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFlights.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun vol trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flight Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {isEditing ? 'Modifier le vol' : 'Ajouter un nouveau vol'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de vol
                  </label>
                  <input
                    type="text"
                    name="flightNumber"
                    required
                    value={formData.flightNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compagnie
                  </label>
                  <select
                    name="airlineId"
                    required
                    value={formData.airline.id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Sélectionner une compagnie</option>
                    {airlines.map(airline => (
                      <option key={airline.id} value={airline.id}>
                        {airline.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville de départ
                  </label>
                  <input
                    type="text"
                    name="departureCity"
                    required
                    value={formData.departureCity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville d'arrivée
                  </label>
                  <input
                    type="text"
                    name="arrivalCity"
                    required
                    value={formData.arrivalCity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code aéroport de départ
                  </label>
                  <input
                    type="text"
                    name="departureAirportCode"
                    required
                    value={formData.departureAirportCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code aéroport d'arrivée
                  </label>
                  <input
                    type="text"
                    name="arrivalAirportCode"
                    required
                    value={formData.arrivalAirportCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de départ
                  </label>
                  <input
                    type="datetime-local"
                    name="departureTime"
                    required
                    value={formatDateTimeForInput(formData.departureTime)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure d'arrivée
                  </label>
                  <input
                    type="datetime-local"
                    name="arrivalTime"
                    required
                    value={formatDateTimeForInput(formData.arrivalTime)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (MRU)
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sièges disponibles
                  </label>
                  <input
                    type="number"
                    name="availableSeats"
                    required
                    min="0"
                    value={formData.availableSeats}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isEditing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 