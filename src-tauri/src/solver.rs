use rand::seq::SliceRandom;
use rand::thread_rng;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub struct Grid {
    pub grid: [[u8; 9]; 9],
}

impl Grid {
    pub fn new() -> Self {
        Grid { grid: [[0; 9]; 9] }
    }

    fn is_safe(&self, row: usize, col: usize, num: u8) -> bool {
        for x in 0..9 {
            if self.grid[row][x] == num {
                return false;
            }
        }
        for x in 0..9 {
            if self.grid[x][col] == num {
                return false;
            }
        }
        let start_row = row - row % 3;
        let start_col = col - col % 3;
        for i in 0..3 {
            for j in 0..3 {
                if self.grid[start_row + i][start_col + j] == num {
                    return false;
                }
            }
        }
        true
    }

    pub fn solve(&mut self) -> bool {
        self.solve_from(0, 0)
    }

    fn solve_from(&mut self, row: usize, col: usize) -> bool {
        const SIZE: usize = 9;
        if row == SIZE - 1 && col == SIZE {
            return true;
        }
        if col == SIZE {
            return self.solve_from(row + 1, 0);
        }
        if self.grid[row][col] > 0 {
            return self.solve_from(row, col + 1);
        }
        for num in 1..=9 {
            if self.is_safe(row, col, num) {
                self.grid[row][col] = num;
                if self.solve_from(row, col + 1) {
                    return true;
                }
                self.grid[row][col] = 0;
            }
        }
        false
    }

    fn fill_grid(&mut self) -> bool {
        let mut nums: Vec<u8> = (1..=9).collect();
        let mut rng = thread_rng();

        for row in 0..9 {
            for col in 0..9 {
                nums.shuffle(&mut rng);
                for &num in nums.iter() {
                    if self.is_safe(row, col, num) {
                        self.grid[row][col] = num;
                        if self.solve_from(0, 0) {
                            if self.fill_grid() {
                                return true;
                            }
                        }
                        self.grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
        true
    }

    fn count_solutions(&mut self, row: usize, col: usize, count: &mut u32) -> bool {
        const SIZE: usize = 9;
        if row == SIZE - 1 && col == SIZE {
            *count += 1;
            return true;
        }
        if col == SIZE {
            return self.count_solutions(row + 1, 0, count);
        }
        if self.grid[row][col] > 0 {
            return self.count_solutions(row, col + 1, count);
        }
        for num in 1..=9 {
            if self.is_safe(row, col, num) {
                self.grid[row][col] = num;
                if self.count_solutions(row, col + 1, count) && *count > 1 {
                    self.grid[row][col] = 0;
                    return false;
                }
                self.grid[row][col] = 0;
            }
        }
        false
    }

    pub fn generate_puzzle(&mut self) {
        self.fill_grid();

        let mut positions: Vec<(usize, usize)> =
            (0..9).flat_map(|r| (0..9).map(move |c| (r, c))).collect();
        positions.shuffle(&mut thread_rng());

        for (row, col) in positions {
            let backup = self.grid[row][col];
            self.grid[row][col] = 0;

            let mut count = 0;
            let mut copy = self.clone();
            copy.count_solutions(0, 0, &mut count);
            if count != 1 {
                self.grid[row][col] = backup;
            }
        }
    }
}

impl Clone for Grid {
    fn clone(&self) -> Grid {
        Grid {
            grid: self.grid.clone(),
        }
    }
}

struct Queue {
    data: Vec<Grid>,
}

impl Queue {
    fn new() -> Self {
        Queue { data: Vec::new() }
    }

    fn enqueue(&mut self, grid: Grid) {
        self.data.push(grid);
    }

    fn dequeue(&mut self) -> Option<Grid> {
        if self.data.is_empty() {
            None
        } else {
            Some(self.data.pop().unwrap())
        }
    }

    fn len(&self) -> usize {
        self.data.len()
    }
}

pub struct NewGridsData {
    stored: Arc<Mutex<Queue>>,
}

impl NewGridsData {
    pub fn new() -> Self {
        let n = NewGridsData {
            stored: Arc::new(Mutex::new(Queue::new())),
        };
        n.launch_process();
        n
    }

    fn launch_process(&self) {
        let stored = Arc::clone(&self.stored);
        thread::spawn(move || loop {
            let generated_grids;
            {
                let queue = stored.lock().unwrap();
                generated_grids = queue.len();
            }
            if generated_grids < 6 {
                let mut grid = Grid::new();
                grid.generate_puzzle();
                {
                    let mut queue = stored.lock().unwrap();
                    println!("Produced grid");
                    queue.enqueue(grid);
                }
            } else {
                println!("Queue is full");
                thread::sleep(Duration::from_secs(1));
            }
        });
    }
    pub fn get_grid(&self) -> Option<Grid> {
        let stored = Arc::clone(&self.stored);
        {
            println!("Consumed Grid");
            let mut queue = stored.lock().unwrap();
            queue.dequeue()
        }
    }
}
