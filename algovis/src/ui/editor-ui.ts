import { Logger } from "../core/logger";
import { SimulationState, VisualizationSession } from "../core/session";
import { GridAlgorithm } from "../grid/grid-algorithm";
import { GridEditor, Tool } from "../grid/grid-editor";
import { GridWorld } from "../grid/grid-world";

type GridSession = VisualizationSession<
    GridWorld,
    GridEditor,
    GridAlgorithm
>;

export interface GridSize {
    cols: number;
    rows: number;
}

export interface EditorUIOptions {
    getGridSize(): GridSize;
    resizeGrid(cols: number, rows: number): void;
}

const MIN_GRID_SIZE = 5;
const MAX_GRID_SIZE = 200;

export class EditorUI {
    private readonly toolButtons = new Map<Tool, HTMLButtonElement>();
    private readonly algorithmButtons = new Map<string, HTMLButtonElement>();
    private readonly controlButtons = new Map<string, HTMLButtonElement>();
    private statusElement?: HTMLElement;
    private columnsInput?: HTMLInputElement;
    private rowsInput?: HTMLInputElement;

    constructor(
        private readonly editor: GridEditor,
        private readonly session: GridSession,
        private readonly logger: Logger,
        private readonly options: EditorUIOptions
    ) {}

    init(): void {
        this.createToolButtons();
        this.createSimulationControls();
        this.createGridSizeControls();
        this.createAlgorithmButtons();
        this.showDescription(this.session.activeAlgorithm);
        this.update();
    }

    update(): void {
        for (const [tool, button] of this.toolButtons) {
            this.setSelected(button, this.editor.tool === tool);
        }

        const activeId = this.session.activeAlgorithm?.id;
        for (const [id, button] of this.algorithmButtons) {
            this.setSelected(button, id === activeId);
        }

        const state = this.session.state;
        const runButton = this.controlButtons.get("run");
        const stopButton = this.controlButtons.get("stop");

        if (runButton) {
            runButton.disabled = state === "running";
            runButton.textContent = this.getRunLabel(state);
        }

        if (stopButton) {
            stopButton.disabled = state !== "running";
        }

        if (this.statusElement) {
            const algorithmName =
                this.session.activeAlgorithm?.name ?? "No algorithm";
            this.statusElement.textContent =
                `${algorithmName} · ${this.getStateLabel(state)}`;
            this.statusElement.dataset.state = state;
        }
    }

    syncGridSizeInputs(): void {
        const size = this.options.getGridSize();

        if (this.columnsInput) {
            this.columnsInput.value = String(size.cols);
        }

        if (this.rowsInput) {
            this.rowsInput.value = String(size.rows);
        }
    }

    private createToolButtons(): void {
        const panel = this.requireElement(["tool-panel"], "tool panel");
        this.removeGeneratedElements(panel);

        const tools: Array<[string, Tool]> = [
            ["Start", Tool.Start],
            ["Goal", Tool.Goal],
            ["Wall", Tool.Wall],
            ["Erase", Tool.Erase],
        ];

        for (const [label, tool] of tools) {
            const button = this.createButton(label, panel, () => {
                this.editor.setTool(tool);
                this.logger.log(`Selected ${label.toLowerCase()} tool.`);
                this.update();
            });

            button.classList.add("tool-button");
            this.toolButtons.set(tool, button);
        }
    }

    private createSimulationControls(): void {
        const panel = this.requireElement(
            ["simulation-panel"],
            "simulation panel"
        );
        this.removeGeneratedElements(panel);

        this.statusElement = document.createElement("span");
        this.statusElement.id = "simulation-status";
        this.statusElement.className = "simulation-status";
        this.statusElement.dataset.editorUi = "true";
        panel.appendChild(this.statusElement);

        this.controlButtons.set(
            "run",
            this.createButton(
                "Run",
                panel,
                () => {
                    this.session.run();
                    this.update();
                },
                "control-button",
                "control-button--run"
            )
        );

        this.controlButtons.set(
            "step",
            this.createButton(
                "Step",
                panel,
                () => {
                    this.session.step();
                    this.update();
                },
                "control-button"
            )
        );

        this.controlButtons.set(
            "stop",
            this.createButton(
                "Stop",
                panel,
                () => {
                    this.session.stop();
                    this.update();
                },
                "control-button",
                "control-button--stop"
            )
        );

        this.controlButtons.set(
            "clear",
            this.createButton(
                "Clear",
                panel,
                () => {
                    this.session.clear();
                    this.update();
                },
                "control-button",
                "control-button--clear"
            )
        );
    }

    private createGridSizeControls(): void {
        const panel =
            document.getElementById("grid-settings-panel") ??
            this.requireElement(["simulation-panel"], "simulation panel");

        if (panel.id === "grid-settings-panel") {
            this.removeGeneratedElements(panel);
        }

        const group = document.createElement("div");
        group.className = "grid-size-controls";
        group.dataset.editorUi = "true";

        const size = this.options.getGridSize();
        this.columnsInput = this.createNumberInput(
            "Columns",
            size.cols,
            group
        );
        this.rowsInput = this.createNumberInput("Rows", size.rows, group);

        this.createButton(
            "Resize grid",
            group,
            () => this.applyGridSize(),
            "grid-size-apply"
        );

        panel.appendChild(group);
    }

    private applyGridSize(): void {
        if (!this.columnsInput || !this.rowsInput) return;

        const cols = this.readGridDimension(this.columnsInput);
        const rows = this.readGridDimension(this.rowsInput);

        this.columnsInput.value = String(cols);
        this.rowsInput.value = String(rows);
        this.options.resizeGrid(cols, rows);
        this.syncGridSizeInputs();
        this.update();
    }

    private readGridDimension(input: HTMLInputElement): number {
        const parsed = Number.parseInt(input.value, 10);

        if (!Number.isFinite(parsed)) {
            return MIN_GRID_SIZE;
        }

        return Math.max(
            MIN_GRID_SIZE,
            Math.min(MAX_GRID_SIZE, parsed)
        );
    }

    private createNumberInput(
        label: string,
        value: number,
        parent: HTMLElement
    ): HTMLInputElement {
        const wrapper = document.createElement("label");
        wrapper.className = "grid-size-field";
        wrapper.dataset.editorUi = "true";

        const labelText = document.createElement("span");
        labelText.textContent = label;

        const input = document.createElement("input");
        input.type = "number";
        input.min = String(MIN_GRID_SIZE);
        input.max = String(MAX_GRID_SIZE);
        input.step = "1";
        input.value = String(value);
        input.inputMode = "numeric";
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                this.applyGridSize();
            }
        });

        wrapper.append(labelText, input);
        parent.appendChild(wrapper);
        return input;
    }

    private createAlgorithmButtons(): void {
        const panel = this.requireElement(
            ["algorithm-panel", "algorithms-panel"],
            "algorithm panel"
        );
        this.removeGeneratedElements(panel);

        for (const algorithm of this.session.algorithms) {
            const button = this.createButton(
                algorithm.name,
                panel,
                () => {
                    this.session.selectAlgorithm(algorithm.id);
                    this.showDescription(this.session.activeAlgorithm);
                    this.update();
                },
                "algorithm-button"
            );

            this.algorithmButtons.set(algorithm.id, button);
        }
    }

    private showDescription(algorithm?: GridAlgorithm): void {
        const title = document.getElementById("description-title");
        const content = document.getElementById("description-content");

        if (title) {
            title.textContent = algorithm?.name ?? "Algorithm";
        }

        if (content) {
            content.textContent =
                algorithm?.description ?? "Select an algorithm to continue.";
        }
    }

    private createButton(
        label: string,
        parent: HTMLElement,
        callback: () => void,
        ...classNames: string[]
    ): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.dataset.editorUi = "true";
        button.setAttribute("aria-pressed", "false");
        button.classList.add(...classNames);
        button.addEventListener("click", callback);
        parent.appendChild(button);
        return button;
    }

    private setSelected(button: HTMLButtonElement, selected: boolean): void {
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    }

    private removeGeneratedElements(parent: HTMLElement): void {
        parent
            .querySelectorAll<HTMLElement>("[data-editor-ui='true']")
            .forEach(element => element.remove());
    }

    private requireElement(ids: string[], label: string): HTMLElement {
        for (const id of ids) {
            const element = document.getElementById(id);
            if (element) return element;
        }

        throw new Error(
            `Missing ${label}. Expected one of: ${ids.map(id => `#${id}`).join(", ")}.`
        );
    }

    private getRunLabel(state: SimulationState): string {
        if (state === "paused") return "Resume";
        if (state === "completed" || state === "failed") return "Run Again";
        return "Run";
    }

    private getStateLabel(state: SimulationState): string {
        const labels: Record<SimulationState, string> = {
            idle: "Idle",
            running: "Running",
            paused: "Paused",
            completed: "Completed",
            failed: "No path / error",
        };

        return labels[state];
    }
}