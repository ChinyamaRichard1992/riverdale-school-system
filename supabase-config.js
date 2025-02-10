import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://nxulydgpckeblhpqhhgv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dWx5ZGdwY2tlYmxocHFoaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMDkzNjQsImV4cCI6MjA1NDY4NTM2NH0.Rf0sNsfnTE0eG4oo4_h-fNw_Gfp3pK33jnE9rFj6mkI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
