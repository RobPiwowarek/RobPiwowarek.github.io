export type LogLevel = "info" | "success" | "warning";

export class ConsoleOutput {
    constructor(
        private readonly element: HTMLElement,
        private readonly maxEntries = 200
    ) {}

    log(message: string, level: LogLevel = "info"): void {
        const line = document.createElement("div");
        line.className = `console-line console-line--${level}`;

        const timestamp = new Date().toLocaleTimeString();

        line.textContent = `[${timestamp}] ${message}`;
        this.element.appendChild(line);

        while (this.element.childElementCount > this.maxEntries) {
            this.element.firstElementChild?.remove();
        }

        this.element.scrollTop = this.element.scrollHeight;
    }

    clear(): void {
        this.element.replaceChildren();
    }
}