import p5 from "p5";

import { DomConsoleLogger } from "./core/logger";
import { VisualizationSession } from "./core/session";
import { BFSGridAlgorithm } from "./grid/algo/bfs";
import { DFSGridAlgorithm } from "./grid/algo/dfs";
import { Grid } from "./grid/grid";
import { GridAlgorithm } from "./grid/grid-algorithm";
import { GridCamera } from "./grid/grid-camera";
import { GridEditor, Tool } from "./grid/grid-editor";
import { GridRenderer } from "./grid/grid-renderer";
import { GridWorld } from "./grid/grid-world";
import { EditorUI } from "./ui/editor-ui";

/**
 * =============================================================================
 * APPLICATION ARCHITECTURE AND RUNTIME FLOW
 * =============================================================================
 *
 * This file is the composition root of the pathfinding visualizer. Its main
 * responsibility is to create the application's collaborating objects, connect
 * them to the HTML document and p5 lifecycle, and translate browser/pointer
 * events into domain-level operations.
 *
 * It intentionally does not contain the implementation of BFS, DFS, grid
 * editing rules, rendering details, or simulation state transitions. Those
 * responsibilities live in separate modules. Keeping app.ts focused on wiring
 * makes the prototype easier to extend without turning the p5 sketch into one
 * large controller containing every feature.
 *
 * -----------------------------------------------------------------------------
 * 1. HIGH-LEVEL OBJECT GRAPH
 * -----------------------------------------------------------------------------
 *
 * The application is assembled around the following objects:
 *
 *   Grid
 *     Owns the rectangular collection of Cell objects and provides coordinate
 *     lookup, dimensions, pixel dimensions, iteration, and neighbor discovery.
 *
 *   GridWorld
 *     Owns the mutable board state placed on top of a Grid: walls, the start
 *     cell, and the goal cell. It can replace its Grid during a resize while
 *     preserving board content whose column/row coordinates remain valid.
 *
 *   GridEditor
 *     Applies editing tools to GridWorld. It owns the selected tool and hovered
 *     cell and returns a structured result when a cell is edited. app.ts logs
 *     that result and invalidates an old search only when the board actually
 *     changed.
 *
 *   GridAlgorithm implementations
 *     BFSGridAlgorithm and DFSGridAlgorithm implement the common GridAlgorithm
 *     contract. Each algorithm owns transient search state such as its visited
 *     cells, frontier, current cell, predecessor map, and reconstructed path.
 *     Both algorithms reference the same GridWorld, but only the algorithm
 *     selected by the session is advanced.
 *
 *   VisualizationSession / SimulationController
 *     The session provides the public simulation API used by app.ts and the UI:
 *     run, step, stop, clear, selectAlgorithm, update, and invalidateSimulation.
 *     Its internal controller owns playback state and simulation timing. This
 *     separation is important: the p5 draw loop runs continuously, while the
 *     algorithm advances only when the simulation state permits it.
 *
 *   GridCamera
 *     Stores the translation between grid/world coordinates and canvas/screen
 *     coordinates. It supports centering, constrained panning, applying the
 *     render transform, and reversing the transform for pointer hit testing.
 *
 *   GridRenderer
 *     Draws the current world and active algorithm through the GridCamera. It
 *     reads application state but does not mutate it. The renderer visualizes
 *     the board background, visited cells, frontier, final path, walls, start,
 *     goal, current cell, hover state, and grid lines.
 *
 *   EditorUI
 *     Creates and updates DOM controls for editing tools, simulation controls,
 *     grid dimensions, algorithm selection, descriptions, and simulation
 *     status. It calls the session's public methods rather than controlling an
 *     algorithm directly.
 *
 *   DomConsoleLogger
 *     Writes timestamped messages to the application's custom console panel.
 *     app.ts and the simulation layer use this logger instead of relying on the
 *     browser console for normal user-facing feedback.
 *
 * -----------------------------------------------------------------------------
 * 2. CONSTANTS AND SESSION TYPE
 * -----------------------------------------------------------------------------
 *
 * CELL_SIZE defines the pixel width and height of every logical cell. Grid
 * dimensions are expressed as columns and rows, but panning and rendering use
 * pixels, so CELL_SIZE is also the conversion factor between cell coordinates
 * and world-space pixel coordinates.
 *
 * FALLBACK_WIDTH and FALLBACK_HEIGHT are used only when the canvas container
 * has no measurable client size during startup. They prevent createCanvas()
 * from receiving a zero-sized viewport.
 *
 * STEPS_PER_SECOND configures automatic playback. Rendering is not restricted
 * to this speed; only algorithm advancement is. The renderer can continue to
 * draw at the browser/p5 frame rate while the simulation controller advances at
 * the configured logical step rate.
 *
 * GridSession is a local type alias that binds the generic session to this
 * concrete application: GridWorld, GridEditor, and GridAlgorithm.
 *
 * -----------------------------------------------------------------------------
 * 3. P5 INSTANCE MODE AND LIFETIME
 * -----------------------------------------------------------------------------
 *
 * The sketch uses p5 instance mode (`new p5(p => { ... })`). All p5 callbacks
 * and p5 state are accessed through the local `p` object. This avoids global p5
 * functions and keeps the sketch isolated from the rest of the page.
 *
 * The variables declared at the top of the sketch callback are created during
 * setup and shared by later p5 callbacks:
 *
 *   session          application state and simulation control
 *   renderer         canvas rendering
 *   ui               DOM control creation and synchronization
 *   logger           custom console output
 *   camera           grid-to-screen transform and panning state
 *   canvasContainer  measured host element for the p5 canvas
 *   isPanning        interaction state for a right-button drag
 *   resizeObserver   observes layout-driven canvas size changes
 *
 * The application is designed as a page-lifetime sketch, so the observer and
 * global mouseup listener are not currently removed. If this sketch is later
 * mounted/unmounted by a framework or recreated during custom hot-reload logic,
 * add an explicit cleanup path that disconnects the ResizeObserver, removes the
 * window listener, and calls the appropriate p5 removal method.
 *
 * -----------------------------------------------------------------------------
 * 4. SETUP SEQUENCE
 * -----------------------------------------------------------------------------
 *
 * p.setup performs dependency construction in a deliberate order:
 *
 *   1. Resolve required DOM elements.
 *      requireElement() fails immediately with a useful error when an expected
 *      mount point is missing instead of allowing a later null-reference error.
 *
 *   2. Measure the canvas viewport.
 *      measureViewport() reads the canvas container's current client size and
 *      applies fallback dimensions when necessary.
 *
 *   3. Create and mount the p5 canvas.
 *      The returned renderer element is attached to #canvas-container. The
 *      browser context menu is disabled only on this canvas so right-button
 *      dragging can be reserved for panning without disabling context menus for
 *      the entire page. A CSS class is added for canvas-specific styling.
 *
 *   4. Create the initial logical grid.
 *      Initial column and row counts are derived from the viewport size and
 *      CELL_SIZE, with a minimum of five cells on each axis. The canvas is the
 *      viewport; the Grid is the world being viewed. They are related but are
 *      intentionally not the same object and do not always have the same size.
 *
 *   5. Create GridWorld and GridEditor.
 *      The world owns the grid and board contents. The editor provides all
 *      user-facing board mutations.
 *
 *   6. Create logging and camera services.
 *      The camera starts centered on the grid. If the grid is smaller than the
 *      viewport it remains centered; if it is larger, its offset is constrained
 *      so the viewport cannot pan beyond the board's edges.
 *
 *   7. Construct available algorithms.
 *      BFS and DFS share the same GridWorld reference. They therefore see the
 *      latest walls, start, goal, and replacement Grid whenever a simulation is
 *      initialized.
 *
 *   8. Construct VisualizationSession.
 *      The session receives the algorithms, logger, and step rate. It selects an
 *      initial algorithm and becomes the single public simulation interface for
 *      app.ts and EditorUI.
 *
 *   9. Construct GridRenderer and EditorUI.
 *      EditorUI receives two callbacks instead of owning resize logic directly:
 *      one callback reads the current grid size and the other requests a resize.
 *      This keeps canvas/camera coordination in app.ts while allowing the UI to
 *      remain a DOM-focused component.
 *
 *  10. Observe container size changes.
 *      ResizeObserver handles layout-driven changes, while p.windowResized is a
 *      second entry point for browser-window changes. resizeCanvasToContainer()
 *      includes an equality guard, so duplicate notifications are harmless.
 *
 *  11. Register a window-level right-button mouseup fallback.
 *      A drag can begin inside the canvas and end outside it. The window listener
 *      ensures the application exits panning mode even when p5 does not receive
 *      the final release over the canvas.
 *
 * -----------------------------------------------------------------------------
 * 5. FRAME LOOP: UPDATE, RENDER, UI SYNCHRONIZATION
 * -----------------------------------------------------------------------------
 *
 * p.draw deliberately performs three separate phases:
 *
 *   session.update(p.deltaTime)
 *     Advances automatic playback according to elapsed real time. The session
 *     ignores this call unless its state is `running`. The controller accumulates
 *     milliseconds and advances at STEPS_PER_SECOND instead of executing one
 *     algorithm step per rendered frame. This keeps simulation speed independent
 *     of monitor refresh rate and p5 rendering performance.
 *
 *   renderer.draw(p, session)
 *     Draws a snapshot of the current state. Rendering occurs even when the
 *     simulation is idle or paused, which keeps hover feedback, panning, resized
 *     layouts, and manual steps immediately visible.
 *
 *   ui.update()
 *     Synchronizes button selection, enabled/disabled states, labels, and status
 *     text with the current editor and simulation state. Calling this each frame
 *     is simple and acceptable for the prototype because the number of controls
 *     is small. A larger application could replace this polling-style update with
 *     event-driven UI notifications.
 *
 * -----------------------------------------------------------------------------
 * 6. SIMULATION CONTROL SEMANTICS
 * -----------------------------------------------------------------------------
 *
 * The simulation lifecycle is owned by VisualizationSession rather than p5:
 *
 *   Run
 *     Initializes the active algorithm when necessary, or resumes a paused
 *     running algorithm. Initialization can fail when start/goal data is invalid.
 *
 *   Step
 *     Performs exactly one logical algorithm step. If automatic playback was
 *     active, the controller pauses it first so one click cannot race with the
 *     timed update loop.
 *
 *   Stop
 *     Pauses automatic playback but preserves all visited/frontier/path state.
 *
 *   Clear
 *     Resets the active algorithm's search visualization. It does not erase the
 *     grid, walls, start, goal, or custom console history.
 *
 *   invalidateSimulation
 *     Resets stale algorithm state after a board mutation or grid resize. Search
 *     structures contain Cell references, so they must not survive a structural
 *     board change.
 *
 * -----------------------------------------------------------------------------
 * 7. COORDINATE SPACES AND CAMERA TRANSFORMS
 * -----------------------------------------------------------------------------
 *
 * The application uses three related coordinate systems:
 *
 *   Screen/canvas coordinates
 *     p.mouseX and p.mouseY are measured relative to the visible canvas.
 *
 *   World pixel coordinates
 *     Grid cells are positioned in an untransformed board coordinate space.
 *     Cell.x and Cell.y are calculated from column/row and cell size.
 *
 *   Grid coordinates
 *     Integer column and row indices identify logical cells.
 *
 * Rendering moves from world space to screen space by calling camera.apply(),
 * which translates the p5 drawing context by the camera offset.
 *
 * Hit testing must perform the inverse operation. cellAtPointer() calls
 * camera.screenToWorld(mouseX, mouseY), divides the resulting world position by
 * the grid's cell size, floors both values, and asks Grid.get(col, row) for the
 * matching Cell.
 *
 * This inverse transform is essential. Without it, the grid image could pan but
 * editing and hover detection would continue targeting the unshifted board.
 * Any future zoom feature must update both sides of this relationship: rendering
 * must apply scale, and pointer hit testing must apply the inverse scale.
 *
 * -----------------------------------------------------------------------------
 * 8. POINTER INPUT ROUTING
 * -----------------------------------------------------------------------------
 *
 * Pointer behavior is intentionally divided by mouse button and editor tool:
 *
 *   Mouse movement
 *     While not panning, updateHoveredCell() maps the pointer through the camera
 *     and updates GridEditor.hovered. Leaving the canvas clears the hover state.
 *
 *   Right-button press
 *     Starts panning only when the press begins inside the canvas. Hover state is
 *     cleared, the cursor changes to `grabbing`, and returning false prevents
 *     p5/browser default handling for the gesture.
 *
 *   Right-button drag
 *     p.movedX and p.movedY are added to the camera offset. GridCamera.constrain()
 *     prevents overscrolling beyond a large board and keeps a small board centered.
 *     The use of `isPanning || p.mouseButton.right` makes the drag robust after
 *     the initial right press establishes the gesture.
 *
 *   Right-button release
 *     finishPanning() restores the crosshair cursor and recalculates hover using
 *     the camera's final position. It may be reached through p.mouseReleased or
 *     the window-level mouseup fallback.
 *
 *   Left-button press
 *     Performs one editor action on the cell under the pointer.
 *
 *   Left-button drag
 *     Repeats editing only for Wall and Erase tools. Start and Goal are excluded
 *     from drag painting so they remain deliberate single-cell placements.
 *
 * The current p5 mouse API exposes button state through boolean properties such
 * as p.mouseButton.left and p.mouseButton.right. Cursor changes use p.cursor(),
 * avoiding reliance on an internal p.canvas property that may not be present in
 * the installed p5 typings.
 *
 * -----------------------------------------------------------------------------
 * 9. BOARD EDITING AND SEARCH INVALIDATION
 * -----------------------------------------------------------------------------
 *
 * editCellAtPointer() is the only app.ts path that applies a pointer edit:
 *
 *   1. Convert the current pointer to a Cell.
 *   2. Delegate the mutation to GridEditor.onClick(cell).
 *   3. Log the editor's message and severity through DomConsoleLogger.
 *   4. Invalidate the active simulation only when result.changed is true.
 *
 * Delegating rules to GridEditor keeps app.ts unaware of details such as whether
 * a wall may overlap start/goal or how erase behaves. Using result.changed avoids
 * clearing a search after a no-op click.
 *
 * -----------------------------------------------------------------------------
 * 10. LOGICAL GRID RESIZING
 * -----------------------------------------------------------------------------
 *
 * Grid resizing is different from canvas resizing:
 *
 *   - Canvas resizing changes only the visible viewport.
 *   - Grid resizing changes the logical number of cells in the world.
 *
 * resizeGrid(cols, rows) follows this order:
 *
 *   1. Return early and log a warning when the requested size is unchanged.
 *
 *   2. Invalidate the current simulation before replacing the grid.
 *      This ordering is important because algorithm frontiers, visited sets,
 *      paths, and predecessor maps hold references to the current Cell objects.
 *
 *   3. Call GridWorld.resize().
 *      Resizing creates a new Grid and therefore a new set of Cell instances.
 *      GridWorld preserves walls, start, and goal by remapping their column/row
 *      coordinates into cells from the new Grid. Content outside smaller bounds
 *      is discarded and described by the returned GridResizeResult.
 *
 *   4. Clear hover state because it may refer to a Cell from the previous Grid.
 *
 *   5. Recenter the camera on the resized board.
 *
 *   6. Synchronize the UI inputs and log exactly what was preserved or removed.
 *
 * Because algorithms keep a reference to GridWorld rather than a permanent Grid,
 * they automatically see world.grid after replacement when next initialized.
 *
 * -----------------------------------------------------------------------------
 * 11. CANVAS / VIEWPORT RESIZING
 * -----------------------------------------------------------------------------
 *
 * resizeCanvasToContainer() remeasures #canvas-container and resizes only the p5
 * canvas. It does not rebuild the Grid and therefore does not destroy the board.
 *
 * After p.resizeCanvas(), the camera is constrained again because the valid pan
 * range depends on both viewport dimensions and board pixel dimensions. A board
 * that becomes smaller than the new viewport is centered; a board that remains
 * larger keeps its offset within the new legal range.
 *
 * -----------------------------------------------------------------------------
 * 12. DOM CONTRACT
 * -----------------------------------------------------------------------------
 *
 * app.ts directly requires:
 *
 *   #canvas-container
 *   #console-output
 *
 * EditorUI additionally expects:
 *
 *   #tool-panel
 *   #simulation-panel
 *   #algorithm-panel or #algorithms-panel
 *   #description-content
 *
 * Optional integration points are:
 *
 *   #grid-settings-panel   dedicated parent for grid-size controls
 *   #description-title     heading updated to the selected algorithm name
 *
 * EditorUI creates #simulation-status dynamically. The existing header element
 * #algorithm-status is not currently updated by this app.ts implementation.
 *
 * -----------------------------------------------------------------------------
 * 13. IMPORTANT INVARIANTS
 * -----------------------------------------------------------------------------
 *
 * The following rules should remain true as features are added:
 *
 *   - Rendering never advances an algorithm by itself.
 *   - Only VisualizationSession controls simulation playback state.
 *   - Only the selected algorithm is advanced and rendered as active.
 *   - Board mutations invalidate transient search state.
 *   - Grid replacement invalidates every old Cell reference.
 *   - Camera transforms are applied consistently to drawing and hit testing.
 *   - Canvas resizing must not silently resize or erase the logical grid.
 *   - Grid resizing must preserve content by coordinates, not old Cell identity.
 *   - User-facing runtime information goes through the custom Logger.
 *   - GridRenderer reads state but does not mutate application state.
 *   - EditorUI issues commands through session/editor APIs rather than modifying
 *     algorithm internals directly.
 *
 * -----------------------------------------------------------------------------
 * 14. EXTENSION POINTS
 * -----------------------------------------------------------------------------
 *
 * New pathfinding algorithms can be added by implementing GridAlgorithm, creating
 * an instance with the shared GridWorld, and adding it to the algorithms array.
 * EditorUI generates selection buttons from that array, and GridRenderer can draw
 * it without an algorithm-specific instanceof check as long as it exposes the
 * common visited/frontier/path/current visualization state.
 *
 * A speed control should call the session/controller step-rate setter rather than
 * changing p5 frameRate(). Frame rate controls visual refresh; steps per second
 * controls simulation time.
 *
 * Zooming should be implemented inside GridCamera and must provide a complete
 * forward/inverse transform pair. Panning constraints must then account for the
 * scaled board dimensions.
 *
 * Keyboard shortcuts should invoke the same session and editor methods used by
 * EditorUI so mouse and keyboard behavior cannot diverge.
 *
 * Undo/redo should record GridWorld mutations at the editor/domain boundary,
 * rather than attempting to infer changes from rendered pixels or DOM controls.
 *
 * =============================================================================
 */

const CELL_SIZE = 32;
const FALLBACK_WIDTH = 960;
const FALLBACK_HEIGHT = 576;
const STEPS_PER_SECOND = 10;

type GridSession = VisualizationSession<GridWorld, GridEditor, GridAlgorithm>;

// todo: this is also creating specificly grid version, in case something else gets created later it might make sense to move it to a containing GridApp?
new p5(p => {
    let session: GridSession;
    let renderer: GridRenderer;
    let ui: EditorUI;
    let logger: DomConsoleLogger;
    let camera: GridCamera;
    let canvasContainer: HTMLElement;
    let isPanning = false;
    let resizeObserver: ResizeObserver | undefined;

    p.setup = () => {
        canvasContainer = requireElement("canvas-container");
        const consoleOutput = requireElement("console-output");
        const viewport = measureViewport(canvasContainer);

        const canvas = p.createCanvas(viewport.width, viewport.height);
        canvas.parent(canvasContainer);
        canvas.elt.addEventListener("contextmenu", event => {
            event.preventDefault();
        });
        canvas.elt.classList.add("visualizer-canvas");

        const initialCols = 10; // Math.max(5, Math.floor(viewport.width / CELL_SIZE));
        const initialRows = 10; // Math.max(5, Math.floor(viewport.height / CELL_SIZE));
        const grid = Grid.fromCellCount(initialCols, initialRows, CELL_SIZE);
        const world = new GridWorld(grid);
        const editor = new GridEditor(world);

        logger = new DomConsoleLogger(consoleOutput);
        camera = new GridCamera();
        // todo: constructor arguments?
        camera.center(p.width, p.height, grid);

        const algorithms: GridAlgorithm[] = [
            new BFSGridAlgorithm(world),
            new DFSGridAlgorithm(world),
        ];

        session = new VisualizationSession(world, editor, algorithms, logger, STEPS_PER_SECOND);

        renderer = new GridRenderer(camera);
        // todo: move to a new class GridEditorUI?
        ui = new EditorUI(editor, session, logger, {
            getGridSize: () => ({
                cols: world.grid.cols,
                rows: world.grid.rows,
            }),
            resizeGrid: (cols, rows) => resizeGrid(cols, rows),
        });
        ui.init();

        // todo: resize and panning should be encapsulated into something else, maybe grid editor ui or visualization session, but it feels like tool and behaviour of specific editor ui
        resizeObserver = new ResizeObserver(() => {
            resizeCanvasToContainer();
        });
        resizeObserver.observe(canvasContainer);

        window.addEventListener("mouseup", event => {
            if (event.button === 2) finishPanning();
        });

        // todo: this specific information is specific to this specific implementation of panning, maybe we can allow a tool no to pan at some point, at the very least move this message somewhere else
        logger.log(`Visualizer ready: ${grid.cols} × ${grid.rows} cells. ` + "Use the right mouse button to pan.");
    };

    p.draw = () => {
        if (!session) return;

        session.update(p.deltaTime);
        renderer.draw(p, session);
        ui.update();
    };

    // todo: handling mouse events should be part of editor ui or visualization session but not the app
    p.mouseMoved = () => {
        if (!session || isPanning) return;
        updateHoveredCell();
    };

    p.mousePressed = () => {
        if (!session || !isPointerInsideCanvas()) return;

        if (p.mouseButton.right) {
            isPanning = true;
            session.editor.hovered = undefined;
            setCanvasCursor("grabbing");
            return false;
        }

        if (p.mouseButton.left) {
            editCellAtPointer();
        }
    };

    p.mouseDragged = () => {
        if (!session) return;

        if (isPanning || p.mouseButton.right) {
            isPanning = true;
            camera.panBy(p.movedX, p.movedY, p.width, p.height, session.world.grid);
            session.editor.hovered = undefined;
            setCanvasCursor("grabbing");
            return false;
        }

        if (!isPointerInsideCanvas()) return;

        if (p.mouseButton.left && (session.editor.tool === Tool.Wall || session.editor.tool === Tool.Erase)) {
            editCellAtPointer();
        }
    };

    p.mouseReleased = () => {
        if (!session) return;

        if (isPanning) {
            finishPanning();
            return false;
        }
    };

    p.windowResized = () => {
        resizeCanvasToContainer();
    };

    // todo: resize and panning shouldnt be part of this app
    function finishPanning(): void {
        if (!session || !isPanning) return;

        isPanning = false;
        setCanvasCursor("crosshair");
        updateHoveredCell();
    }

    function resizeGrid(cols: number, rows: number): void {
        const current = session.world.grid;

        if (current.cols === cols && current.rows === rows) {
            logger.log(
                `Grid is already ${current.cols} × ${current.rows} cells.`,
                "warning"
            );
            return;
        }

        session.invalidateSimulation(
            "Grid dimensions changed; the previous search was cleared."
        );

        const result = session.world.resize(cols, rows);
        session.editor.hovered = undefined;
        camera.center(p.width, p.height, session.world.grid);
        ui.syncGridSizeInputs();

        const removed: string[] = [];
        if (result.removedWalls > 0) {
            removed.push(`${result.removedWalls} wall(s)`);
        }
        if (result.removedStart) removed.push("the start cell");
        if (result.removedGoal) removed.push("the goal cell");

        const suffix = removed.length > 0
            ? ` Removed outside the new bounds: ${removed.join(", ")}.`
            : " Existing board content inside the new bounds was preserved.";

        logger.log(
            `Resized grid from ${result.previousCols} × ${result.previousRows} ` +
            `to ${result.cols} × ${result.rows}.${suffix}`
        );
    }

    function resizeCanvasToContainer(): void {
        if (!session || !canvasContainer) return;

        const viewport = measureViewport(canvasContainer);
        if (viewport.width === p.width && viewport.height === p.height) return;

        p.resizeCanvas(viewport.width, viewport.height);
        camera.constrain(p.width, p.height, session.world.grid);
    }

    function updateHoveredCell(): void {
        if (!isPointerInsideCanvas()) {
            session.editor.hovered = undefined;
            return;
        }

        session.editor.hovered = cellAtPointer();
    }

    function editCellAtPointer(): void {
        const cell = cellAtPointer();
        if (!cell) return;

        const result = session.editor.onClick(cell);
        logger.log(result.message, result.level);

        if (result.changed) {
            session.invalidateSimulation();
        }
    }

    function cellAtPointer() {
        const worldPoint = camera.screenToWorld(p.mouseX, p.mouseY);
        const cellSize = session.world.grid.cellSize;
        const col = Math.floor(worldPoint.x / cellSize);
        const row = Math.floor(worldPoint.y / cellSize);
        return session.world.grid.get(col, row);
    }

    function isPointerInsideCanvas(): boolean {
        return (
            p.mouseX >= 0 &&
            p.mouseY >= 0 &&
            p.mouseX < p.width &&
            p.mouseY < p.height
        );
    }

    function setCanvasCursor(cursor: "crosshair" | "grabbing"): void {
        p.cursor(cursor);
    }
});

function requireElement(id: string): HTMLElement {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Missing required element #${id}.`);
    }

    return element;
}

function measureViewport(container: HTMLElement): { width: number; height: number; } {
    return {
        width: Math.max(1, Math.floor(container.clientWidth || FALLBACK_WIDTH)),
        height: Math.max(1, Math.floor(container.clientHeight || FALLBACK_HEIGHT)),
    };
}                            