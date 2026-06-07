import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vtcbvpiqelwlfgdmhaff.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2J2cGlxZWx3bGZnZG1oYWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjA2NDMsImV4cCI6MjA5NjM5NjY0M30.i85Z41t_V1HTzTh_tJF2Z0EtmNQWtdFq5CjJd8GWpRA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)