import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";

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
    <FontAwesomeIcon
      className="darkMode__icon darkMode"
      icon={mode === 0 ? faSun : faMoon}
      onClick={toggleMode}
      title="Toggle theme"
    ></FontAwesomeIcon>
  );
}
