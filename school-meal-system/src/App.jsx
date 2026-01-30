import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-col items-center w-full">
        <div className="bg-amber-700 w-1/2 h-8">
          <p className="text-3xl">Test</p>
        </div>
      </div>
    </>
  );
}

export default App;
