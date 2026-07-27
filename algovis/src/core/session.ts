import { Algorithm, AlgorithmEvent } from "./algorithm";
import { Editor } from "./editor";
import { Logger, LogLevel } from "./logger";

export type SimulationState =
    | "idle"
    | "running"
    | "paused"
    | "completed"
    | "failed";

export class SimulationController<TAlgorithm extends Algorithm> {
    private _state: SimulationState = "idle";
    private _activeAlgorithm?: TAlgorithm;
    private accumulatedMilliseconds = 0;

    constructor(
        public readonly algorithms: readonly TAlgorithm[],
        private readonly logger: Logger,
        private stepsPerSecond = 10
    ) {
        this._activeAlgorithm = algorithms[0];
        this._activeAlgorithm?.reset();
    }

    get state(): SimulationState {
        return this._state;
    }

    get activeAlgorithm(): TAlgorithm | undefined {
        return this._activeAlgorithm;
    }

    setStepsPerSecond(value: number): void {
        this.stepsPerSecond = Math.max(1, Math.min(60, value));
    }

    selectAlgorithm(id: string): boolean {
        const next = this.algorithms.find(algorithm => algorithm.id === id);

        if (!next) {
            this.logger.log(`Unknown algorithm: ${id}.`, "error");
            return false;
        }

        if (next === this._activeAlgorithm) {
            return true;
        }

        this._activeAlgorithm?.reset();
        next.reset();
        this._activeAlgorithm = next;
        this._state = "idle";
        this.accumulatedMilliseconds = 0;

        this.logger.log(`Selected ${next.name}.`);
        return true;
    }

    run(): void {
        const algorithm = this.requireActiveAlgorithm();
        if (!algorithm) return;

        const wasPaused =
            this._state === "paused" && algorithm.state === "running";

        if (algorithm.state !== "running") {
            if (!this.initializeActiveAlgorithm(algorithm)) {
                return;
            }
        }

        this._state = "running";
        this.accumulatedMilliseconds = 0;

        if (wasPaused) {
            this.logger.log(`Resumed ${algorithm.name}.`);
        }
    }

    update(deltaMilliseconds: number): void {
        if (this._state !== "running") return;
        if (!Number.isFinite(deltaMilliseconds) || deltaMilliseconds <= 0) return;

        const stepInterval = 1000 / this.stepsPerSecond;
        this.accumulatedMilliseconds += Math.min(deltaMilliseconds, 250);

        // Prevent a large browser delay from executing hundreds of steps at once.
        let stepsThisFrame = 0;
        const maximumStepsPerFrame = 8;

        while (
            this.accumulatedMilliseconds >= stepInterval &&
            this._state === "running" &&
            stepsThisFrame < maximumStepsPerFrame
        ) {
            this.accumulatedMilliseconds -= stepInterval;
            this.performStep();
            stepsThisFrame++;
        }
    }

    step(): void {
        const algorithm = this.requireActiveAlgorithm();
        if (!algorithm) return;

        if (this._state === "running") {
            this._state = "paused";
            this.accumulatedMilliseconds = 0;
            this.logger.log("Automatic playback paused for manual stepping.");
        }

        if (algorithm.state !== "running") {
            if (!this.initializeActiveAlgorithm(algorithm)) {
                return;
            }
        }

        this._state = "paused";
        this.performStep();
    }

    stop(): void {
        if (this._state !== "running") return;

        this._state = "paused";
        this.accumulatedMilliseconds = 0;
        this.logger.log("Simulation paused.");
    }

    clear(): void {
        const algorithm = this.requireActiveAlgorithm();
        if (!algorithm) return;

        algorithm.reset();
        this._state = "idle";
        this.accumulatedMilliseconds = 0;

        // Clear means clear the search visualization, not erase the console or grid.
        this.logger.log("Cleared the current search visualization.");
    }

    invalidate(reason = "The board changed; the previous search was cleared."): void {
        const algorithm = this._activeAlgorithm;
        if (!algorithm) return;

        const hadActiveSearch = this._state !== "idle";

        algorithm.reset();
        this._state = "idle";
        this.accumulatedMilliseconds = 0;

        if (hadActiveSearch) {
            this.logger.log(reason, "warning");
        }
    }

    private initializeActiveAlgorithm(algorithm: TAlgorithm): boolean {
        const event = algorithm.initialize();
        this.logEvent(event);

        if (algorithm.state !== "running") {
            this._state = algorithm.state === "failed" ? "failed" : "idle";
            return false;
        }

        return true;
    }

    private performStep(): void {
        const algorithm = this.requireActiveAlgorithm();
        if (!algorithm) return;

        const event = algorithm.step();
        this.logEvent(event);

        if (algorithm.state === "completed") {
            this._state = "completed";
            this.accumulatedMilliseconds = 0;
        } else if (algorithm.state === "failed") {
            this._state = "failed";
            this.accumulatedMilliseconds = 0;
        }
    }

    private logEvent(event: AlgorithmEvent): void {
        const levels: Record<AlgorithmEvent["type"], LogLevel> = {
            initialized: "info",
            progress: "info",
            completed: "success",
            failed: "warning",
            idle: "warning",
        };

        this.logger.log(event.message, levels[event.type]);
    }

    private requireActiveAlgorithm(): TAlgorithm | undefined {
        if (!this._activeAlgorithm) {
            this.logger.log("No algorithm is available.", "error");
            return undefined;
        }

        return this._activeAlgorithm;
    }
}

export class VisualizationSession<TWorld, TEditor extends Editor<TWorld>, TAlgorithm extends Algorithm> {
    public readonly simulation: SimulationController<TAlgorithm>;

    constructor(
        public readonly world: TWorld,
        public readonly editor: TEditor,
        algorithms: readonly TAlgorithm[],
        logger: Logger,
        stepsPerSecond = 10
    ) {
        this.simulation = new SimulationController(
            algorithms,
            logger,
            stepsPerSecond
        );
    }

    get algorithms(): readonly TAlgorithm[] {
        return this.simulation.algorithms;
    }

    get activeAlgorithm(): TAlgorithm | undefined {
        return this.simulation.activeAlgorithm;
    }

    get state(): SimulationState {
        return this.simulation.state;
    }

    update(deltaMilliseconds: number): void {
        this.simulation.update(deltaMilliseconds);
    }

    run(): void {
        this.simulation.run();
    }

    step(): void {
        this.simulation.step();
    }

    stop(): void {
        this.simulation.stop();
    }

    clear(): void {
        this.simulation.clear();
    }

    selectAlgorithm(id: string): boolean {
        return this.simulation.selectAlgorithm(id);
    }

    invalidateSimulation(reason?: string): void {
        this.simulation.invalidate(reason);
    }
}
