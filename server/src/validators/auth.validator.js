import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address (e.g. name@example.com)')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});
