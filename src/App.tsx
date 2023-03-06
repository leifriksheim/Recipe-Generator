import { useState, useRef } from "react";
import { Data } from "../types";
import ingredients from "./data/ingredients";
import Select, { MultiValue } from "react-select";
import "./App.css";
import styles from "./data/styles";

function App() {
  const stopStream = useRef(false);
  const [isLoading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<Data>({
    minutes: 30,
    numPeople: 1,
    type: "lunch",
    style: "any",
    difficulty: "easy",
    ingredients: [],
  });

  const [recipe, setRecipe] = useState("");

  async function getRecipe() {
    stopStream.current = false;

    const response = await fetch("/getRecipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const body = response.body;
    if (!body) {
      return;
    }
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      if (stopStream.current) {
        reader.cancel();
        done = true;
        setRecipe("");
      } else {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setRecipe((prev) => prev + chunkValue);
      }
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

  function onTryAgain() {
    stopStream.current = true;
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

            <p className="label">What type of food do you want?</p>

            <div className="tab-options">
              {styles.map((style) => {
                return (
                  <button
                    data-active={style === data.style}
                    key={style}
                    onClick={() => setData({ ...data, style: style })}
                  >
                    {style}
                  </button>
                );
              })}
            </div>

            <p className="label">What type of meal is this?</p>

            <div className="tab-options">
              <button
                data-active={data.type === "breakfast"}
                onClick={() => setData({ ...data, type: "breakfast" })}
              >
                Breakfast
              </button>
              <button
                data-active={data.type === "lunch"}
                onClick={() => setData({ ...data, type: "lunch" })}
              >
                Lunch
              </button>
              <button
                data-active={data.type === "dinner"}
                onClick={() => setData({ ...data, type: "dinner" })}
              >
                Dinner
              </button>
            </div>

            <p className="label">How many people are you making food for?</p>

            <div className="tab-options">
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

            <p className="label">How many minutes should it take?</p>

            <div className="tab-options">
              {[...Array(6).keys()].map((num) => {
                const minutes = (num + 1) * 10;

                return (
                  <button
                    data-active={minutes === data.minutes}
                    key={minutes * 5}
                    onClick={() => setData({ ...data, minutes })}
                  >
                    {minutes}
                  </button>
                );
              })}
            </div>

            <p className="label">How difficult should it be?</p>

            <div className="tab-options">
              <button
                data-active={data.difficulty === "easy"}
                onClick={() => setData({ ...data, difficulty: "easy" })}
              >
                Easy
              </button>
              <button
                data-active={data.difficulty === "medium"}
                onClick={() => setData({ ...data, difficulty: "medium" })}
              >
                Medium
              </button>
              <button
                data-active={data.difficulty === "advanced"}
                onClick={() => setData({ ...data, difficulty: "advanced" })}
              >
                Advanced
              </button>
            </div>

            <button disabled={isLoading} className="submit" onClick={getRecipe}>
              {isLoading ? "Generating Recipe..." : "Generate Recipe"}
            </button>
          </div>
        </div>
      )}

      {recipe && (
        <div className="response-page">
          <button className="back" onClick={onTryAgain}>
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
