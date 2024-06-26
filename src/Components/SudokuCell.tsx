import React from "react";
import "../Styles/SudokuCell.css"; //Import CSS file for styling

interface SudokuCellProps {
  number: number;
  col: number;
  row: number;
  locked: boolean;
  grid: number[][];
  setGrid: (grid: number[][]) => void;
  markedState: {
    marked: number;
    setMarked: (marked: number) => void;
    rowMarked: number;
    setRowMarked: (rowMarked: number) => void;
    colMarked: number;
    setColMarked: (colMarked: number) => void;
  };
  hinted: { col: number; row: number } | null;
}

const SudokuCell = ({
  number,
  col,
  row,
  locked,
  grid,
  setGrid,
  markedState,
  hinted,
}: SudokuCellProps) => {
  function getInside() {
    if (locked) {
      return <div onClick={handleClick}>{number}</div>;
    } else {
      return (
        <input
          type="text"
          inputMode="numeric"
          maxLength={1}
          onChange={handleChange}
          onClick={handleClick}
          value={number !== 0 ? number : ""}
        />
      );
    }
  }

  function handleClick() {
    markedState.setMarked(number);
    markedState.setRowMarked(row);
    markedState.setColMarked(col);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value: number = +event.target.value;
    if (Number.isNaN(value)) {
      return;
    }

    let temp = [...grid];
    temp[row] = [...temp[row]];
    temp[row][col] = value;
    setGrid(temp);
  }

  const isLastInRow = col === 8;
  const isLastInColumn = row === 8;
  const isThickBorderRight = (col + 1) % 3 === 0 && !isLastInRow;
  const isThickBorderBottom = (row + 1) % 3 === 0 && !isLastInColumn;
  const isMarked = number === markedState.marked;
  const isRowColMarked =
    row === markedState.rowMarked || col === markedState.colMarked;

  function isHinted() {
    if (hinted == null) {
      return false;
    }
    if (row != hinted.row) {
      return false;
    }
    if (col != hinted.col) {
      return false;
    }
    return true;
  }

  const cellClassName = `sudoku-cell${isLastInRow ? " last-in-row" : ""}${
    isLastInColumn ? " last-in-column" : ""
  }${isThickBorderRight ? " thick-border-right" : ""}${
    isThickBorderBottom ? " thick-border-bottom" : ""
  }${locked && !isMarked ? " locked" : ""}${
    isMarked && number ? " marked" : ""
  }${isRowColMarked ? " rowColmarked" : ""}${isHinted() ? " hint" : ""}`;

  return <td className={cellClassName}>{getInside()}</td>;
};

export default SudokuCell;
