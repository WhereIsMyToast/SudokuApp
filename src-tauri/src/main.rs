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
#[tauri::command]
fn solve_grid(grid: [[u8; 9]; 9]) -> [[u8; 9]; 9] {
    let mut pgrid = Grid::new();
    pgrid.grid = grid;
    if !pgrid.solve() {
        return [[0; 9]; 9];
    }
    pgrid.grid
}

#[tauri::command]
fn save_grid(grid: [[u8; 9]; 9]) {
    println!("{:?}", grid);
    let mut path: String = get_appdata();
    path.push_str("/last_grid");
    println!("{}", path);
    let _ = write_file(grid, path);
}
#[tauri::command]
fn save_locked_grid(grid: [[bool; 9]; 9]) {
    let mut path: String = get_appdata();
    path.push_str("/last_grid_locked");
    let _ = write_file(grid, path);
}

#[tauri::command]
fn get_grid() -> [[u8; 9]; 9] {
    let mut path: String = get_appdata();
    path.push_str("/last_grid");
    match read_file::<u8>(&path) {
        Err(e) => {
            println!("Error reading file: {}", e);
            return [[0; 9]; 9];
        }
        Ok(grid) => {
            return grid;
        }
    }
}

#[tauri::command]
fn get_locked_grid() -> [[bool; 9]; 9] {
    let mut path: String = get_appdata();
    path.push_str("/last_grid_locked");
    match read_file::<bool>(&path) {
        Err(e) => {
            println!("Error reading file: {}", e);

            return [[false; 9]; 9];
        }
        Ok(grid) => {
            return grid;
        }
    }
}

static mut INSTANCE: Option<Mutex<NewGridsData>> = None;
static INIT: Once = Once::new();

fn get_singleton() -> &'static Mutex<NewGridsData> {
    INIT.call_once(|| {
        let new_grids = NewGridsData::new();
        unsafe {
            INSTANCE = Some(Mutex::new(new_grids));
        }
    });
    unsafe { INSTANCE.as_ref().unwrap() }
}

#[tauri::command]
fn generate_new_grid() -> [[u8; 9]; 9] {
    let new_grids = get_singleton();
    let grids_lock_result = new_grids.lock();
    match grids_lock_result {
        Ok(grids_guard) => {
            let grid_option = grids_guard.get_grid();
            match grid_option {
                Some(grid) => grid.grid,
                None => {
                    println!("No grid available!");
                    [[0; 9]; 9]
                }
            }
        }
        Err(lock_error) => {
            println!("Error acquiring lock: {:?}", lock_error);
            [[0; 9]; 9]
        }
    }
}

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
fn read_file<T: serde::de::DeserializeOwned>(file_dir: &str) -> Result<[[T; 9]; 9]> {
    let file: File = match File::open(file_dir) {
        Err(_) => File::create(file_dir)?,
        Ok(file) => file,
    };

    let reader = BufReader::new(file);
    let grid: [[T; 9]; 9] = serde_json::from_reader(reader)?;
    Ok(grid)
}

fn get_appdata() -> String {
    match data_dir() {
        Some(dir) => match dir.to_str() {
            None => String::new(),
            Some(d) => String::from(d),
        },
        None => return String::new(),
    }
}

fn main() {
    get_singleton();
    tauri::Builder::default()
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                println!("Prevented Close");
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
