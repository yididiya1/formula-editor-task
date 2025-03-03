import { create } from "zustand";
import { Suggestion } from "@/api/fetchSuggestion";

interface FormulaState {
    inputValue: string;
    queryValue: string;
    tokens: (string | Suggestion)[];
    result: number | null;
    isDropdownOpen: boolean;
    setInputValue: (value: string) => void;
    setQueryValue: (value: string) => void;
    setTokens: (tokens: (string | Suggestion)[]) => void;
    setResult: (result: number | null) => void;
    setIsDropdownOpen: (isOpen: boolean) => void;
}

const useFormulaStore = create<FormulaState>((set) => ({
    inputValue: "",
    queryValue: "",
    tokens: [],
    result: null,
    isDropdownOpen: false,

    setInputValue: (value) => set({ inputValue: value }),
    setQueryValue: (value) => set({ queryValue: value }),
    setTokens: (tokens) => set({ tokens }),
    setResult: (result) => set({ result }),
    setIsDropdownOpen: (isOpen) => set({ isDropdownOpen: isOpen }),
}));

export default useFormulaStore;
