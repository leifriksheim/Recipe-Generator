export type Data = {
  numPeople: number;
  minutes: number;
  type: "breakfast" | "lunch" | "dinner";
  priceRange: {
    min: number;
    max: number;
  };
  currency: string;
  ingredients: Ingredient[];
};

export type Ingredient = {
  name: string;
  required?: boolean;
};
