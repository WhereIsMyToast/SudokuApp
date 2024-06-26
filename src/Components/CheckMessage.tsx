import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../Styles/CheckMessage.css";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

interface CheckMessageProps {
  winner: number;
  setWinner: (Winner: number) => void;
}

const CheckMessage = ({ winner, setWinner }: CheckMessageProps) => {
  function getClasses() {
    if (winner == 0) {
      return "Cont none";
    }
    if (winner != 0) {
      setTimeout(() => {
        setWinner(0);
      }, 3000);
      return winner == 1 ? "Cont Check" : "Cont Cross";
    }
    return "Cont";
  }
  function getIcon() {
    if (winner == 1) {
      return faCheck;
    }
    return faXmark;
  }
  return (
    <div className={getClasses()}>
      <FontAwesomeIcon icon={getIcon()} className="icon" />
    </div>
  );
};

export default CheckMessage;
