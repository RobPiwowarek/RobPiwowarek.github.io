import {
    AlgorithmEvent,
    AlgorithmState,
} from "../../core/algorithm";
import { Cell } from "../cell";
import { GridAlgorithm } from "../grid-algorithm";
import { GridWorld } from "../grid-world";

export class BFSGridAlgorithm implements GridAlgorithm {
    readonly id = "bfs";
    readonly name = "Breadth-First Search";
    readonly description =
        "BFS explores cells in distance layers. On an unweighted grid it finds a shortest path, but it may inspect many cells.";

    state: AlgorithmState = "ready";

    readonly visited = new Set<Cell>();
    readonly frontier = new Set<Cell>();
    path: Cell[] = [];
    current?: Cell;

    private queue: Cell[] = [];
    private queueHead = 0;
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
                message: "BFS cannot start: place both a start and a goal cell.",
            };
        }

        if (this.world.walls.has(start) || this.world.walls.has(goal)) {
            this.state = "failed";
            return {
                type: "failed",
                message: "BFS cannot start: start and goal must not be walls.",
            };
        }

        this.queue.push(start);
        this.frontier.add(start);
        this.discovered.add(start);
        this.state = "running";

        return {
            type: "initialized",
            message: `BFS initialized at (${start.col}, ${start.row}).`,
        };
    }

    step(): AlgorithmEvent {
        if (this.state !== "running") {
            return {
                type: "idle",
                message: "BFS is not currently running.",
            };
        }

        const cell = this.queue[this.queueHead++];

        if (!cell) {
            this.state = "failed";
            return {
                type: "failed",
                message: "BFS finished: no path exists.",
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
                message: `BFS found a path with ${Math.max(0, this.path.length - 1)} steps after visiting ${this.visited.size} cells.`,
            };
        }

        for (const neighbor of this.world.grid.getNeighbors(cell)) {
            if (
                this.world.walls.has(neighbor) ||
                this.discovered.has(neighbor)
            ) {
                continue;
            }

            this.discovered.add(neighbor);
            this.cameFrom.set(neighbor, cell);
            this.queue.push(neighbor);
            this.frontier.add(neighbor);
        }

        if (this.queueHead >= this.queue.length) {
            this.state = "failed";
            return {
                type: "failed",
                message: `BFS visited (${cell.col}, ${cell.row}); the frontier is empty, so no path exists.`,
            };
        }

        return {
            type: "progress",
            message: `BFS visited (${cell.col}, ${cell.row}); frontier: ${this.frontier.size}, visited: ${this.visited.size}.`,
        };
    }

    reset(): void {
        this.state = "ready";
        this.queue = [];
        this.queueHead = 0;
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
