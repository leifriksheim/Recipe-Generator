export type Style =
  | "any"
  | "italian"
  | "mediterranean"
  | "middle eastern"
  | "thai"
  | "chinese"
  | "asian"
  | "indian"
  | "european";

export type Type = "breakfast" | "lunch" | "dinner";

export type Difficulty = "easy" | "medium" | "advanced";

export type Ingredient = {
  name: string;
  required?: boolean;
};

export type Data = {
  numPeople: number;
  minutes: number;
  type: Type;
  style: Style;
  difficulty: Difficulty;
  ingredients: Ingredient[];
};
