import { z } from 'zod';

export const updateProfileSchema = z.object({
  education: z.string().trim().max(255, 'Education cannot exceed 255 characters').optional().default(''),
  degree: z.string().trim().max(255, 'Degree cannot exceed 255 characters').optional().default(''),
  skills: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : val),
      z.array(z.string().trim())
    )
    .optional()
    .default([]),
  interests: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : val),
      z.array(z.string().trim())
    )
    .optional()
    .default([]),
  experience_level: z
    .string()
    .trim()
    .optional()
    .default('Beginner'),
  target_career: z.string().trim().max(255, 'Target career cannot exceed 255 characters').optional().default(''),
  career_goals: z.string().trim().max(2000, 'Career goals cannot exceed 2000 characters').optional().default(''),
  learning_preferences: z.string().trim().max(100, 'Learning preference cannot exceed 100 characters').optional().default('Hands-on projects'),
  weekly_study_hours: z.coerce
    .number({ invalid_type_error: 'Weekly study hours must be a valid number' })
    .int('Weekly study hours must be a whole number')
    .min(1, 'Weekly study hours must be at least 1 hour')
    .max(100, 'Weekly study hours cannot exceed 100 hours')
    .optional()
    .default(10),
});
