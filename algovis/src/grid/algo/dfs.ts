import {
    AlgorithmEvent,
    AlgorithmState,
} from "../../core/algorithm";
import { Cell } from "../cell";
import { GridAlgorithm } from "../grid-algorithm";
import { GridWorld } from "../grid-world";

export class DFSGridAlgorithm implements GridAlgorithm {
    readonly id = "dfs";
    readonly name = "Depth-First Search";
    readonly description =
        "DFS follows one branch as deeply as possible before backtracking. It can find a path, but it does not guarantee the shortest path.";

    state: AlgorithmState = "ready";

    readonly visited = new Set<Cell>();
    readonly frontier = new Set<Cell>();
    path: Cell[] = [];
    current?: Cell;

    private stack: Cell[] = [];
    private readonly discovered = new Set<Cell>();
    private readonly cameFrom = new Map<Cell, Cell>();

    constructor(public readonly world: GridWorld) {}

    initialize(): AlgorithmEvent {
        this.reset();

        const start = this.world.start;
        const goal = this.world.goal;

        if (!start || !goal) {
            this.state = "failed";
            return {
                type: "failed",
                message: "DFS cannot start: place both a start and a goal cell.",
            };
        }

        if (this.world.walls.has(start) || this.world.walls.has(goal)) {
            this.state = "failed";
            return {
                type: "failed",
                message: "DFS cannot start: start and goal must not be walls.",
            };
        }

        this.stack.push(start);
        this.frontier.add(start);
        this.discovered.add(start);
        this.state = "running";

        return {
            type: "initialized",
            message: `DFS initialized at (${start.col}, ${start.row}).`,
        };
    }

    step(): AlgorithmEvent {
        if (this.state !== "running") {
            return {
                type: "idle",
                message: "DFS is not currently running.",
            };
        }

        const cell = this.stack.pop();

        if (!cell) {
            this.state = "failed";
            return {
                type: "failed",
                message: "DFS finished: no path exists.",
            };
        }

        this.frontier.delete(cell);
        this.current = cell;
        this.visited.add(cell);

        if (cell === this.world.goal) {
            this.path = this.reconstructPath(cell);
            this.state = "completed";

            return {
                type: "completed",
                message: `DFS found a path with ${Math.max(0, this.path.length - 1)} steps after visiting ${this.visited.size} cells.`,
            };
        }

        const neighbors = this.world.grid.getNeighbors(cell);

        // Push in reverse so DFS processes neighbors in the grid's visible
        // order: up, right, down, left.
        for (let index = neighbors.length - 1; index >= 0; index--) {
            const neighbor = neighbors[index];

            if (
                this.world.walls.has(neighbor) ||
                this.discovered.has(neighbor)
            ) {
                continue;
            }

            this.discovered.add(neighbor);
            this.cameFrom.set(neighbor, cell);
            this.stack.push(neighbor);
            this.frontier.add(neighbor);
        }

        if (this.stack.length === 0) {
            this.state = "failed";
            return {
                type: "failed",
                message: `DFS visited (${cell.col}, ${cell.row}); the frontier is empty, so no path exists.`,
            };
        }

        return {
            type: "progress",
            message: `DFS visited (${cell.col}, ${cell.row}); frontier: ${this.frontier.size}, visited: ${this.visited.size}.`,
        };
    }

    reset(): void {
        this.state = "ready";
        this.stack = [];
        this.discovered.clear();
        this.cameFrom.clear();
        this.visited.clear();
        this.frontier.clear();
        this.path = [];
        this.current = undefined;
    }

    private reconstructPath(goal: Cell): Cell[] {
        const path = [goal];
        let current = goal;

        while (current !== this.world.start) {
            const previous = this.cameFrom.get(current);
            if (!previous) break;

            path.push(previous);
            current = previous;
        }

        path.reverse();
        return path;
    }
}
