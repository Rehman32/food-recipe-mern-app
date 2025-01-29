import { useContext, useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import { RecipeContext } from "../context/RecipeContext";
import SearchBar from "../components/searchbar";

export default function RecipeList() {
  const { filteredRecipes, searchQuery, setSearchQuery } =
    useContext(RecipeContext);

  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 9;

  // Reset current page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination logic
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipe = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <div className="flex justify-center">
        <SearchBar
          placeholder="Search recipe by name or category..."
          onChange={setSearchQuery}
          value={searchQuery}
        />
      </div> */}

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {currentRecipe.length > 0 ? (
          currentRecipe.map((recipe, index) => (
            <RecipeCard key={index} recipe={recipe} />
          ))
        ) : (
          <p className="text-2xl text-gray-800">No Recipes found</p>
        )}
      </div>
      {/* Pagination */}
      {filteredRecipes.length > recipesPerPage && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
