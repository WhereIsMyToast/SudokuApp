import { useState, useEffect, useRef } from "react";
import SudokuCell from "./SudokuCell";
import { invoke } from "@tauri-apps/api";
import { message } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";
import { compareGrids, randomInt, testEmpty } from "../Util/Util";
import NavBar from "./NavBar";
import "../Styles/SudokuGrid.css";
import CheckMessage from "./CheckMessage";

const SudokuGrid = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [solved, setSolved] = useState<number[][]>([]);
  const [lockedGrid, setLockedGrid] = useState<boolean[][]>(
    Array.from({ length: 9 }, () => Array(9).fill(false))
  );
  const [marked, setMarked] = useState(0);
  const [rowMarked, setRowMarked] = useState(0);
  const [colMarked, setColMarked] = useState(0);
  const [hintedCell, setHintedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [win, setWin] = useState(0);
  const [mode, setMode] = useState(0);

  const gridRef = useRef(grid);
  const gridLockRef = useRef(lockedGrid);
  const modeRef = useRef(mode);

  useEffect(() => {
    gridRef.current = grid;
    gridLockRef.current = lockedGrid;
    modeRef.current = mode;
  }, [grid, lockedGrid, mode]);

  interface Data {
    grid: number[][];
    locked_grid: boolean[][];
    mode: number;
  }

  useEffect(() => {
    const fetchData = async () => {
      const data: Data = await invoke("get_data", {});
      setGrid(data.grid);
      setLockedGrid(data.locked_grid);
      setMode(data.mode);
      const solvedData: number[][] = await invoke("solve_grid", {
        grid: data.grid,
      });
      setSolved(solvedData);
    };

    const addListen = async () => {
      await listen("save", async () => {
        await invoke("save_data", {
          grid: gridRef.current,
          lockedGrid: gridLockRef.current,
          mode: modeRef.current,
        });
        window.close();
      });
    };

    fetchData();
    addListen();
  }, []);

  const handleResetClick = async () => {
    const newGrid: number[][] = await fetchGrid();
    if (testEmpty(newGrid)) {
      await message("Vuelve a intentarlo");
      return;
    }
    updateGrid(newGrid);
    const solvedData: number[][] = await invoke("solve_grid", {
      grid: newGrid,
    });
    setSolved(solvedData);
  };

  const fetchGrid = async () => {
    let grid: number[][] = await invoke("generate_new_grid", {});
    return grid;
  };

  const handleCheckClick = async () => {
    const isCorrect = compareGrids(grid, solved);
    setWin(isCorrect ? 1 : 2);
  };

  const updateGrid = (newGrid: number[][]) => {
    setGrid(Array.from({ length: 9 }, () => Array(9).fill(0)));
    setGrid(newGrid);
    setLockedGrid(newGrid.map((row) => row.map((cell) => cell !== 0)));
  };

  const handleSolveClick = async () => {
    updateGrid(solved);
  };

  const handleHintClick = (tries: number) => {
    if (tries > 81) return;
    const i = randomInt(9);
    const j = randomInt(9);

    if (grid[i][j] === 0) {
      const tempGrid = [...grid];
      tempGrid[i][j] = solved[i][j];
      setGrid(tempGrid);
      setHintedCell({ row: i, col: j });
      setTimeout(() => setHintedCell(null), 500);
    } else {
      handleHintClick(tries + 1);
    }
  };

  const getGridElements = (grid: number[][]) => {
    const markedState = {
      marked,
      setMarked,
      rowMarked,
      setRowMarked,
      colMarked,
      setColMarked,
    };

    return grid.map((row, rowIndex) => (
      <tr key={`row-${rowIndex}`}>
        {row.map((cell, colIndex) => (
          <SudokuCell
            markedState={markedState}
            key={`cell-${rowIndex}-${colIndex}`}
            number={cell}
            col={colIndex}
            row={rowIndex}
            locked={lockedGrid[rowIndex][colIndex]}
            grid={grid}
            setGrid={setGrid}
            hinted={hintedCell}
          />
        ))}
      </tr>
    ));
  };

  return (
    <div className="Container">
      <CheckMessage winner={win} setWinner={setWin} />
      <NavBar
        mode={mode}
        setMode={setMode}
        reset={handleResetClick}
        solve={handleSolveClick}
        hint={handleHintClick}
        check={handleCheckClick}
      />
      <table id="sudoku-grid">
        <tbody>{getGridElements(grid)}</tbody>
      </table>
    </div>
  );
};

export default SudokuGrid;
