import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    day: "",
    title: "",
    ingredients: "",
    instructions: "",
    imageUrl: ""
  });

  useEffect(() => {
    fetch(`http://localhost:2000/auth/recipe/${id}`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`
      }
    })
      .then(response => response.json())
      .then(data => setRecipe({
        ...data,
        ingredients: data.ingredients.join(', ') 
      }))
      .catch(error => console.error(error));
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setRecipe(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const updatedRecipe = {
      ...recipe,
      ingredients: recipe.ingredients.split(',').map(item => item.trim()) // Convert string back to array
    };
    fetch(`http://localhost:2000/auth/recipe/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`
      },
      body: JSON.stringify(updatedRecipe)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to update recipe");
        }
        return response.json();
      })
      .then(() => {
        toast.success("Recipe updated successfully");
        navigate("/recipes");
      })
      .catch(error => {
        toast.error("An error occurred while updating the recipe: " + error.message);
      });
  };

  return (
    <div className="EditRecipe">
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="day">Day</label>
          <input
            type="text"
            id="day"
            name="day"
            value={recipe.day}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="ingredients">Ingredients (comma separated)</label>
          <input
            type="text"
            id="ingredients"
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={recipe.imageUrl}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Recipe</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditRecipe;
