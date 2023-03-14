export type Cusine =
  | "Any"
  | "American"
  | "Italian"
  | "Asian"
  | "Mexican"
  | "Southern"
  | "French"
  | "Southwestern"
  | "Barbecue"
  | "Indian"
  | "Chinese"
  | "Cajun"
  | "Mediterranean"
  | "Greek"
  | "English"
  | "Spanish"
  | "Thai"
  | "German"
  | "Moroccan"
  | "Irish"
  | "Japanese"
  | "Cuban"
  | "Hawaiian"
  | "Swedish"
  | "Hungarian"
  | "Portuguese";

export type Course =
  | "Any"
  | "Dinner"
  | "Dessert"
  | "Side Dish"
  | "Lunch"
  | "Appetizer"
  | "Salad"
  | "Breakfast"
  | "Brunch"
  | "Soup"
  | "Beverage"
  | "Condiments and Sauces"
  | "Cocktail";

export type Restriction =
  | "None"
  | "Vegetarian"
  | "Vegan"
  | "Gluten free"
  | "Lactose free"
  | "Dairy free"
  | "Low carb"
  | "Keto";

export type Allergy = "Wheat" | "Nuts" | "Fish and shellfish" | "Eggs" | "Soy";

export type Difficulty = "Easy" | "Medium" | "Advanced";

export type Ingredient = {
  name: string;
  required?: boolean;
};

export type Data = {
  numPeople: number;
  minutes: number;
  course: Course;
  restriction: Restriction;
  cusine: Cusine;
  difficulty: Difficulty;
  ingredients: Ingredient[];
};
