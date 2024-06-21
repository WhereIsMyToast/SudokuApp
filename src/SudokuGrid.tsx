import { useState, useEffect, useRef } from "react";
import SudokuCell from "./SudokuCell";
import { invoke } from "@tauri-apps/api";
import { message } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";

const SudokuGrid = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [solved, setSolved] = useState<number[][]>([]);
  const initialLockedGrid = Array.from({ length: 9 }, () =>
    Array(9).fill(false)
  );
  const [lockedGrid, setLockedGrid] = useState<boolean[][]>(initialLockedGrid);

  const [marked, setMarked] = useState(0);
  const [rowMarked, setRowMarked] = useState(0);
  const [colMarked, setColMarked] = useState(0);

  const gridRef = useRef(grid);
  const gridLockRef = useRef(lockedGrid);
  useEffect(() => {
    gridRef.current = grid;
    gridLockRef.current = lockedGrid;
  }, [grid, lockedGrid]);

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

    async function addListen() {
      await listen("save-grid", async () => {
        await invoke("save_grid", { grid: gridRef.current });
        await invoke("save_locked_grid", { grid: gridLockRef.current });
        window.close();
      });
    }
    addListen();
  }, []);

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

  function testEmpty(grid: number[][]) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  async function fetchGrid() {
    let grid: number[][] = await invoke("generate_new_grid", {});
    return grid;
  }

  async function handleCheckClick() {
    let isCorrect: boolean = compareGrids(grid, solved);
    await message(
      isCorrect ? "Resuelto correctamente" : "Está mal, vuelve a intentarlo"
    );
  }

  function compareGrids(g1: number[][], g2: number[][]) {
    if (g1.length !== g2.length) {
      return false;
    }
    for (let i = 0; i < g1.length; i++) {
      if (g1[i].length !== g2[i].length) {
        return false;
      }
      for (let j = 0; j < g1[i].length; j++) {
        if (g1[i][j] !== g2[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  function updateGrid(g: number[][]) {
    let empt = Array.from({ length: 9 }, () => Array(9).fill(0));
    setGrid(empt);
    setGrid(g);
    const newLockedGrid = g.map((row: number[]) =>
      row.map((cell: number) => cell !== 0)
    );
    setLockedGrid(newLockedGrid);
  }

  function updateSolveGrid(g: number[][]) {
    let empt = Array.from({ length: 9 }, () => Array(9).fill(0));
    setGrid(empt);
    setGrid(g);
  }

  async function handleSolveClick() {
    console.log("test");
    console.log(solved);
    updateSolveGrid(solved);
    console.log(grid);
  }

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

  return (
    <div>
      <table id="sudoku-grid">
        <tbody>{getGridElements(grid)}</tbody>
      </table>
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
  );
};

export default SudokuGrid;
