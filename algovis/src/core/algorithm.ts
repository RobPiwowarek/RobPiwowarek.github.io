export type AlgorithmState = "ready" | "running" | "completed" | "failed";

export type AlgorithmEventType =
    | "initialized"
    | "progress"
    | "completed"
    | "failed"
    | "idle";

export interface AlgorithmEvent {
    type: AlgorithmEventType;
    message: string;
}

export interface Algorithm {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    state: AlgorithmState;

    initialize(): AlgorithmEvent;
    step(): AlgorithmEvent;
    reset(): void;
}
