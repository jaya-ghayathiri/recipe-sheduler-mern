import React, { useEffect, useState } from "react";
import "../styles/RecipeStyle.css";
import { Link, NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  

  useEffect(() => {
    getRecipes();
  }, []);

  const getRecipes = () => {
    fetch("http://localhost:2000/auth/recipe", {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch recipe data");
        }
        return response.json();
      })
      .then((data) => {
        // Initialize the isFavorite property for each recipe
        const recipesWithFavorites = data.map(recipe => ({ ...recipe, isFavorite: false }));
        setRecipes(recipesWithFavorites);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await fetch(
        `http://localhost:2000/auth/recipe/${recipeId}`,
        {
          method: "DELETE",
        }
      );
      toast.success("Recipe deleted successfully");
      getRecipes();
    } catch (error) {
      toast.error(
        "An error occurred while deleting the recipe:" + error.message
      );

      setTimeout(() => {
        window.location.href = "/recipes";
      }, 3000);
    }
  };

  // const handleFavorite = async (recipeId) => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:2000/auth/favorite/${recipeId}`,
  //       {
  //         method: "POST",
  //       }
  //     );
  //     const result = await response.json();

  //     if (response.ok) {
  //       // Update the favorite status locally
  //       setRecipes(prevRecipes =>
  //         prevRecipes.map(recipe =>
  //           recipe._id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
  //         )
  //       );
  //     } else {
  //       console.error(result.error);
  //     }
  //   } catch (error) {
  //     console.error("Error toggling favorite:", error);
  //   }
  // };
  const handleFavorite = async (recipeId) => {
    try {
      const response = await fetch(`http://localhost:2000/auth/likedRecipes/${recipeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
  
      if (response.ok) {
        toast.success("Recipe added to favorites successfully");
        setRecipes(prevRecipes =>
          prevRecipes.map(recipe =>
            recipe._id === recipeId ? { ...recipe, isFavorite: true } : recipe
          )
        );
      } else {
        const data = await response.json();
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error adding recipe to favorites:", error);
      toast.error("An error occurred while adding recipe to favorites");
    }
  };
  
  const SearchRecipes = async (e) => {
    try {
      if (e.target.value) {
        const searchQuery = encodeURIComponent(e.target.value);
        const searchedRecipes = await fetch(
          `http://localhost:2000/auth/searchRecipes/${searchQuery}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );

        if (searchedRecipes.ok) {
          const data = await searchedRecipes.json();
          setRecipes(data);
        } else {
          const data = await searchedRecipes.json();
          toast.error(data.error);
        }
      } else {
        getRecipes();
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="Recipes">
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search recipes by day"
          onChange={(e) => SearchRecipes(e)}
        />
      </div>

      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe._id} className="Recipe">
            <h2>{recipe.title}</h2>
            <img src={recipe.imageUrl} alt={recipe.title} />
            <h3>Ingredients:</h3>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
            <div className="instructions-container">
              <h3>Instructions:</h3>
              <ol>
                {recipe.instructions.split("\n").map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="button-container">
              <NavLink to={`/editRecipe/${recipe._id}`} className="edit-button">
                Edit
              </NavLink>
              <button
                className="delete-button"
                onClick={() => handleDeleteRecipe(recipe._id)}
              >
                Delete
              </button>
              <button
                className="favorite-button"
                onClick={() => handleFavorite(recipe._id)}
              >
                {recipe.isFavorite ? "Unfavorite" : "Favorite"}
              </button>
            </div>
            <Link to={"/addRecipe"} className="add-recipe-link">
              Add more recipes
            </Link>
          </div>
        ))
      ) : (
        <h2 className="no-recipes">No Recipes Found</h2>
      )}

      <ToastContainer />
    </div>
  );
};

export default Recipes;
