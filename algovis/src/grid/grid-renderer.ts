import p5 from "p5";

import { Renderer } from "../core/renderer";
import { VisualizationSession } from "../core/session";
import { Cell } from "./cell";
import { GridAlgorithm } from "./grid-algorithm";
import { GridCamera } from "./grid-camera";
import { GridEditor } from "./grid-editor";
import { GridWorld } from "./grid-world";

type GridSession = VisualizationSession<
    GridWorld,
    GridEditor,
    GridAlgorithm
>;

export class GridRenderer implements Renderer<GridSession> {
    constructor(private readonly camera: GridCamera) {}

    draw(p: p5, session: GridSession): void {
        p.background(18, 22, 29);

        p.push();
        this.camera.apply(p);
        this.drawBoardBackground(p, session.world);

        const algorithm = session.activeAlgorithm;

        if (algorithm) {
            this.drawCollection(p, algorithm.visited, [48, 120, 220, 115]);
            this.drawCollection(p, algorithm.frontier, [245, 181, 45, 150]);
            this.drawCollection(p, algorithm.path, [168, 85, 247, 210]);
        }

        for (const wall of session.world.walls) {
            this.fillCell(p, wall, [74, 85, 104, 255]);
        }

        if (session.world.start) {
            this.drawMarker(p, session.world.start, [34, 197, 94, 255], "S");
        }

        if (session.world.goal) {
            this.drawMarker(p, session.world.goal, [239, 68, 68, 255], "G");
        }

        this.drawGridLines(p, session.world);

        if (algorithm?.current) {
            p.push();
            p.noFill();
            p.stroke(255);
            p.strokeWeight(3);
            p.rect(
                algorithm.current.x + 2,
                algorithm.current.y + 2,
                algorithm.current.size - 4,
                algorithm.current.size - 4
            );
            p.pop();
        }

        const hovered = session.editor.hovered;
        if (hovered) {
            p.push();
            p.fill(255, 255, 255, 35);
            p.stroke(255, 255, 255, 150);
            p.strokeWeight(1);
            p.rect(hovered.x, hovered.y, hovered.size, hovered.size);
            p.pop();
        }

        p.pop();
    }

    private drawBoardBackground(p: p5, world: GridWorld): void {
        p.push();
        p.noStroke();
        p.fill(24, 29, 38);
        p.rect(0, 0, world.grid.pixelWidth, world.grid.pixelHeight);
        p.pop();
    }

    private drawCollection(
        p: p5,
        cells: Iterable<Cell>,
        color: [number, number, number, number]
    ): void {
        for (const cell of cells) {
            this.fillCell(p, cell, color);
        }
    }

    private fillCell(
        p: p5,
        cell: Cell,
        color: [number, number, number, number]
    ): void {
        p.push();
        p.noStroke();
        p.fill(...color);
        p.rect(cell.x, cell.y, cell.size, cell.size);
        p.pop();
    }

    private drawMarker(
        p: p5,
        cell: Cell,
        color: [number, number, number, number],
        label: string
    ): void {
        p.push();
        p.noStroke();
        p.fill(...color);
        p.rect(cell.x, cell.y, cell.size, cell.size);

        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(Math.max(12, cell.size * 0.45));
        p.text(label, cell.x + cell.size / 2, cell.y + cell.size / 2);
        p.pop();
    }

    private drawGridLines(p: p5, world: GridWorld): void {
        const { grid } = world;

        p.push();
        p.stroke(61, 72, 90, 180);
        p.strokeWeight(1);

        for (let col = 0; col <= grid.cols; col++) {
            const x = col * grid.cellSize;
            p.line(x, 0, x, grid.pixelHeight);
        }

        for (let row = 0; row <= grid.rows; row++) {
            const y = row * grid.cellSize;
            p.line(0, y, grid.pixelWidth, y);
        }

        p.pop();
    }
}