import React from "react";
import "./SudokuCell.css"; // Import CSS file

interface SudokuCellProps {
  number: number;
  col: number;
  row: number;
  locked: boolean;
  grid: number[][];
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
  marked: number;
  setMarked: React.Dispatch<React.SetStateAction<number>>;
  colMarked: number;
  setColMarked: React.Dispatch<React.SetStateAction<number>>;
  rowMarked: number;
  setRowMarked: React.Dispatch<React.SetStateAction<number>>;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  number,
  col,
  row,
  locked,
  grid,
  setGrid,
  marked,
  setMarked,
  rowMarked,
  setRowMarked,
  colMarked,
  setColMarked,
}) => {
  function getInside() {
    if (locked) {
      return <div onClick={handleClick}>{number}</div>;
    }
    return (
      <input
        type="text"
        inputMode="numeric"
        maxLength={1}
        onChange={handleChange}
        onClick={handleClick}
        value={number != 0 ? number : ""}
      />
    );
  }

  function handleClick() {
    setMarked(number);
    setRowMarked(row);
    setColMarked(col);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value: number = +event.target.value;
    if (Number.isNaN(value)) {
      return;
    }
    let temp = [...grid];
    temp[row] = [...temp[row]];
    temp[row][col] = value;
    number = value;
    setGrid(temp);
  }

  const isLastInRow = col === 8;
  const isLastInColumn = row === 8;

  const isThickBorderRight = (col + 1) % 3 === 0 && !isLastInRow;
  const isThickBorderBottom = (row + 1) % 3 === 0 && !isLastInColumn;

  const isMarked = number == marked;
  const isRowColMarked = row == rowMarked || col == colMarked;

  const cellClassName = `sudoku-cell${isLastInRow ? " last-in-row" : ""}${
    isLastInColumn ? " last-in-column" : ""
  }${isThickBorderRight ? " thick-border-right" : ""}${
    isThickBorderBottom ? " thick-border-bottom" : ""
  }${locked && !isMarked ? " locked" : ""}${
    isMarked && number ? " marked" : ""
  }${isRowColMarked ? " rowColmarked" : ""}`;

  return <td className={cellClassName}>{getInside()}</td>;
};

export default SudokuCell;
