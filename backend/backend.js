const supabaseUrl = "https://oeuieksflauztarkxvsk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldWlla3NmbGF1enRhcmt4dnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDgxMjAsImV4cCI6MjA2ODgyNDEyMH0.RrgmHluBL_jpYv0tRs2XMM7fAtuFD7w1RmmH6E-if9c";
  
export const client = supabase.createClient(supabaseUrl, supabaseKey);