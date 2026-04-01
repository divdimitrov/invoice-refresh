import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ksdpfgxzduixjyjzyfzj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZHBmZ3h6ZHVpeGp5anp5ZnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTMyMTMsImV4cCI6MjA4OTg2OTIxM30.CwnVGrleC7k6QS0LOtYXJLfy5BhhjBLrabsGzAGdySw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
