import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dcentxfegdtkxefaajyz.supabase.co';
const SUPABASE_PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZW50eGZlZ2R0a3hlZmFhanl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzE5OTAsImV4cCI6MjA1ODcwNzk5MH0.-5GSdOWUiMAdiy-ZExkl9sZrpL4UAL0CMG0plRUh0iE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);