import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const RecipeContext = createContext();
export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");



  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Fetch recipes from the database using axios
        const dbResponse = await axios.get('http://localhost:5000/api/recipes');
        const dbRecipes = dbResponse.data; // Access the data property
  
        // Fetch recipes from the local JSON file
        const response = await fetch('/recipe.json');
        const localRecipes = await response.json();
  
        // Combine both datasets and update state
        setRecipes([...localRecipes, ...dbRecipes]);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
  
    fetchRecipes();
  }, []);
  
  // filtering recipes
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <RecipeContext.Provider
      value={{ recipes,setRecipes,filteredRecipes, searchQuery, setSearchQuery}}
    >
      {children}
    </RecipeContext.Provider>
  );
};
