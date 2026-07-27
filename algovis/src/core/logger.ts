export type LogLevel = "info" | "success" | "warning" | "error";

export interface Logger {
    log(message: string, level?: LogLevel): void;
    clear(): void;
}

export class DomConsoleLogger implements Logger {
    constructor(
        private readonly output: HTMLElement,
        private readonly maximumEntries = 250
    ) {}

    log(message: string, level: LogLevel = "info"): void {
        const line = document.createElement("div");
        line.className = `console-line console-line--${level}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

        this.output.appendChild(line);

        while (this.output.childElementCount > this.maximumEntries) {
            this.output.firstElementChild?.remove();
        }

        this.output.scrollTop = this.output.scrollHeight;
    }

    clear(): void {
        this.output.replaceChildren();
    }
}
