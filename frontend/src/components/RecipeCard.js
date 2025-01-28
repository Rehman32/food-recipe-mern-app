import { Link } from "react-router-dom";
export default function RecipeCard({ recipe }) {
  return (
    <div className="border rounded-md shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow">
      {/* card image */}
      <img
        src={recipe.image}
        alt={recipe.name}
        className="w-full h-48 object-cover"
      />
      {/* card info */}
      <div className="p-4 flex justify-between">
        <div>
          <h2 className="text-lg text-gray-800 font-semibold ">
            {recipe.name}
          </h2>
          <p className="text-gray-600 text-sm">{recipe.category}</p>
        </div>
        <div>
          <Link
            to={`/recipes/${recipe.id}`}
            className="bg-blue-500 rounded px-4 py-2 hover:bg-blue-600 text-white transition"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
}
