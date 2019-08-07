//A variable which hold details of all recipes.
var allRecipes;
//A variable which hold the current user selected recipe.
var currentRecipe = null;
//A variable which holds the user entered number in the Ingredients Calculator.
var forPeople;
//The directory where all of the images are stored.
var imageFolder = "assets/images/";

/*
 * This is the first function which is called when you load the page.
 * This function performs below steps:
 * 1. It fetches the HTML skeleton where the recipes will be rendered.
 * 2. Once the skeleton is rendered then it fetches the JSON hosted on assets/data/recipes.json URL so that actual recipes could be rendered.
 */
document.addEventListener("DOMContentLoaded", function() {
  //Fetch the HTML skeleton written in template/recipe-detail.html file and render it on the page.
  loadPageSection("template/recipe-detail.html", "#recipeDetail", function() {
    //Call "onClickcalculateIngredient" function everytime the user click on "Calculate" button in Ingredients Calculator.
    document.querySelector("#calculate-btn").addEventListener("click", onClickcalculateIngredient);
    //Fetch all recipes mentioned in "assets/data/recipes.json" file and render mini details for all of them 
    //on the left section of the page. By default render the content of the first recipe on the right section of the page.
    getRecipes();
  });
});

/*
 * This function performs below steps:
 * 1. It first fetches the HTML hosted at passed URL. The fetched HTML is basically the skeleton of the page.
 * 2. After rendering the content it executes the passed callback function.
 * 4. If there was any problem fetching the content hosted on the URL then it will log an error.
 */
function loadPageSection(url, selector, callback) {
  //Fetch the data stored at "template/recipe-detail.html" URL. 
  fetch(url)
    .then(function(response) {
      return response.text();
    })
    .then(function(jsonData) {
      console.log(jsonData)
      document.querySelector(selector).innerHTML = jsonData;
      callback();
    })
    .catch(function(error) {
      console.error(error);
    });
}

/*
 * This function performs below steps:
 * 1. Fetch the content hosted on assets/data/recipes.json URL
 * 2. Once the content is fetched successfully then fill the page with recipe content.
 * 3. If there was any problem fetching the content hosted on the URL then it will log an error.
 */
function getRecipes() {
  //Fetch the data stored at "assets/data/recipes.json" URL. 
  fetch("assets/data/recipes.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonData) {
      //Save all recipes in allRecipes variable so that we don't need to fetch it again and again.
      allRecipes = jsonData.recipes;
      //Render mini details all fetched recipes on the left side nav.
      fillSideNavMenu();
      //Render the content of the first recipe on the page.
      fillRecipeDetail();
    })
    .catch(function(error) {
      //Logs the error in case there was any error in fetching the data from "assets/data/recipes.json" file.
      console.error(error);
    });
}

/*
 * This function limits the description of the recipe to maximum 45 characters.
 * If the description exceeds that limit then additional characters will be replaced by "..."
 */
function limitRecipeDescription(description) {
  var length = 45;
  if (description.length > length) {
    return description.substring(0, length) + "...";
  }
  return description;
}

/*
 * This function constructs the left navigation panel of the page listing all available recipes. It also defines the
 * callback javascript function which will be called when the user click on a recipe.
 *
 * For each recipe defined in the assets/data/recipes.json file, it constructs:
 * 1. A card containing the thumbnail image, title, description and the number of people to calculate ingredients.
 * 2. The description of the card is restricted to 45 characters.
 */
function fillSideNavMenu() {
  var sideNavUl = document.querySelector("#recipes-nav");
  var html = "";

  //Render the left section of the page which contains mini details about all of the recipes
  Object.keys(allRecipes).forEach(function(recipeId) {
    html += `<li class="card recipeNav__item" target="${
      allRecipes[recipeId].id
    }" id="card-${allRecipes[recipeId].id}">
      <img src="assets/images/${
        allRecipes[recipeId].thumb_img
      }" alt="" class="card-thumb">
      <div class="card-content">
        <h2 class="card-title">${allRecipes[recipeId].title}</h2>
        <p class="card-description">${limitRecipeDescription(
          allRecipes[recipeId].description
        )}</p>
      </div>
      <div class="card-footer">
        <small>${allRecipes[recipeId].for_people} people</small>
      </div>
    </li>`;
  });
  sideNavUl.innerHTML = html;

  document.querySelectorAll(".recipeNav__item").forEach(function(element) {
    //On click of any of the recipe, change the recipe content on the right side of the page.
    element.addEventListener("click", function() {
      onRecipeClick(element);
    });
  });
}

/*
 * This function returns the full image of the recipe if it's available else it returns the thumbnail
 * All images are stored in assets/images/ directory
 */
function getRecipeFullImage(recipe) {
  if (recipe.full_img) {
    return imageFolder + recipe.full_img;
  }
  return imageFolder + recipe.thumb_img;
}

/*
 * This function returns ingredient quantity, name and unit for entered number of people in Ingredients Calculator.
 * The ingredient quantity is calculated by formula:
 * (Default quantity * target number of people)/default number of people
 *
 * If the user has not entered any number in Ingredients Calculator then it displays ingredients quantity, name
 * and unit as mentioned in recipes.json file.
 */
function getIngredientItem(recipePeopleNumber, ingredient, targetPeople = 0) {
  if (targetPeople && targetPeople != 0) {
    var calculatedQuantity =
      (ingredient.quantity * targetPeople) / recipePeopleNumber;
    return (
      calculatedQuantity.toFixed(2) +
      " " +
      ingredient.unit +
      " " +
      ingredient.name
    );
  }
  return ingredient.quantity + " " + ingredient.unit + " " + ingredient.name;
}

/*
 * This function returns the HTML list of recipe ingredients as per the user entered value in the Ingredients calculator. 
 * If the user has not entered any value then it displays the ingredients as per recipes.json file.
 */
function listRecipeIngredients(recipe) {
  var recipeIngredients = recipe.ingredients;
  var recipeForPeople = recipe.for_people;

  var html = "";
  recipeIngredients.forEach(function(ingredient) {
    html += `<li> ${getIngredientItem(
      recipeForPeople,
      ingredient,
      forPeople
    )}</li>`;
  });
  return html;
}

/*
 * This functions sorts the instructionson the basis of attribute value.
 */
function sortInstructions(instructions) {
  instructions.sort(function(a, b) {
    var orderA = a.order;
    var orderB = b.order;
    if (orderA < orderB) {
      return -1;
    }
    if (orderA > orderB) {
      return 1;
    }
    return 0;
  });
}

/*
 * This function returns the HTML list of recipe preparation instructions in the ascending order 
 * as mentioned in the recipes.json file.
 */
function listRecipeInstruction(recipeInstructions) {
  var html = "";
  sortInstructions(recipeInstructions);
  recipeInstructions.forEach(function(instruction) {
    html += `<li>${instruction.description}</li>`;
  });
  return html;
}

/*
 * This function returns the value entered in the Ingredients Calculator by the user.
 */
function getRecipePeople() {
  if (forPeople && !isNaN(forPeople) && forPeople > 0) {
    return forPeople;
  }
  return currentRecipe.for_people;
}

/*
 * This function is called whenever the user selects any recipe from the left nav and renders the recipe content
 * on the page.
 */
function onRecipeClick(recipeCard) {
  forPeople = 0;
  currentRecipe = allRecipes[recipeCard.getAttribute("target")];
  fillRecipeDetail();
}

/*
 * This is the main function which renders the recipe content on the page. The recipe content has 6 main fields:
 * 1. Recipe title.
 * 2. Recipe full image.
 * 3. Recipe description.
 * 4. Recipe for people.
 * 5. Recipe ingredients list.
 * 6. Recipe instructions list.
 *
 * This function performs below steps:
 * 1. Checks whether the user has already selected any recipe or not.
 *    1.1 If no, then choose first recipe defined in recipes.json file as default selected recipe.
 * 2. Highlights the user selected recipe by adding CSS class card--active on the recipe.
 * 3. Render all fields mentioned above on the page.
 */
function fillRecipeDetail() {
  if (currentRecipe == null) {
    currentRecipe = allRecipes[Object.keys(allRecipes)[0]];
  }

  var activeRecipe = document.querySelector(".card--active");
  if (activeRecipe) {
    activeRecipe.classList.remove("card--active");
  }

  //Highlight the user selected recipe.
  newActiveRecipe = document.querySelector("#card-" + currentRecipe.id);
  newActiveRecipe.classList.add("card--active");

  //Renders the right side section of the page with recipe content.
  document.querySelector("#recipeTitle").innerHTML = `${currentRecipe.title}`;
  document.querySelector("#recipeFullImage").setAttribute("src", getRecipeFullImage(currentRecipe));
  document.querySelector("#recipeDescriptionText").innerHTML =currentRecipe.description;
  document.querySelector("#recipeForPeople").innerHTML = getRecipePeople();
  document.querySelector("#recipeIngredientLists").innerHTML = listRecipeIngredients(currentRecipe);
  document.querySelector("#listRecipeIngredients").innerHTML = listRecipeInstruction(currentRecipe.instructions);
}

/*
 * This function is triggered on the click of "Calculate" button which is to recalculate the 
 * ingredients for entered number of people.
 *
 * This function performs below steps:
 * 1. It first fetches the value user has entered in the Ingredients Calculator.
 * 2. Then it validates the user input by checking:
 *    2.1 Whether the entered value is not blank.
 *    2.2 Whether the entered value is not a number.
 *    2.3 Whether the entered value is not 0.
 * 3. Finally it repopulates the recipe details on the page so that revised ingredients can be seen.
 */
function onClickcalculateIngredient() {
  var forPeopleInput = document.querySelector("#for-people-input").value;

  if (forPeopleInput == "" && isNaN(forPeople) && forPeopleInput == 0) {
    alert("Please enter a valid number.");
  } else {
    forPeople = forPeopleInput;
  }

  fillRecipeDetail();
}
