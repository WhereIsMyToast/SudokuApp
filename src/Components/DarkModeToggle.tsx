import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { useEffect } from "react";

interface DarkModeToggleProps {
  mode: number;
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ mode, setMode }) => {
  useEffect(() => {
    if (mode == 0) {
      setLightMode();
    }
    if (mode == 1) {
      setDarkMode();
    }
  }, [mode]);
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
};

export default DarkModeToggle;
