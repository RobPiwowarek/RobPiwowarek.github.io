const canvas = document.getElementById('matrix-rain-canvas');
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#00FF00'; // Green text
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
setInterval(draw, 33); // Approximately 30 frames per second