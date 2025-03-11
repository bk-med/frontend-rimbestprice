'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getAllAirlines, createAirline, updateAirline, deleteAirline } from '@/lib/api/airlines';
import type { Airline } from '@/lib/api/airlines';
import { toast } from 'react-hot-toast';
import { 
  Trash2, 
  Edit, 
  Search,
  Plus,
  X,
  Image
} from 'lucide-react';

type AirlineFormData = Omit<Airline, 'id'>;

const initialFormData: AirlineFormData = {
  name: '',
  iataCode: '',
  logoUrl: ''
};

export default function AirlinesManagement() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [filteredAirlines, setFilteredAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AirlineFormData>(initialFormData);

  useEffect(() => {
    fetchAirlines();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAirlines(airlines);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredAirlines(
        airlines.filter(
          (airline) =>
            airline.name.toLowerCase().includes(lowercasedSearch) ||
            airline.iataCode.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, airlines]);

  const fetchAirlines = async () => {
    try {
      setLoading(true);
      const data = await getAllAirlines();
      setAirlines(data);
      setFilteredAirlines(data);
    } catch (error: any) {
      console.error('Error fetching airlines:', error);
      toast.error('Failed to load airlines');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // Get the ID from the current airline being edited
        const airlineId = (airlines.find(a => a.iataCode === formData.iataCode))?.id;
        if (!airlineId) {
          toast.error('Airline ID not found');
          return;
        }
        
        const updatedAirline = await updateAirline(airlineId, formData);
        setAirlines(airlines.map(airline => airline.id === airlineId ? updatedAirline : airline));
        toast.success('Airline updated successfully');
      } else {
        const newAirline = await createAirline(formData);
        setAirlines([...airlines, newAirline]);
        toast.success('Airline created successfully');
      }
      
      resetForm();
    } catch (error: any) {
      console.error('Error saving airline:', error);
      toast.error(error.response?.data?.message || 'Failed to save airline');
    }
  };

  const handleDeleteAirline = async (airlineId: number) => {
    if (!confirm('Are you sure you want to delete this airline?')) return;

    try {
      await deleteAirline(airlineId);
      setAirlines(airlines.filter(airline => airline.id !== airlineId));
      toast.success('Airline deleted successfully');
    } catch (error: any) {
      console.error('Error deleting airline:', error);
      toast.error('Failed to delete airline');
    }
  };

  const openEditModal = (airline: Airline) => {
    setFormData({
      name: airline.name,
      iataCode: airline.iataCode,
      logoUrl: airline.logoUrl
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
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Compagnies Aériennes</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des compagnies..."
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
            Ajouter une compagnie
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code IATA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAirlines.map((airline) => (
                <tr key={airline.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {airline.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {airline.logoUrl ? (
                      <img
                        src={airline.logoUrl}
                        alt={`${airline.name} logo`}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {airline.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {airline.iataCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(airline)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAirline(airline.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAirlines.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune compagnie trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Airline Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {isEditing ? 'Modifier la compagnie' : 'Ajouter une nouvelle compagnie'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la compagnie
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code IATA
                </label>
                <input
                  type="text"
                  name="iataCode"
                  required
                  maxLength={3}
                  value={formData.iataCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Code de compagnie aérienne de 2-3 caractères (ex: AA, BA, UAE)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du logo
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL de l'image du logo de la compagnie
                </p>
              </div>
              
              {formData.logoUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Aperçu du logo:</p>
                  <div className="border border-gray-200 rounded-md p-2 flex justify-center">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                </div>
              )}
              
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