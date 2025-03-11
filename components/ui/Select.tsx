import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, fullWidth = false, ...props }, ref) => {
    const baseSelectClasses = 'rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50';
    const errorSelectClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const fullWidthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`${fullWidthClass}`}>
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`${baseSelectClasses} ${errorSelectClasses} ${fullWidthClass} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
); 