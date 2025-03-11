import { useForm, UseFormProps, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

export function useZodForm<TSchema extends ZodSchema<any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<any>, 'resolver'>
) {
  return useForm({
    ...options,
    resolver: zodResolver(schema),
  });
} 