//Conditional compilation attribute to configure the Windows subsystem
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use json_struct_db::{self, JsonConverter};
use serde::{Deserialize, Serialize};
use solver::{Grid, NewGridsData};

use std::sync::{Mutex, Once};

use tauri::WindowEvent;

mod solver;

#[derive(Serialize, Deserialize)]
struct Data {
    grid: [[u8; 9]; 9],
    locked_grid: [[bool; 9]; 9],
    mode: u8,
}

impl Data {
    fn new() -> Self {
        Data {
            grid: [[0; 9]; 9],
            locked_grid: [[false; 9]; 9],
            mode: 0,
        }
    }
}

impl json_struct_db::JsonConverter for Data {
    fn to_json(&self) -> String {
        serde_json::to_string(self).expect("Failed to serialize MyData")
    }

    fn from_json(json: String) -> Self {
        serde_json::from_str(&json).expect("Failed to deserialize MyData")
    }
}

//Command to solve the provided Sudoku grid
#[tauri::command]
fn solve_grid(grid: [[u8; 9]; 9]) -> [[u8; 9]; 9] {
    let mut solve_grid = Grid::new();
    solve_grid.grid = grid;
    if !solve_grid.solve() {
        return [[0; 9]; 9]; //Return an empty grid if solving fails
    }
    solve_grid.grid
}

//Command to save the current Sudoku grid to a file
#[tauri::command]
fn save_data(grid: [[u8; 9]; 9], locked_grid: [[bool; 9]; 9], mode: u8) {
    let data: Data = Data {
        grid: grid,
        locked_grid: locked_grid,
        mode: mode,
    };
    match json_struct_db::save(data, "sudoku_data") {
        Ok(path) => {
            println!("Data saved to {}", path)
        }
        Err(e) => {
            println!("{}", e)
        }
    };
}

#[tauri::command]
fn get_data() -> Data {
    match json_struct_db::read("sudoku_data") {
        Ok(data) => return Data::from_json(data),
        Err(e) => {
            println!("{}", e.message);
            return Data::new();
        }
    }
}

//Singleton instance to manage new grids
static mut INSTANCE: Option<Mutex<NewGridsData>> = None;
static INIT: Once = Once::new();

//Function to get the singleton instance
fn get_singleton() -> &'static Mutex<NewGridsData> {
    INIT.call_once(|| {
        let new_grids = NewGridsData::new();
        unsafe {
            INSTANCE = Some(Mutex::new(new_grids));
        }
    });
    unsafe { INSTANCE.as_ref().unwrap() }
}

//Command to generate a new Sudoku grid
#[tauri::command]
fn generate_new_grid() -> [[u8; 9]; 9] {
    let new_grids = get_singleton();
    let grids_lock_result = new_grids.lock();
    match grids_lock_result {
        Ok(grids_guard) => match grids_guard.get_grid() {
            Some(grid) => grid.grid,
            None => [[0; 9]; 9],
        },
        Err(_) => [[0; 9]; 9],
    }
}

//Main function to initialize the application and set up Tauri commands
fn main() {
    get_singleton();
    tauri::Builder::default()
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                event.window().emit("save", "").unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            solve_grid,
            save_data,
            get_data,
            generate_new_grid
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
