import { useState, useRef } from "react";
import { Data, Ingredient } from "../types";
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
    try {
      stopStream.current = false;

      setLoading(true);

      const response = await fetch("/getRecipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setLoading(false);

      console.log(response);

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
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  function addIngredient(value: string) {
    const alreadyExist = data.ingredients.find((i) => i.name === value);

    if (alreadyExist) return;

    const newOption = value ? [{ name: value, required: true }] : [];

    setData((oldData) => ({
      ...oldData,
      ingredients: [...oldData.ingredients, ...newOption],
    }));
  }

  function handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      const value = inputValue.split(",");

      value.forEach(addIngredient);

      setInputValue("");
    }
  }

  function handleAddButtonClick() {
    const value = inputValue.split(",");
    value.forEach(addIngredient);
    setInputValue("");
    document.querySelector("input")?.focus();
  }

  function removeIngredient(ingredient: Ingredient) {
    const removedIngredients = data.ingredients.filter(
      (i) => i.name !== ingredient.name
    );

    setData({ ...data, ingredients: removedIngredients });
  }

  function onTryAgain() {
    stopStream.current = true;
    setRecipe("");
  }

  return (
    <div className="App">
      {!recipe && (
        <div className="start-page">
          <div className="intro">
            <h1 className="title">FlavourTown</h1>
            <p className="tagline">
              A small AI helper to generate recipes on the fly
            </p>
          </div>

          <div className="data-options">
            <div className="data-option">
              <label className="label" htmlFor="ingredients">
                Write an ingredient and press enter:
              </label>
              <div className="input-wrapper">
                <input
                  name="ingredients"
                  className="input"
                  placeholder="Potatoes, bananas, milk...."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                ></input>
                <button
                  onClick={handleAddButtonClick}
                  disabled={!inputValue}
                  className="input-button"
                >
                  Add
                </button>
              </div>
              {!!data.ingredients.length && (
                <div className="tab-options">
                  {data.ingredients.map((ingredient) => (
                    <div key={ingredient.name} className="tag">
                      {ingredient.name}
                      <button
                        onClick={() => removeIngredient(ingredient)}
                        className="tag-remove"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="data-option">
              <p className="label">What type of food do you want?</p>

              <div className="tab-options">
                {styles.map((style) => {
                  return (
                    <button
                      className="tab"
                      data-active={style === data.style}
                      key={style}
                      onClick={() => setData({ ...data, style: style })}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="data-option">
              <p className="label">What type of meal is this?</p>

              <div className="tab-options">
                <button
                  className="tab"
                  data-active={data.type === "breakfast"}
                  onClick={() => setData({ ...data, type: "breakfast" })}
                >
                  Breakfast
                </button>
                <button
                  className="tab"
                  data-active={data.type === "lunch"}
                  onClick={() => setData({ ...data, type: "lunch" })}
                >
                  Lunch
                </button>
                <button
                  className="tab"
                  data-active={data.type === "dinner"}
                  onClick={() => setData({ ...data, type: "dinner" })}
                >
                  Dinner
                </button>
              </div>
            </div>

            <div className="data-option">
              <p className="label">How many people are you making food for?</p>

              <div className="tab-options">
                {[...Array(5).keys()].map((num) => {
                  return (
                    <button
                      className="tab"
                      data-active={num + 1 === data.numPeople}
                      key={num + 1}
                      onClick={() => setData({ ...data, numPeople: num + 1 })}
                    >
                      {num + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="data-option">
              <p className="label">How many minutes should it take?</p>

              <div className="tab-options">
                {[...Array(6).keys()].map((num) => {
                  const minutes = (num + 1) * 10;

                  return (
                    <button
                      className="tab"
                      data-active={minutes === data.minutes}
                      key={minutes * 5}
                      onClick={() => setData({ ...data, minutes })}
                    >
                      {minutes}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="data-option">
              <p className="label">How difficult should it be?</p>

              <div className="tab-options">
                <button
                  className="tab"
                  data-active={data.difficulty === "easy"}
                  onClick={() => setData({ ...data, difficulty: "easy" })}
                >
                  Easy
                </button>
                <button
                  className="tab"
                  data-active={data.difficulty === "medium"}
                  onClick={() => setData({ ...data, difficulty: "medium" })}
                >
                  Medium
                </button>
                <button
                  className="tab"
                  data-active={data.difficulty === "advanced"}
                  onClick={() => setData({ ...data, difficulty: "advanced" })}
                >
                  Advanced
                </button>
              </div>
            </div>
          </div>

          <button disabled={isLoading} className="submit" onClick={getRecipe}>
            {isLoading ? "Generating Recipe..." : "Generate Recipe"}
          </button>
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
