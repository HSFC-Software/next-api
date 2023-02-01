import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://bsnrwmmolcbhgncwogox.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbnJ3bW1vbGNiaGduY3dvZ294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQ3MzM1MTAsImV4cCI6MTk5MDMwOTUxMH0.Vgv78ZxFTJQ1Dl7pCn352dE_TfE_cveRLqEB7pa_w4s"
);
