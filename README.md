# SudokuApp

SudokuApp is a simple yet powerful Sudoku application featuring custom algorithms to generate and solve Sudoku boards. This project is built using Tauri, with a modern frontend in **Vite**, **React**, and **TypeScript**, and a robust backend in **Rust**.

## Features

- Custom Sudoku Generation: Create unique Sudoku puzzles, with a second thread, while using the app.
- Sudoku Solver: Solve any Sudoku board using advanced algorithms of backtracking.
- Modern Frontend: Built with **Vite**, **React**, and **TypeScript** for a dynamic user experience.
- Robust Backend: Powered by **Rust** for high performance and reliability.

## Installation

```diff
- IMPORTANT: Installing a release is a lot faster generating puzzles; installing is recommended.
- To install go to the releases tab and follow the steps.
```

### Clone the Repository:

```
git clone https://github.com/WhereIsMyToast/SudokuApp
cd SudokuApp
```

### Install Dependencies:

```
npm install
```

### Run the Application:

```
cargo tauri dev
```

## Building the app

```
cargo tauri build
```

And the install one of the bundles created.

## Usage

Launch the application and generate a new Sudoku puzzle.
Utilize the solving feature to get immediate solutions for any valid Sudoku board.
Or solve it yourself, and check if the soultion is right.

## Saving system

The saving system is another of my proyects, its published on my github.
https://github.com/WhereIsMyToast/jsonStructDB

JsonStructDB is a lightweight library designed to simplify saving and retrieving data as JSON in files within the app data directory. This is especially useful for applications that require straightforward data persistence without the overhead of a full-fledged database.

Feel free to check it out.

## Future changes

- [x] Fix frontend
- [x] Add hints
- - [x] Add animation on hints
- [x] Dark mode
- - [x] Remake the ui
- [x] Remake the saving system

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Contributing

We welcome contributions and ideas of how to upgrade the proyect!
