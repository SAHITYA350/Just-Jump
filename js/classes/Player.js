class Player extends Sprite {
    constructor({
        position,
        collisionBlocks,
        platformCollisionBlocks,
        imageSrc,
        frameRate,
        scale = 0.5,
        animations
    }) {
        super({ imageSrc, frameRate, scale });
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0
        };
        
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: CONFIG.player.hitboxWidth,
            height: CONFIG.player.hitboxHeight
        };
        
        this.animations = animations;
        this.lastDirection = 'right';
        
        // Physics properties
        this.isGrounded = false;
        this.canJump = true;
        this.jumpCount = 0;
        this.maxJumps = 1; // Single jump only
        
        // Fall detection
        this.lastGroundedY = position.y;
        this.fallStartY = null;
        this.isFalling = false;
        this.maxHeight = 0;
        
        // Movement
        this.isMoving = false;
        this.wasMoving = false;
        
        // Score
        this.score = 0;
        
        // Load animations
        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;
            this.animations[key].image = image;
        }
        
        this.camerabox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: 200,
            height: 80
        };
    }
    
    switchSprite(key) {
        if (this.image === this.animations[key].image || !this.loaded) return;
        
        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameRate;
    }
    
    updateCamerabox() {
        this.camerabox = {
            position: {
                x: this.position.x - 50,
                y: this.position.y
            },
            width: 200,
            height: 80
        };
    }
    
    checkForHorizontalCanvasCollision() {
        if (
            this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
            this.hitbox.position.x + this.velocity.x <= 0
        ) {
            this.velocity.x = 0;
        }
    }
    
    shouldPanCameraToTheLeft({ canvas, camera }) {
        const cameraboxRightSide = this.camerabox.position.x + this.camerabox.width;
        const scaledDownCanvasWidth = canvas.width / 4;
        
        if (cameraboxRightSide >= 576) return;
        
        if (cameraboxRightSide >= scaledDownCanvasWidth + Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }
    
    shouldPanCameraToTheRight({ canvas, camera }) {
        if (this.camerabox.position.x <= 0) return;
        
        if (this.camerabox.position.x <= Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }
    
    shouldPanCameraDown({ camera, canvas }) {
        if (this.camerabox.position.y + this.velocity.y <= 0) return;
        
        if (this.camerabox.position.y <= Math.abs(camera.position.y)) {
            camera.position.y -= this.velocity.y;
        }
    }
    
    shouldPanCameraUp({ camera, canvas }) {
        if (this.camerabox.position.y + this.camerabox.height + this.velocity.y >= 432) return;
        
        const scaledCanvasHeight = canvas.height / 4;
        
        if (
            this.camerabox.position.y + this.camerabox.height >=
            Math.abs(camera.position.y) + scaledCanvasHeight
        ) {
            camera.position.y -= this.velocity.y;
        }
    }
    
    jump() {
        // Only allow jump if grounded
        if (this.isGrounded && this.canJump) {
            this.velocity.y = CONFIG.physics.jumpForce;
            this.canJump = false;
            this.isGrounded = false;
            this.fallStartY = this.position.y;
            audioManager.play('jump');
        }
    }
    
    updateScore() {
        // Update max height reached
        if (this.position.y < this.maxHeight) {
            this.maxHeight = this.position.y;
            const heightScore = Math.floor(Math.abs(this.maxHeight) * CONFIG.gameplay.heightMultiplier);
            this.score = Math.max(this.score, heightScore);
        }
    }
    
    checkFallDamage() {
        // Check if player fell from significant height
        if (this.isGrounded && this.fallStartY !== null) {
            const fallDistance = this.position.y - this.fallStartY;
            
            // If fell more than threshold distance, trigger game over
            if (fallDistance > CONFIG.gameplay.fallDamageHeight) {
                return true;
            }
            
            this.fallStartY = null;
        }
        
        // Also check for high fall speed
        if (this.velocity.y > CONFIG.gameplay.gameOverFallSpeed) {
            return true;
        }
        
        return false;
    }
    
    update() {
        this.updateFrames();
        this.updateHitbox();
        this.updateCamerabox();
        this.updateScore();
        
        this.draw();
        
        // Horizontal movement
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();
        
        // Vertical movement with physics
        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollisions();
        
        // Apply air resistance
        this.velocity.x *= CONFIG.physics.airResistance;
        
        // Cap fall speed
        if (this.velocity.y > CONFIG.physics.maxFallSpeed) {
            this.velocity.y = CONFIG.physics.maxFallSpeed;
        }
        
        // Detect if moving
        this.isMoving = Math.abs(this.velocity.x) > 0.1;
        
        // Play/stop running sound
        if (this.isMoving && this.isGrounded && !this.wasMoving) {
            audioManager.play('running');
        } else if (!this.isMoving || !this.isGrounded) {
            audioManager.stop('running');
        }
        
        this.wasMoving = this.isMoving;
    }
    
    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + CONFIG.player.hitboxOffsetX,
                y: this.position.y + CONFIG.player.hitboxOffsetY
            },
            width: CONFIG.player.hitboxWidth,
            height: CONFIG.player.hitboxHeight
        };
    }
    
    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            
            if (collision({ object1: this.hitbox, object2: collisionBlock })) {
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;
                    this.position.x = collisionBlock.position.x - offset - 0.01;
                    break;
                }
                
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                    const offset = this.hitbox.position.x - this.position.x;
                    this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
                    break;
                }
            }
        }
    }
    
    applyGravity() {
        this.velocity.y += CONFIG.physics.gravity;
        this.position.y += this.velocity.y;
        
        // Track if falling
        this.isFalling = this.velocity.y > 0;
    }
    
    checkForVerticalCollisions() {
        // Reset grounded state
        let wasGrounded = this.isGrounded;
        this.isGrounded = false;
        
        // Floor collisions
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            
            if (collision({ object1: this.hitbox, object2: collisionBlock })) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = collisionBlock.position.y - offset - 0.01;
                    this.isGrounded = true;
                    this.canJump = true;
                    break;
                }
                
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y;
                    this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
                    break;
                }
            }
        }
        
        // Platform collisions
        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const platformCollisionBlock = this.platformCollisionBlocks[i];
            
            if (platformCollision({ object1: this.hitbox, object2: platformCollisionBlock })) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = platformCollisionBlock.position.y - offset - 0.01;
                    this.isGrounded = true;
                    this.canJump = true;
                    break;
                }
            }
        }
        
        // Update last grounded position
        if (this.isGrounded) {
            this.lastGroundedY = this.position.y;
            if (!wasGrounded && this.fallStartY !== null) {
                // Just landed
                this.fallStartY = null;
            }
        } else if (wasGrounded && !this.isGrounded) {
            // Just left ground
            this.fallStartY = this.position.y;
        }
    }
}