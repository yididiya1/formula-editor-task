'use client'

import { create } from "zustand";

// Define the state type
interface FormulaState {
  formula: string;
  setFormula: (newFormula: string) => void;
}

// Create the store with TypeScript support
const useFormulaStore = create<FormulaState>((set) => ({
  formula: "",
  setFormula: (newFormula: string) => set({ formula: newFormula }),
}));

export default useFormulaStore;
