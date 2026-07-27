export class Cell {
    constructor(
        public readonly col: number,
        public readonly row: number,
        public readonly size: number
    ) {}

    get x(): number {
        return this.col * this.size;
    }

    get y(): number {
        return this.row * this.size;
    }
}
