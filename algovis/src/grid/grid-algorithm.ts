import { Algorithm } from "../core/algorithm";
import { Cell } from "./cell";

export interface GridAlgorithm extends Algorithm {
    readonly visited: ReadonlySet<Cell>;
    readonly frontier: ReadonlySet<Cell>;
    readonly path: readonly Cell[];
    readonly current?: Cell;
}
