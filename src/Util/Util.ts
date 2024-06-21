
export function randomInt(n: number) {
    return Math.floor(Math.random() * n)
}

//Check if grid is empty
export function testEmpty(grid: number[][]) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] !== 0) {
                return false;
            }
        }
    }
    return true;
}

//Compare two grids
export function compareGrids(g1: number[][], g2: number[][]) {
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