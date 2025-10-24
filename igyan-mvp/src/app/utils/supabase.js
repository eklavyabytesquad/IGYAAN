import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vfaoqkiwsjtnuukmrkel.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYW9xa2l3c2p0bnV1a21ya2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDE2NzUsImV4cCI6MjA3Njg3NzY3NX0.yAcVgYp8cCCIm7dlHYXbETVSbqciXbdSuJiZ6r_MLAs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
