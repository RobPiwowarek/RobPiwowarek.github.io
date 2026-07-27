import { Cell } from "./cell";
import { Grid } from "./grid";

export interface GridResizeResult {
    previousCols: number;
    previousRows: number;
    cols: number;
    rows: number;
    preservedWalls: number;
    removedWalls: number;
    removedStart: boolean;
    removedGoal: boolean;
}

export class GridWorld {
    start?: Cell;
    goal?: Cell;
    readonly walls = new Set<Cell>();

    constructor(public grid: Grid) {}

    resize(cols: number, rows: number): GridResizeResult {
        const previousGrid = this.grid;
        const previousWalls = [...this.walls];
        const previousStart = this.start;
        const previousGoal = this.goal;

        const nextGrid = Grid.fromCellCount(
            cols,
            rows,
            previousGrid.cellSize
        );

        this.grid = nextGrid;
        this.walls.clear();

        let preservedWalls = 0;
        for (const wall of previousWalls) {
            const replacement = nextGrid.get(wall.col, wall.row);
            if (!replacement) continue;

            this.walls.add(replacement);
            preservedWalls++;
        }

        this.start = previousStart
            ? nextGrid.get(previousStart.col, previousStart.row)
            : undefined;
        this.goal = previousGoal
            ? nextGrid.get(previousGoal.col, previousGoal.row)
            : undefined;

        return {
            previousCols: previousGrid.cols,
            previousRows: previousGrid.rows,
            cols: nextGrid.cols,
            rows: nextGrid.rows,
            preservedWalls,
            removedWalls: previousWalls.length - preservedWalls,
            removedStart: Boolean(previousStart && !this.start),
            removedGoal: Boolean(previousGoal && !this.goal),
        };
    }
}