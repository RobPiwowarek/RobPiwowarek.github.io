// Wait for the DOM (all the HTML) to be fully loaded before running the script
window.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('matrix-rain-canvas');
    // If the canvas element still isn't found, stop the script to prevent errors
    if (!canvas) {
        console.error("Matrix canvas element not found!");
        return;
    }

    const ctx = canvas.getContext('2d');

    let W, H;
    let columns;
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
    const fontSize = 16;
    let drops;

    function resizeCanvas() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        columns = Math.floor(W / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops.push(0);
        }
    }

    // Initial resize and set up
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function draw() {
        // Semi-transparent black rectangle to fade out old characters
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Increased fade effect
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#004d00'; // DIM green text
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Send the drop back to the top randomly
            if (drops[i] * fontSize > H && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Increment y-coordinate
            drops[i]++;
        }
    }

    // Start the animation
    setInterval(draw, 50); // Slowed down animation slightly for less CPU

});