// Game Configuration
const CONFIG = {
    canvas: {
        width: 1024,
        height: 576,
        scale: 4
    },
    
    physics: {
        gravity: 0.15,
        jumpForce: -5.5,
        moveSpeed: 2.5,
        maxFallSpeed: 10,
        friction: 0.8,
        airResistance: 0.95
    },
    
    player: {
        scale: 0.5,
        hitboxWidth: 14,
        hitboxHeight: 27,
        hitboxOffsetX: 35,
        hitboxOffsetY: 26
    },
    
    camera: {
        followSpeed: 0.1,
        boundaryPadding: 50
    },
    
    gameplay: {
        fallDamageHeight: 150, // Height in pixels before fall damage triggers
        gameOverFallSpeed: 8,  // Speed that triggers game over
        scoreMultiplier: 10,
        heightMultiplier: 0.5
    },
    
    audio: {
        masterVolume: 0.7,
        bgMusicVolume: 0.4,
        sfxVolume: 0.6
    },
    
    animations: {
        Idle: {
            imageSrc: './assets/img/warrior/Idle.png',
            frameRate: 8,
            frameBuffer: 3
        },
        Run: {
            imageSrc: './assets/img/warrior/Run.png',
            frameRate: 8,
            frameBuffer: 5
        },
        Jump: {
            imageSrc: './assets/img/warrior/Jump.png',
            frameRate: 2,
            frameBuffer: 3
        },
        Fall: {
            imageSrc: './assets/img/warrior/Fall.png',
            frameRate: 2,
            frameBuffer: 3
        },
        FallLeft: {
            imageSrc: './assets/img/warrior/FallLeft.png',
            frameRate: 2,
            frameBuffer: 3
        },
        RunLeft: {
            imageSrc: './assets/img/warrior/RunLeft.png',
            frameRate: 8,
            frameBuffer: 5
        },
        IdleLeft: {
            imageSrc: './assets/img/warrior/IdleLeft.png',
            frameRate: 8,
            frameBuffer: 3
        },
        JumpLeft: {
            imageSrc: './assets/img/warrior/JumpLeft.png',
            frameRate: 2,
            frameBuffer: 3
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}