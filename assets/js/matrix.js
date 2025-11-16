// Wait for the DOM to be loaded
window.addEventListener('DOMContentLoaded', () => {

    /**
     * Creates a new Matrix rain animation on a given canvas.
     * @param {string} canvasId The ID of the canvas element.
     */
    function createMatrixRain(canvasId) {
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Matrix canvas element not found: #${canvasId}`);
            return; // Stop if canvas doesn't exist
        }

        const ctx = canvas.getContext('2d');

        let W, H;
        let columns;
        const characters = '0123456789ABCDEF'; // Simpler hex-style
        const fontSize = 16;
        let drops;

        function resizeCanvas() {
            // We get dimensions from the parent element, not the window
            W = canvas.parentElement.clientWidth;
            H = canvas.parentElement.clientHeight;
            canvas.width = W;
            canvas.height = H;
            
            columns = Math.floor(W / fontSize);
            drops = [];
            for (let i = 0; i < columns; i++) {
                drops.push(0);
            }
        }

        // Set up
        resizeCanvas();
        // We use ResizeObserver to check if the *parent* changes,
        // but window resize is a good fallback.
        window.addEventListener('resize', resizeCanvas);

        function draw() {
            // Fade out old characters
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, W, H);

            // Dim green for the rain
            ctx.fillStyle = '#004d00'; 
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > H && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        // Start the animation
        setInterval(draw, 50);
    }

    // --- END OF FUNCTION ---

    //
    // NOW, WE CALL THE FUNCTION FOR EACH CANVAS
    //
    createMatrixRain('matrix-canvas-1');
    createMatrixRain('matrix-canvas-2');
    createMatrixRain('matrix-canvas-3');
});