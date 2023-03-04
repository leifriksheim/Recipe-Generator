import { useState } from "react";
import { Data } from "../types";
import ingredients from "./data/ingredients";
import Select, { MultiValue } from "react-select";
import "./App.css";

async function fetchRecipe(data: Data) {
  const response = await fetch("/.netlify/functions/getRecipe", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (json.choices[0]) {
    return json.choices[0].text;
  } else {
    ("<h1>Try again</h1>");
  }
}

function App() {
  const [isLoading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<Data>({
    minutes: 30,
    numPeople: 1,
    type: "lunch",
    currency: "EUR",
    priceRange: {
      min: 0,
      max: 10,
    },
    ingredients: [],
  });

  const [recipe, setRecipe] = useState("");

  async function getRecipe() {
    try {
      setLoading(true);
      const res = await fetchRecipe(data);
      setRecipe(res);
    } catch (e) {
      setRecipe("Failed to fetch recipe");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      const alreadyExist = data.ingredients.find((i) => i.name === inputValue);

      if (alreadyExist) return;

      const newOption = inputValue
        ? [{ name: inputValue, required: true }]
        : [];

      setData({
        ...data,
        ingredients: [...data.ingredients, ...newOption],
      });

      setInputValue("");
    }
  }

  function handleChange(options: MultiValue<{ label: string; value: string }>) {
    setData({
      ...data,
      ingredients: options.map((o) => ({ name: o.label, required: true })),
    });
  }

  return (
    <div className="App">
      {!recipe && (
        <div className="start-page">
          <h1>Generate Recipes for Simple Meal Planning</h1>

          <div className="data-options">
            <Select
              placeholder="Add ingredients and press enter"
              inputValue={inputValue}
              value={data.ingredients.map((i) => ({
                value: i.name,
                label: i.name,
              }))}
              onInputChange={(val) => setInputValue(val)}
              isMulti
              options={ingredients}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              name="ingredients"
              className="select"
              classNamePrefix="select"
            />

            <p>How many people are you making food for?</p>

            <div className="people-options">
              {[...Array(5).keys()].map((num) => {
                return (
                  <button
                    data-active={num + 1 === data.numPeople}
                    key={num + 1}
                    onClick={() => setData({ ...data, numPeople: num + 1 })}
                  >
                    {num + 1}
                  </button>
                );
              })}
            </div>

            <p>How many minutes should it take?</p>

            <div className="people-options">
              {[...Array(6).keys()].map((num) => {
                const minutes = (num + 1) * 10;

                return (
                  <button
                    data-active={minutes === data.numPeople}
                    key={minutes * 5}
                    onClick={() => setData({ ...data, minutes })}
                  >
                    {minutes}
                  </button>
                );
              })}
            </div>

            <div className="price-range-options">
              <Select
                placeholder="Select price range"
                defaultValue={`${data.priceRange.min.toString()}-${data.priceRange.max.toString()}`}
                onChange={(option) => {
                  // @ts-ignore
                  console.log(parseInt(option?.value?.split("-")[0]));
                  setData({
                    ...data,
                    priceRange: {
                      // @ts-ignore
                      min: parseInt(option?.value?.split("-")[0] || "0"),
                      // @ts-ignore
                      max: parseInt(option?.value?.split("-")[1] || "10"),
                    },
                  });
                }}
                options={[
                  // @ts-ignore
                  { value: "0-10", label: "0-10" },
                  // @ts-ignore
                  { value: "10-20", label: "10-20" },
                  // @ts-ignore
                  { value: "20-30", label: "20-30" },
                  // @ts-ignore
                  { value: "30-40", label: "30-40" },
                  // @ts-ignore
                  { value: "40-50", label: "40-50" },
                  // @ts-ignore
                  { value: "50-80", label: "50-80" },
                ]}
                name="price-range"
                className="select"
                classNamePrefix="select"
              />
            </div>

            <Select
              placeholder="Select currency"
              value={data.currency}
              onChange={(val) => setData({ ...data, currency: val || "EUR" })}
              // @ts-ignore
              options={[{ value: "EUR", label: "EUR" }]}
              name="currency"
              className="select"
              classNamePrefix="select"
            />

            <button className="submit" onClick={getRecipe}>
              {isLoading ? "Generating Recipe..." : "Generate Recipe"}
            </button>
          </div>
        </div>
      )}

      {recipe && (
        <div className="response-page">
          <button className="back" onClick={() => setRecipe("")}>
            Try again
          </button>

          <div
            className="response"
            dangerouslySetInnerHTML={{ __html: recipe }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default App;
