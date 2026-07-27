import type p5 from "p5";

import {Grid} from "./grid";

export interface WorldPoint {
    x: number;
    y: number;
}

/**
 * Camera for a fixed-size canvas viewport looking at a potentially larger grid.
 * Offsets are stored in screen pixels and are applied before the grid is drawn.
 */
export class GridCamera {
    private _offsetX = 0;
    private _offsetY = 0;

    get offsetX(): number {
        return this._offsetX;
    }

    get offsetY(): number {
        return this._offsetY;
    }

    apply(p: p5): void {
        p.translate(this._offsetX, this._offsetY);
    }

    screenToWorld(screenX: number, screenY: number): WorldPoint {
        return {
            x: screenX - this._offsetX,
            y: screenY - this._offsetY,
        };
    }

    panBy(
        deltaX: number,
        deltaY: number,
        viewportWidth: number,
        viewportHeight: number,
        grid: Grid
    ): void {
        this._offsetX += deltaX;
        this._offsetY += deltaY;
        this.constrain(viewportWidth, viewportHeight, grid);
    }

    center(
        viewportWidth: number,
        viewportHeight: number,
        grid: Grid
    ): void {
        this._offsetX = (viewportWidth - grid.pixelWidth) / 2;
        this._offsetY = (viewportHeight - grid.pixelHeight) / 2;
        this.constrain(viewportWidth, viewportHeight, grid);
    }

    constrain(viewportWidth: number, viewportHeight: number, grid: Grid): void {
        this._offsetX = this.constrainAxis(
            this._offsetX,
            viewportWidth,
            grid.pixelWidth
        );
        this._offsetY = this.constrainAxis(
            this._offsetY,
            viewportHeight,
            grid.pixelHeight
        );
    }

    private constrainAxis(offset: number, viewportSize: number, contentSize: number): number {
        if (contentSize <= viewportSize) {
            return (viewportSize - contentSize) / 2;
        }

        return Math.max(viewportSize - contentSize, Math.min(0, offset));
    }
}