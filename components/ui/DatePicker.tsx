import { forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onChange: (date: Date | null) => void;
  selected: Date | null;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  disabled?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    label, 
    error, 
    fullWidth = false, 
    onChange, 
    selected, 
    minDate, 
    maxDate, 
    placeholderText = 'Select date', 
    disabled = false 
  }, ref) => {
    const baseInputClasses = 'rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50';
    const errorInputClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const fullWidthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`${fullWidthClass} react-datepicker-wrapper`}>
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText={placeholderText}
          disabled={disabled}
          className={`${baseInputClasses} ${errorInputClasses} ${fullWidthClass}`}
          wrapperClassName="w-full"
          dateFormat="MMMM d, yyyy"
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
); 