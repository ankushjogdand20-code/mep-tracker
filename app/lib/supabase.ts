import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pvfmkyebcjyryrajivfl.supabase.co";
const supabaseAnonKey =
  "sb_publishable_WnWTXJJMfqVK-7qWrKSMcA_Mq7w_kSC";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);