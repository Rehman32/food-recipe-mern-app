import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        setError("Recipe not found");
      }
    };

    fetchRecipe();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!recipe) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{recipe.name}</h1>
      <p className="mb-4"><strong>Category:</strong> {recipe.category}</p>
      <p className="mb-4"><strong>Description:</strong> {recipe.description}</p>
      <img src={recipe.image} alt={recipe.name} className="mb-4" />
      <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
      <ul className="list-disc list-inside mb-4">
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-bold mb-4">Steps</h2>
      <ol className="list-decimal list-inside">
        {recipe.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
