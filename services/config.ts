// Environment variables for the app
// For production, use a secure method to store these values

// OpenAI configuration
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

// Supabase configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Stability AI configuration
export const STABILITY_API_KEY = process.env.EXPO_PUBLIC_STABILITY_API_KEY || '';

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
] as const;

// Validate required environment variables
export const validateEnvVars = () => {
  const requiredVars = [
    { name: 'EXPO_PUBLIC_OPENAI_API_KEY', value: OPENAI_API_KEY },
    { name: 'EXPO_PUBLIC_SUPABASE_URL', value: SUPABASE_URL },
    { name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
    { name: 'EXPO_PUBLIC_STABILITY_API_KEY', value: STABILITY_API_KEY },
  ];

  const missingVars = requiredVars.filter(v => !v.value);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:',
      missingVars.map(v => v.name).join(', '));
    return false;
  }

  return true;
}; 