import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kvovlheerwnwbeomonxv.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3ZsaGVlcndud2Jlb21vbnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NjA4ODMsImV4cCI6MjA0NjUzNjg4M30.mHFBj4nOE2Qwyr498tjVRmBzelQnaYnn10DIqr2uArI'; // Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
