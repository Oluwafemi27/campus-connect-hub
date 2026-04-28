import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jhtuvygyzvuyfybuyflu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodHV2eWd5enZ1eWZ5YnV5Zmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDU3MjYsImV4cCI6MjA5MjUyMTcyNn0.MUJeWXlq4RyhOzMp3j2DWLKZOuJwV5vjvKya-cYPy38";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = Record<string, any>;
