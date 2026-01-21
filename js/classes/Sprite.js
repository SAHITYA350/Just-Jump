class Sprite {
    constructor({
        position,
        imageSrc,
        frameRate = 1,
        frameBuffer = 3,
        scale = 1
    }) {
        this.position = position;
        this.scale = scale;
        this.loaded = false;
        this.image = new Image();
        this.image.onload = () => {
            this.width = (this.image.width / this.frameRate) * this.scale;
            this.height = this.image.height * this.scale;
            this.loaded = true;
        };
        this.image.onerror = () => {
            console.warn(`Failed to load image: ${imageSrc}`);
            // Create fallback colored rectangle
            this.loaded = true;
            this.width = 100 * this.scale;
            this.height = 100 * this.scale;
        };
        this.image.src = imageSrc;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.frameBuffer = frameBuffer;
        this.elapsedFrames = 0;
    }
    
    draw() {
        if (!this.loaded) return;
        
        const cropbox = {
            position: {
                x: this.currentFrame * (this.image.width / this.frameRate),
                y: 0
            },
            width: this.image.width / this.frameRate,
            height: this.image.height
        };
        
        // Use the context from window
        const ctx = window.gameContext;
        if (!ctx) return;
        
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(
                this.image,
                cropbox.position.x,
                cropbox.position.y,
                cropbox.width,
                cropbox.height,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        } else {
            // Fallback: draw colored rectangle
            ctx.fillStyle = '#4a90e2';
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
    
    update() {
        this.draw();
        this.updateFrames();
    }
    
    updateFrames() {
        this.elapsedFrames++;
        
        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) {
                this.currentFrame++;
            } else {
                this.currentFrame = 0;
            }
        }
    }
}