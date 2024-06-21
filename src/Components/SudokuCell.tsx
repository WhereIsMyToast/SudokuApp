import React from "react";
import "../Styles/SudokuCell.css"; //Import CSS file for styling

interface SudokuCellProps {
  number: number;
  col: number;
  row: number;
  locked: boolean;
  grid: number[][];
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
  marked: number;
  setMarked: React.Dispatch<React.SetStateAction<number>>;
  rowMarked: number;
  setRowMarked: React.Dispatch<React.SetStateAction<number>>;
  colMarked: number;
  setColMarked: React.Dispatch<React.SetStateAction<number>>;
  hinted: { col: number; row: number } | null;
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
  hinted,
}) => {
  //Function to determine the content inside the cell
  function getInside() {
    if (locked) {
      //Display locked numbers as text
      return <div onClick={handleClick}>{number}</div>;
    } else {
      //Allow input for non-locked cells
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

  //Handle click on the cell to mark it and its row/column
  function handleClick() {
    setMarked(number);
    setRowMarked(row);
    setColMarked(col);
  }

  //Handle change in input value (for non-locked cells)
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value: number = +event.target.value;
    if (Number.isNaN(value)) {
      return;
    }
    //Update the grid state with the new value
    let temp = [...grid];
    temp[row] = [...temp[row]];
    temp[row][col] = value;
    setGrid(temp);
  }

  //Determine dynamic classNames based on cell's properties
  const isLastInRow = col === 8;
  const isLastInColumn = row === 8;
  const isThickBorderRight = (col + 1) % 3 === 0 && !isLastInRow;
  const isThickBorderBottom = (row + 1) % 3 === 0 && !isLastInColumn;
  const isMarked = number === marked;
  const isRowColMarked = row === rowMarked || col === colMarked;

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

  //Construct the className string based on conditions
  const cellClassName = `sudoku-cell${isLastInRow ? " last-in-row" : ""}${
    isLastInColumn ? " last-in-column" : ""
  }${isThickBorderRight ? " thick-border-right" : ""}${
    isThickBorderBottom ? " thick-border-bottom" : ""
  }${locked && !isMarked ? " locked" : ""}${
    isMarked && number ? " marked" : ""
  }${isRowColMarked ? " rowColmarked" : ""}${isHinted() ? " hint" : ""}`;

  //Render the cell with appropriate className and content
  return <td className={cellClassName}>{getInside()}</td>;
};

export default SudokuCell;
