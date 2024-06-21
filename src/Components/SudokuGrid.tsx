import { useState, useEffect, useRef } from "react";
import SudokuCell from "./SudokuCell";
import { invoke } from "@tauri-apps/api";
import { message } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";
import { compareGrids, testEmpty } from "../Util/Util";

const SudokuGrid = () => {
  //State hooks
  const [grid, setGrid] = useState<number[][]>([]);
  const [solved, setSolved] = useState<number[][]>([]);
  const initialLockedGrid = Array.from({ length: 9 }, () =>
    Array(9).fill(false)
  );
  const [lockedGrid, setLockedGrid] = useState<boolean[][]>(initialLockedGrid);
  const [marked, setMarked] = useState(0);
  const [rowMarked, setRowMarked] = useState(0);
  const [colMarked, setColMarked] = useState(0);

  //Refs to hold current grid and locked grid values
  const gridRef = useRef(grid);
  const gridLockRef = useRef(lockedGrid);

  //Update refs when grid or lockedGrid changes
  useEffect(() => {
    gridRef.current = grid;
    gridLockRef.current = lockedGrid;
  }, [grid, lockedGrid]);

  //Fetch initial data on component mount
  useEffect(() => {
    async function fetchData() {
      const data: number[][] = await invoke("get_grid", {});
      setGrid(data);
      const solvedData: number[][] = await invoke("solve_grid", { grid: data });
      setSolved(solvedData);
      const lockedData: boolean[][] = await invoke("get_locked_grid", {});
      setLockedGrid(lockedData);
    }
    fetchData();

    //Listen for save-grid event to save grid and lockedGrid
    async function addListen() {
      await listen("save-grid", async () => {
        await invoke("save_grid", { grid: gridRef.current });
        await invoke("save_locked_grid", { grid: gridLockRef.current });
        window.close();
      });
    }
    addListen();
  }, []); //Empty dependency array ensures useEffect runs only on mount

  //Reset grid to initial state
  async function handleResetClick() {
    let newGrid: number[][] = await fetchGrid();
    if (testEmpty(newGrid)) {
      await message("Vuelve a intentarlo");
      return;
    }
    updateGrid(newGrid);
    let s: number[][] = await invoke("solve_grid", { grid: newGrid });
    setSolved(s);
  }

  //Fetch a new grid from backend
  async function fetchGrid() {
    let grid: number[][] = await invoke("generate_new_grid", {});
    return grid;
  }

  //Handle check button click to compare grid with solved grid
  async function handleCheckClick() {
    let isCorrect: boolean = compareGrids(grid, solved);
    await message(
      isCorrect ? "Resuelto correctamente" : "Está mal, vuelve a intentarlo"
    );
  }

  //Update grid and lockedGrid state
  function updateGrid(g: number[][]) {
    let empt = Array.from({ length: 9 }, () => Array(9).fill(0));
    setGrid(empt);
    setGrid(g);
    const newLockedGrid = g.map((row: number[]) =>
      row.map((cell: number) => cell !== 0)
    );
    setLockedGrid(newLockedGrid);
  }

  //Update grid with solved grid values
  function updateSolveGrid(g: number[][]) {
    let empt = Array.from({ length: 9 }, () => Array(9).fill(0));
    setGrid(empt);
    setGrid(g);
  }

  //Handle solve button click
  async function handleSolveClick() {
    updateSolveGrid(solved);
  }

  //Render SudokuCell components based on grid state
  function getGridElements(grid: number[][]) {
    return grid.map((row, i) => (
      <tr key={`row-${i}`}>
        {row.map((cell, j) => (
          <SudokuCell
            colMarked={colMarked}
            rowMarked={rowMarked}
            setColMarked={setColMarked}
            setRowMarked={setRowMarked}
            marked={marked}
            setMarked={setMarked}
            key={`cell-${i}-${j}`}
            number={cell}
            col={j}
            row={i}
            locked={lockedGrid[i][j]}
            grid={grid}
            setGrid={setGrid}
          />
        ))}
      </tr>
    ));
  }

  //JSX to render SudokuGrid component
  return (
    <div>
      <table id="sudoku-grid">
        <tbody>{getGridElements(grid)}</tbody>
      </table>
      <div id="button-container">
        <button id="check-button" onClick={handleCheckClick}>
          Check
        </button>
        <button id="reset-button" onClick={handleResetClick}>
          Reset
        </button>
        <button id="solve-button" onClick={handleSolveClick}>
          Solve
        </button>
      </div>
    </div>
  );
};

export default SudokuGrid;
