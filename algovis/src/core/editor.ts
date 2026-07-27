export interface Editor<TWorld> {
    readonly world: TWorld;
    onClick(...args: any[]): unknown;
}
