
import { useContext } from "react";
import SearchBar from "../components/searchbar";
import RecipeCard from "../components/RecipeCard";

import { RecipeContext } from "../context/RecipeContext";

export default function Home() {
  const { filteredRecipes, searchQuery, setSearchQuery } =
    useContext(RecipeContext);

  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      <div className=" absolute inset-0 flex border p-3 bg-white">
        {/* Image 1 */}

        <div
          className="w-1/3 h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('https://i.ibb.co/41t6W2P/bg-5.jpg')",
          }}
        ></div>

        {/* Image 2 */}
        <div
          className="w-1/3 h-full bg-cover bg-center rounded-l-lg"
          style={{
            backgroundImage: "url('https://i.ibb.co/xmdjxw2/bg-6.jpg')",
          }}
        ></div>
        {/* Image 3*/}
        <div
          className="w-1/3 h-full bg-cover bg-center rounded-r-lg"
          style={{
            backgroundImage: "url('https://i.ibb.co/QbP3cSC/Gulab-Jaman.jpg')",
          }}
        ></div>
      </div>

      {/* Optional Overlay */}
      <div className="absolute  bg-black inset-0 bg-opacity-40"></div>

      {/* content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center text-white px-4 h-full">
        <h1 className=" text-4xl md:text-6xl mb-4 font-semi-bold shadow-lg">
          Discover The Best Recipes
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Find and make your favorite Recipes in one place
        </p>
        {/* searchbar */}
        <SearchBar
          placeholder="Search for recipes..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>
        {/* Filtered Results */}
        <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {searchQuery
            ? `Showing results for "${searchQuery}"`
            : "Popular Recipes"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <p className="text-gray-600">No recipes found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
