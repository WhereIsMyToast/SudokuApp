import React from "react";
import ReactDOM from "react-dom/client";
import "./Styles/index.css";
import SudokuGrid from "./Components/SudokuGrid";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SudokuGrid />
  </React.StrictMode>
);
