// lib/supabase.ts - Base configuration for App Router
import { createBrowserClient } from '@supabase/ssr'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client (for browser/components)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Export environment variables for server-side usage
export { supabaseUrl, supabaseAnonKey }