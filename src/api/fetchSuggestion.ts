export interface Suggestion {
    name: string;
    category: string;
    value: number | string;
    id: string;
}


export const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
    if (!query) return [];
    try {
        console.log("Fetching suggestions for query:", query);
        const response = await fetch(`https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete?name=${query}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const data: Suggestion[] = await response.json();

        // Ensure data is an array
        if (!Array.isArray(data)) {
            console.error("API returned a non-array response:", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return []; // Always return an empty array on error
    }
};
