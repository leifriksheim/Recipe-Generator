// @ts-ignore
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "https://esm.sh/eventsource-parser@0.1.0";
import type { Context } from "https://edge.netlify.com/";

const API_KEY = Deno.env.get("OPENAI_API_KEY");

function generateIngredientPrompt(ingredients) {
  return `
  Try to include these ingredients: ${ingredients
    .map((i) => (i.required ? i.name : i.name + " (optional)"))
    .join(", ")}.`;
}

function generatePromt(data): string {
  return `
  Hi ChatGPT, I have some data for a recipe that I'd like you to generate.
  
  Course: ${data.course}.
  Cusine: ${data.cusine}.
  Dietary restriction: ${data.restriction}.
  Amount of people: ${data.numPeople}.
  Cooking time: ${data.minutes}.
  Difficulty: ${data.difficulty}.
  ${data.ingredients?.length ? generateIngredientPrompt(data.ingredients) : ""}

  Use a name of a real dish.
  
  Respond only like this:

  <h1>Dish</h1>

  <div class="ingredients">
    <h2>Ingredients:</h2>
    <ul><li>Quantity and ingredient</li></ul>
  </div>

  <div class="steps">
    <h2>Instructions:</h2>
    <ol><li>Instruction step</li><ol>
  </div>
  `;
}

const handler = async (req: Request, context: Context): Promise<Response> => {
  const data = await req.json();

  const stream = await OpenAIStream({
    model: "gpt-4",
    prompt: generatePromt(data),
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
    stream: true,
    n: 1,
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};

export default handler;

export const config = { path: "/getRecipe" };

async function OpenAIStream(payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log(API_KEY);

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text;
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
