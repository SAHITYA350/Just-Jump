class CollisionBlock {
    constructor({ position, height = 16 }) {
        this.position = position;
        this.width = 16;
        this.height = height;
    }
    
    draw() {
        // Only draw if debug mode is enabled
        if (window.DEBUG_MODE) {
            const ctx = window.gameContext;
            if (ctx) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            }
        }
    }
    
    update() {
        this.draw();
    }
}