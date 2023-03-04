// @ts-ignore
import process from "process";
import { Data, Ingredient } from "../../types";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function generateIngredientPrompt(ingredients: Ingredient[]) {
  return `
  The recipe should include the following ingredients: ${ingredients
    .map((i) => (i.required ? i.name : i.name + " (optional)"))
    .join(", ")}.`;
}

function generatePromt(data: Data): string {
  return `
  
  Hi ChatGPT, I have some data for a recipe that I'd like you to generate. 

  I want to make ${data.type}.

  The recipe should be for ${data.numPeople} people.

  The recipe should be ${data.style} style.

  The recipe should take around ${data.minutes} minutes to make.

  The recipe should be of difficulty "${data.difficulty}"

  ${data.ingredients.length ? generateIngredientPrompt(data.ingredients) : ""}
  
  Respond only like this:

  <h1>Recipe title<h1>

  <h2>Ingredients</h2>
  <ul><li>Quantity and ingredient</li></ul>

  <h2>Steps</h2>
  <ol><li>Ingredient step</li><ol>
  `;
}

const handler: any = async (event, context) => {
  const data: Data = JSON.parse(event.body);

  const prompt = generatePromt(data);

  console.log("prompt", prompt);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 500,
    temperature: 0,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response.data),
  };
};

export { handler };
