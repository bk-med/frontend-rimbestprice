'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useZodForm } from '@/lib/hooks/useZodForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Common cities for demo
const popularCities = [
  { value: '', label: 'Ville' },
  { value: 'Nouakchott', label: 'Nouakchott' },
  { value: 'Casablanca', label: 'Casablanca' },
  { value: 'Dakar', label: 'Dakar' },
  { value: 'Paris', label: 'Paris' },
  { value: 'Dubai', label: 'Dubaï' },
  { value: 'Doha', label: 'Doha' },
  { value: 'Cairo', label: 'Le Caire' },
];

const searchSchema = z.object({
  departureCity: z.string().min(1, 'Veuillez sélectionner une ville de départ'),
  arrivalCity: z.string().min(1, 'Veuillez sélectionner une ville d\'arrivée'),
  departureDate: z.date().optional(),
  returnDate: z.date().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface FlightSearchFormProps {
  compact?: boolean;
  initialValues?: {
    departureCity?: string;
    arrivalCity?: string;
    departureDate?: Date;
    returnDate?: Date;
  };
  onSearch?: () => void;
}

export const FlightSearchForm = ({ 
  compact = false, 
  initialValues = {}, 
  onSearch
}: FlightSearchFormProps) => {
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useZodForm(searchSchema, {
    defaultValues: {
      departureCity: initialValues.departureCity || '',
      arrivalCity: initialValues.arrivalCity || '',
    },
  });

  // Set initial dates if provided
  useEffect(() => {
    if (initialValues.departureDate) {
      setValue('departureDate', initialValues.departureDate);
    }
    if (initialValues.returnDate) {
      setValue('returnDate', initialValues.returnDate);
      setIsRoundTrip(true);
    }
  }, [initialValues, setValue]);

  const departureDate = watch('departureDate');
  const returnDate = watch('returnDate');
  
  const onSubmit = (data: SearchFormValues) => {
    // Format data for the query parameters
    const queryParams = new URLSearchParams();
    queryParams.set('departureCity', data.departureCity);
    queryParams.set('arrivalCity', data.arrivalCity);
    if (data.departureDate) {
      queryParams.set('departureDate', data.departureDate.toISOString().split('T')[0]);
    }
    if (isRoundTrip && data.returnDate) {
      queryParams.set('returnDate', data.returnDate.toISOString().split('T')[0]);
    }
    
    // Call the onSearch callback if provided
    if (onSearch) {
      // If onSearch is provided, call it first before navigation
      // This allows parent components to set their local state
      onSearch();
      
      // Then navigate - we'll use replace to avoid building up history
      router.replace(`/flights?${queryParams.toString()}`);
    } else {
      // Otherwise navigate to search page normally
      router.push(`/flights?${queryParams.toString()}`);
    }
  };

  return (
    <div className={`rounded-lg bg-white ${!compact ? 'shadow-lg p-6 md:p-8' : ''}`}>
      {!compact && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Trouvez Votre Vol</h2>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-full ${!isRoundTrip ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setIsRoundTrip(false)}
            >
              Aller simple
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full ${isRoundTrip ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setIsRoundTrip(true)}
            >
              Aller-retour
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-${compact ? '4' : '6'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              <FiMapPin className="text-gray-400" />
            </div>
            <Select
              label="De"
              fullWidth
              options={popularCities}
              error={errors.departureCity?.message}
              {...register('departureCity')}
            />
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              <FiMapPin className="text-gray-400" />
            </div>
            <Select
              label="À"
              fullWidth
              options={popularCities}
              error={errors.arrivalCity?.message}
              {...register('arrivalCity')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              <FiCalendar className="text-gray-400" />
            </div>
            <div className="w-full">
              <DatePicker
                label="Date de départ"
                selected={departureDate}
                onChange={(date) => setValue('departureDate', date as Date)}
                fullWidth
                minDate={new Date()}
                placeholderText="Date (optionnel)"
                error={errors.departureDate?.message}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              <FiCalendar className="text-gray-400" />
            </div>
            <div className="w-full">
              <DatePicker
                label="Date de retour"
                selected={returnDate}
                onChange={(date) => setValue('returnDate', date as Date)}
                fullWidth
                minDate={departureDate || new Date()}
                disabled={!isRoundTrip}
                placeholderText="Date (optionnel)"
                error={errors.returnDate?.message}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="flex items-center md:justify-end">
            <Button
              type="submit"
              size="lg"
              fullWidth
              className={`${compact ? '' : 'mt-0'}`}
              isLoading={isSubmitting}
            >
              <FiArrowRight className="mr-2" /> Rechercher
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 