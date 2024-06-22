import { faFlag, faLightbulb } from "@fortawesome/free-regular-svg-icons";
import { faArrowRotateLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../Styles/NavBar.css";
import { DarkModeToggle } from "./DarkModeToggle";

interface NavBarProps {
  reset: Function;
  solve: Function;
  hint: Function;
  check: Function;
}
const NavBar: React.FC<NavBarProps> = ({ reset, solve, hint, check }) => {
  return (
    <div className="NavBar">
      <DarkModeToggle></DarkModeToggle>
      <FontAwesomeIcon
        title="Reset Sudoku"
        icon={faArrowRotateLeft}
        onClick={() => {
          reset();
        }}
      />
      <FontAwesomeIcon
        title="Hint"
        icon={faLightbulb}
        onClick={() => {
          hint(0);
        }}
      />
      <FontAwesomeIcon
        title="Solve Sudoku"
        icon={faFlag}
        onClick={() => {
          solve();
        }}
      />
      <FontAwesomeIcon
        title="Check"
        icon={faCheck}
        onClick={() => {
          check();
        }}
      />
    </div>
  );
};

export default NavBar;
