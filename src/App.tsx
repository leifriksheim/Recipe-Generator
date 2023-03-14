import { useState, useRef } from "react";
import { Data, Ingredient } from "../types";
import Select from "react-select";
import "./App.css";
import cusines from "./data/cusines";
import courses from "./data/courses";
import restrictions from "./data/dietaryRestrictions";

function App() {
  const stopStream = useRef(false);
  const [imgSrc, setImgSrc] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<Data>({
    minutes: 30,
    numPeople: 1,
    course: "Any",
    cusine: "Any",
    restriction: "None",
    difficulty: "Easy",
    ingredients: [],
  });

  const [recipe, setRecipe] = useState("");

  async function getImage() {
    const title = document.querySelector(".response h1") as HTMLHeadingElement;

    if (title) {
      console.log(title.innerText);
      const res = await fetch("/getImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: title.innerText }),
      });
      const json = await res.json();
      setImgSrc(json?.data[0]?.url);
      console.log(json);
    }
  }

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
    setImgSrc("");
  }

  return (
    <div className="App">
      {!recipe && (
        <div className="start-page">
          <div className="intro">
            <h1 className="title">FlavourTown</h1>
            <p className="tagline">Generate recipes on the fly with AI</p>
          </div>

          <div className="data-options">
            <div className="data-option">
              <label className="label" htmlFor="ingredients">
                Do you want to use any specific ingredients? (optional)
              </label>
              <div className="input-wrapper">
                <input
                  name="ingredients"
                  className="input"
                  placeholder="Write an ingredient and press enter..."
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
              <div className="tab-options-wrapper">
                <div className="tab-options">
                  {cusines.map((cusine) => {
                    return (
                      <button
                        className="tab"
                        data-active={cusine === data.cusine}
                        key={cusine}
                        onClick={() => setData({ ...data, cusine: cusine })}
                      >
                        {cusine}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="data-option">
              <p className="label">Dietary restrictions?</p>

              <div className="tab-options-wrapper">
                <div className="tab-options">
                  {restrictions.map((restriction) => {
                    return (
                      <button
                        className="tab"
                        data-active={restriction === data.restriction}
                        key={restriction}
                        onClick={() =>
                          setData({ ...data, restriction: restriction })
                        }
                      >
                        {restriction}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="data-option">
              <p className="label">What type of course is this?</p>

              <div className="tab-options-wrapper">
                <div className="tab-options">
                  {courses.map((course) => {
                    return (
                      <button
                        className="tab"
                        data-active={course === data.course}
                        key={course}
                        onClick={() => setData({ ...data, course: course })}
                      >
                        {course}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="data-option">
              <p className="label">How many people are you making food for?</p>

              <div className="tab-options-wrapper">
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
            </div>

            <div className="data-option">
              <p className="label">How many minutes should it take?</p>

              <div className="tab-options-wrapper">
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
            </div>

            <div className="data-option">
              <p className="label">How difficult should it be?</p>

              <div className="tab-options-wrapper">
                <div className="tab-options">
                  <button
                    className="tab"
                    data-active={data.difficulty === "Easy"}
                    onClick={() => setData({ ...data, difficulty: "Easy" })}
                  >
                    Easy
                  </button>
                  <button
                    className="tab"
                    data-active={data.difficulty === "Medium"}
                    onClick={() => setData({ ...data, difficulty: "Medium" })}
                  >
                    Medium
                  </button>
                  <button
                    className="tab"
                    data-active={data.difficulty === "Advanced"}
                    onClick={() => setData({ ...data, difficulty: "Advanced" })}
                  >
                    Advanced
                  </button>
                </div>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
          </button>

          <div className="image-wrapper">
            {!imgSrc && (
              <button className="image-button" onClick={getImage}>
                Generate image
              </button>
            )}
            {imgSrc && <img src={imgSrc}></img>}
          </div>

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
