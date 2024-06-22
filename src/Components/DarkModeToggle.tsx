import { useState } from "react";
import "../Styles/DarkModeToggle.css";

export function DarkModeToggle() {
  const [mode, setMode] = useState(0);
  function toggleMode() {
    if (mode == 0) {
      setMode(1);
      setDarkMode();
      return;
    }
    setMode(0);
    setLightMode();
  }
  function setDarkMode() {
    document.querySelector("body")?.setAttribute("data-theme", "dark");
  }

  function setLightMode() {
    document.querySelector("body")?.setAttribute("data-theme", "light");
  }

  return (
    <div className="darkmodetoggle">
      <input
        className="toggle-checkbox"
        type="checkbox"
        onClick={toggleMode}
      ></input>
    </div>
  );
}
