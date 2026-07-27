import { Editor } from "../core/editor";
import { LogLevel } from "../core/logger";
import { Cell } from "./cell";
import { GridWorld } from "./grid-world";

export enum Tool {
    Start,
    Goal,
    Wall,
    Erase,
}

export interface GridEditResult {
    changed: boolean;
    message: string;
    level: LogLevel;
}

export class GridEditor implements Editor<GridWorld> {
    hovered?: Cell;
    tool = Tool.Wall;

    constructor(public readonly world: GridWorld) {}

    setTool(tool: Tool): void {
        this.tool = tool;
    }

    onClick(cell: Cell): GridEditResult {
        switch (this.tool) {
            case Tool.Start:
                return this.placeStart(cell);

            case Tool.Goal:
                return this.placeGoal(cell);

            case Tool.Wall:
                return this.placeWall(cell);

            case Tool.Erase:
                return this.erase(cell);
        }
    }

    private placeStart(cell: Cell): GridEditResult {
        const changed =
            this.world.start !== cell ||
            this.world.goal === cell ||
            this.world.walls.has(cell);

        this.world.walls.delete(cell);

        if (this.world.goal === cell) {
            this.world.goal = undefined;
        }

        this.world.start = cell;

        return {
            changed,
            message: changed
                ? `Placed start at (${cell.col}, ${cell.row}).`
                : "Start is already on that cell.",
            level: changed ? "info" : "warning",
        };
    }

    private placeGoal(cell: Cell): GridEditResult {
        const changed =
            this.world.goal !== cell ||
            this.world.start === cell ||
            this.world.walls.has(cell);

        this.world.walls.delete(cell);

        if (this.world.start === cell) {
            this.world.start = undefined;
        }

        this.world.goal = cell;

        return {
            changed,
            message: changed
                ? `Placed goal at (${cell.col}, ${cell.row}).`
                : "Goal is already on that cell.",
            level: changed ? "info" : "warning",
        };
    }

    private placeWall(cell: Cell): GridEditResult {
        if (this.world.start === cell || this.world.goal === cell) {
            return {
                changed: false,
                message: "A wall cannot be placed on the start or goal cell.",
                level: "warning",
            };
        }

        if (this.world.walls.has(cell)) {
            return {
                changed: false,
                message: `Cell (${cell.col}, ${cell.row}) is already a wall.`,
                level: "warning",
            };
        }

        this.world.walls.add(cell);

        return {
            changed: true,
            message: `Added wall at (${cell.col}, ${cell.row}).`,
            level: "info",
        };
    }

    private erase(cell: Cell): GridEditResult {
        const removed: string[] = [];

        if (this.world.walls.delete(cell)) {
            removed.push("wall");
        }

        if (this.world.start === cell) {
            this.world.start = undefined;
            removed.push("start");
        }

        if (this.world.goal === cell) {
            this.world.goal = undefined;
            removed.push("goal");
        }

        if (removed.length === 0) {
            return {
                changed: false,
                message: `Nothing to erase at (${cell.col}, ${cell.row}).`,
                level: "warning",
            };
        }

        return {
            changed: true,
            message: `Erased ${removed.join(" and ")} at (${cell.col}, ${cell.row}).`,
            level: "info",
        };
    }
}
