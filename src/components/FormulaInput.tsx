"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import useFormulaStore from "@/store/formulaStore";
import { fetchSuggestions, Suggestion } from "@/api/fetchSuggestion";

const OPERATORS = new Set(["+", "-", "*", "/", "(", ")", "^"]);

const FormulaInput: React.FC = () => {
    const { formula, setFormula } = useFormulaStore();
    const [inputValue, setInputValue] = useState<string>("");
    const [queryValue, setQueryValue] = useState<string>("")
    const [tokens, setTokens] = useState<(string | Suggestion)[]>([]);
    const [result, setResult] = useState<number | null>(null);
    const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    // Fetch autocomplete suggestions
    const { data: suggestions, refetch } = useQuery<Suggestion[]>({
        queryKey: ["autocomplete", queryValue],
        queryFn: () => fetchSuggestions(queryValue),
        enabled: false, // Initially disable auto-fetching
    });

    useEffect(() => {
        if (inputValue.length > 0) {
            let newQuery = removeLeadingOperators(inputValue);
            setQueryValue(newQuery);
        }
    }, [inputValue]);
    
    useEffect(() => {
        if (queryValue.length > 0) {
            refetch();
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }
    }, [queryValue, refetch]);

    useEffect(() => {
        console.log("TOKENS",tokens)
        if (tokens.length > 0) {
            try {
                let expression = tokens
                    .map((token: Suggestion | string) =>
                        typeof token === "string" ? token : token.value
                    )
                    .join("");
                
                console.log("Expression for evaluation",expression)
                const evaluatedResult = eval(expression);
                console.log(evaluatedResult)
                setResult(evaluatedResult);
            } catch (error) {
                console.error("Invalid Expression", error);
                setResult(null);
            }
        }
    }, [tokens]);


    const removeLeadingOperators = (str: string): string => {
        return str.replace(/^[+\-*/()^\d\s]+/, ""); // Removes leading operators, numbers, and spaces
    };

    const mergeNumbers = (arr: string[]): string[] => {
        const result: string[] = [];
        let buffer = ""; // Stores consecutive numbers

        for (const item of arr) {
            if (/^\d+$/.test(item)) {
                // If it's a number, append to buffer
                buffer += item;
            } else {
                // If an operator is encountered, push the buffer if not empty
                if (buffer) {
                    result.push(buffer); // Store merged number
                    buffer = ""; // Reset buffer
                }
                result.push(item); // Store operator
            }
        }

        // Push any remaining number in buffer
        if (buffer) result.push(buffer);

        return result;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setFormula(value);
    };

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key in OPERATORS) {
            const newTokens: (string | Suggestion)[] = [];
            let buffer = "";

            for (const char of inputValue) {
                if (OPERATORS.has(char)) {
                    if (buffer) {
                        newTokens.push(buffer);
                        buffer = "";
                    }
                    newTokens.push(char);
                } else {
                    buffer += char;
                }
            }
            if (buffer) newTokens.push(buffer);
            let input = newTokens.join(" ");

            setTokens((prevTokens) => [...prevTokens, input]);
            setInputValue("");
        };
    }

    const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && tokens.length > 0) {
            if (inputValue.length == 0) { setTokens(tokens.slice(0, -1)) };
        }
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        let buffer = []
        for (const char of inputValue) {
            if (OPERATORS.has(char) || !isNaN(parseFloat(char.toString()))) {
                buffer.push(char.toString())
            }
        }
        let mergedBuffer = mergeNumbers(buffer);
        setTokens([...tokens, ...mergedBuffer, suggestion]);
        setInputValue("");
        setIsDropdownOpen(false);
    };

    const handleEvaluate = () => {
        let buffer: string[] = [];
        for (const char of inputValue) {
            if (OPERATORS.has(char) || !isNaN(parseFloat(char.toString()))) {
                buffer.push(char.toString());
            }
        }

        let mergedBuffer = mergeNumbers(buffer);

        // Update tokens and inputValue before evaluating
        setTokens((prevTokens) => [...prevTokens, ...mergedBuffer]);
        setInputValue("");
    };

    const handleTokenClick = (index: number) => {
        setActiveTokenIndex(index === activeTokenIndex ? null : index);
    };

    const handleTokenSelect = (optionName: string, data: Suggestion) => {
      
      
        // Replace only tokens that are of type Suggestion
        const updatedTokens = tokens.map(token =>
            typeof token === "object" && "name" in token && token.name === optionName ? data : token
        );
    
        setTokens(updatedTokens);
        setActiveTokenIndex(null);
    };
    
    return (
        <div className="p-4 border flex rounded-lg gap-4 shadow-md w-full max-w-3xl relative">
            {/* Formual Section */}
            <div className="flex flex-col flex-1">
                <div className="text-sm pb-3">Formula</div>
                <div className="flex items-center flex-wrap gap-0 p-2 border rounded-md bg-white min-h-[40px]">
                    {tokens.map((token, index) =>
                        typeof token === "string" ? (
                            <span key={index} className="px-1 py-1 rounded-md">
                                {token}
                            </span>
                        ) : (
                            <span key={index} className="px-2 py-2 bg-blue-500/10 text-sm text-blue-600 font-semibold  rounded-full cursor-pointer"
                                onClick={() => handleTokenClick(index)}
                            >
                                {token.name}
                                {activeTokenIndex === index && (
                                    <ul className="absolute  mt-2 w-40 border bg-white shadow-lg rounded-lg">
                                        {[{category:"category 1",id:"1a",name:"suggestion 1",value:9}, {category:"category 1",id:"1b",name:"suggestion 2",value:20}, {category:"category 1",id:"1c",name:"suggestion 3",value:9}].map((option) => (
                                            <li
                                                key={option.id}
                                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                                onClick={() => handleTokenSelect(token.name,option)}
                                            >
                                                {option.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </span>
                        )
                    )}
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            handleBackspace(e);
                            handleEnter(e);
                        }}
                        placeholder="Enter formula..."
                        className="flex-1 border-none focus:border-0 focus:ring-0 focus:outline-none focus-visible:ring-0"
                    />

                </div>
            </div>
            <div className="flex flex-col gap-2 ">
                <div>Result</div>
                <div className="flex items-center justify-center flex-wrap gap-1 p-2 border rounded-md bg-white min-h-[55px] min-w-[75px]">{result != null ? result: "Invalid"}</div>
            </div>




            {/* Show dropdown only if there are valid suggestions */}
            {isDropdownOpen && suggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 mt-24 w-full border bg-white shadow-lg rounded-lg">
                    {suggestions.map((suggestion: Suggestion) => (
                        <li
                            key={suggestion.id}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)} // Clicking sets input value
                        >
                            {suggestion.name} ({suggestion.category}) - {suggestion.value}
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={handleEvaluate} className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md min-h-[55px] self-end">
                Calculate
            </button>
        </div>
    );
};

export default FormulaInput;
