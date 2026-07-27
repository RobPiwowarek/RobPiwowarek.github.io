import {
    AlgorithmEvent,
    AlgorithmState,
} from "../../core/algorithm";
import { Cell } from "../cell";
import { GridAlgorithm } from "../grid-algorithm";
import { GridWorld } from "../grid-world";

export class DummyGridAlgorithm implements GridAlgorithm {
    readonly id = "dummy";
    readonly name = "Grid Scan Demo";
    readonly description =
        "A simple row-by-row scan used for testing the simulation controls.";

    state: AlgorithmState = "ready";
    readonly visited = new Set<Cell>();
    readonly frontier = new Set<Cell>();
    readonly path: readonly Cell[] = [];
    current?: Cell;

    private index = 0;

    constructor(public readonly world: GridWorld) {}

    initialize(): AlgorithmEvent {
        this.reset();
        this.state = "running";

        return {
            type: "initialized",
            message: "Grid scan initialized.",
        };
    }

    step(): AlgorithmEvent {
        if (this.state !== "running") {
            return {
                type: "idle",
                message: "Grid scan is not currently running.",
            };
        }

        const grid = this.world.grid;
        const totalCells = grid.cols * grid.rows;

        if (this.index >= totalCells) {
            this.state = "completed";
            return {
                type: "completed",
                message: `Grid scan completed after visiting ${this.visited.size} cells.`,
            };
        }

        const col = this.index % grid.cols;
        const row = Math.floor(this.index / grid.cols);
        const cell = grid.get(col, row);
        this.index++;

        if (cell) {
            this.current = cell;
            this.visited.add(cell);
        }

        if (this.index >= totalCells) {
            this.state = "completed";
            return {
                type: "completed",
                message: `Grid scan completed after visiting ${this.visited.size} cells.`,
            };
        }

        return {
            type: "progress",
            message: `Grid scan visited (${col}, ${row}).`,
        };
    }

    reset(): void {
        this.index = 0;
        this.state = "ready";
        this.visited.clear();
        this.frontier.clear();
        this.current = undefined;
    }
}
