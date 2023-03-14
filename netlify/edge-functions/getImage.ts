// @ts-ignore
import type { Context } from "https://edge.netlify.com/";

const API_KEY = Deno.env.get("OPENAI_API_KEY");

const handler = async (req: Request, context: Context) => {
  const data = await req.json();

  const options = {
    prompt: data.prompt,
    n: 1,
    size: "512x512",
  };

  const image = await getImage(options);

  return Response.json(image);
};

export default handler;

export const config = { path: "/getImage" };

async function getImage(payload) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.json();
}
