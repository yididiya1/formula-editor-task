'use client'

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FormulaInput from "@/components/FormulaInput";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex justify-center items-center h-screen">
        <FormulaInput />
      </div>
    </QueryClientProvider>
  );
}

export default App;
