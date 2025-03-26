export const API_CONFIG = {
  // Make sure this URL is correct - it should be the base URL without the /holidaze part
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://v2.api.noroff.dev",
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || "1e6f8330-4fb4-4b34-99d6-42114caa3480",
};
console.log("API Configuration:", API_CONFIG);
