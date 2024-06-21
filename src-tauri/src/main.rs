//Conditional compilation attribute to configure the Windows subsystem
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::Serialize;
use solver::{Grid, NewGridsData};
use std::fs::OpenOptions;
use std::io::Result;
use std::sync::{Mutex, Once};
use std::{
    fs::File,
    io::{BufReader, BufWriter, Write},
};
use tauri::api::path::data_dir;
use tauri::WindowEvent;

mod solver;

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
fn save_grid(grid: [[u8; 9]; 9]) {
    let mut path: String = get_appdata();
    path.push_str("/last_grid");
    let _ = write_file(grid, path);
}

//Command to save the locked cells of the Sudoku grid to a file
#[tauri::command]
fn save_locked_grid(grid: [[bool; 9]; 9]) {
    let mut path: String = get_appdata();
    path.push_str("/last_grid_locked");
    let _ = write_file(grid, path);
}

//Command to retrieve the last saved Sudoku grid from a file
#[tauri::command]
fn get_grid() -> [[u8; 9]; 9] {
    let mut path: String = get_appdata();
    path.push_str("/last_grid");
    match read_file::<u8>(&path) {
        Err(_) => {
            return [[0; 9]; 9]; //Return an empty grid on error
        }
        Ok(grid) => grid,
    }
}

//Command to retrieve the last saved locked cells of the Sudoku grid from a file
#[tauri::command]
fn get_locked_grid() -> [[bool; 9]; 9] {
    let mut path: String = get_appdata();
    path.push_str("/last_grid_locked");
    match read_file::<bool>(&path) {
        Err(_) => {
            return [[false; 9]; 9]; //Return an empty locked grid on error
        }
        Ok(grid) => grid,
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

//Function to write a grid to a file
fn write_file<T: Serialize>(g: [[T; 9]; 9], f: String) -> Result<()> {
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(f)?;
    let mut writer = BufWriter::new(file);
    serde_json::to_writer(&mut writer, &g)?;
    writer.flush()?;
    Ok(())
}

//Function to read a grid from a file
fn read_file<T: serde::de::DeserializeOwned>(file_dir: &str) -> Result<[[T; 9]; 9]> {
    let file: File = match File::open(file_dir) {
        Err(_) => File::create(file_dir)?,
        Ok(file) => file,
    };

    let reader = BufReader::new(file);
    let grid: [[T; 9]; 9] = serde_json::from_reader(reader)?;
    Ok(grid)
}

//Function to get the application data directory
fn get_appdata() -> String {
    match data_dir() {
        Some(dir) => match dir.to_str() {
            None => String::new(),
            Some(d) => String::from(d),
        },
        None => String::new(),
    }
}

//Main function to initialize the application and set up Tauri commands
fn main() {
    get_singleton();
    tauri::Builder::default()
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                event.window().emit("save-grid", "").unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            solve_grid,
            save_grid,
            get_grid,
            get_locked_grid,
            save_locked_grid,
            generate_new_grid
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
