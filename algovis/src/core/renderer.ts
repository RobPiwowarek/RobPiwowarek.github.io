import p5 from "p5";

export interface Renderer<TSession> {
    draw(p: p5, session: TSession): void;
}
