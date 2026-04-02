import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// export types for database
export type Categories = Database["public"]["Tables"]["categories"]["Row"];
export type Expenses = Database["public"]["Tables"]["expenses"]["Row"];
export type Incomes = Database["public"]["Tables"]["incomes"]["Row"];
export type Investments = Database["public"]["Tables"]["investments"]["Row"];
export type FamilyMembers = Database["public"]["Tables"]["family_members"]["Row"];

// export types for insert
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type IncomeInsert = Database["public"]["Tables"]["incomes"]["Insert"];
export type InvestmentInsert = Database["public"]["Tables"]["investments"]["Insert"];

// export types for update
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];
export type IncomeUpdate = Database["public"]["Tables"]["incomes"]["Update"];
export type InvestmentUpdate = Database["public"]["Tables"]["investments"]["Update"];