import { Cell } from "./cell";

export class Grid {
    private readonly cells: Cell[][] = [];

    readonly cols: number;
    readonly rows: number;

    constructor(
        width: number,
        height: number,
        public readonly cellSize: number
    ) {
        this.cols = Math.max(1, Math.floor(width / cellSize));
        this.rows = Math.max(1, Math.floor(height / cellSize));

        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];

            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = new Cell(col, row, cellSize);
            }
        }
    }

    static fromCellCount(cols: number, rows: number, cellSize: number): Grid {
        const safeCols = Math.max(1, Math.floor(cols));
        const safeRows = Math.max(1, Math.floor(rows));
        return new Grid(safeCols * cellSize, safeRows * cellSize, cellSize);
    }

    get pixelWidth(): number {
        return this.cols * this.cellSize;
    }

    get pixelHeight(): number {
        return this.rows * this.cellSize;
    }

    get(col: number, row: number): Cell | undefined {
        return this.cells[row]?.[col];
    }

    forEach(callback: (cell: Cell) => void): void {
        for (const row of this.cells) {
            for (const cell of row) {
                callback(cell);
            }
        }
    }

    getNeighbors(cell: Cell): Cell[] {
        const neighbors: Cell[] = [];
        const { col, row } = cell;

        const up = this.get(col, row - 1);
        if (up) neighbors.push(up);

        const right = this.get(col + 1, row);
        if (right) neighbors.push(right);

        const down = this.get(col, row + 1);
        if (down) neighbors.push(down);

        const left = this.get(col - 1, row);
        if (left) neighbors.push(left);

        return neighbors;
    }
}