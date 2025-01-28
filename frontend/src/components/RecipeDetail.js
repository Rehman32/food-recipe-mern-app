import { useContext } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { Link,  useParams } from "react-router-dom";

export default function RecipeDetails() {
  const { id } = useParams();
  const { recipes } = useContext(RecipeContext);
  //find recipe by recipe id
  const recipe = recipes.find((recipe) => recipe.id === parseInt(id));
  //if no recipe found
  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
        <Link
          to="/recipes"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Back to Recipes
        </Link>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8 px-4  text-justify">
      <div>
      {/* Back  Button */}
      <Link
        to="/recipes"
        className="inline-block mb-6 text-blue-500 hover:underline font-bold "
      >
        &larr; Back to Recipes
      </Link>
      </div>
      {/* Recipe Detail */}
      <div className="bg-white shadow overflow-hidden rounded">
        {/* recipe image */}
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-64 object-contain "
        />
        {/* recipe info */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{recipe.name}</h1>
          <p className="text-gray-800 text-lg mb-2">
            <span className="font-bold">Catagory : </span>
            {recipe.category}
          </p>
          <p className="text-gray-600 mb-6">{recipe.description}</p>
          {/* ingredients */}
          <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
          <ul className="list-disc list-inside mb-6">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          {/* Steps */}
          <h2 className="text-2xl font-bold mb-4">Steps</h2>
          <ol className="list-decimal list-inside">
            {recipe.steps.map((step,index)=>(
                <li key={index} className="mb-2">
                    {step}
                </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
