class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.c = this.canvas.getContext('2d');
        
        // Make context globally available
        window.gameContext = this.c;
        
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;
        
        this.scaledCanvas = {
            width: this.canvas.width / CONFIG.canvas.scale,
            height: this.canvas.height / CONFIG.canvas.scale
        };
        
        this.state = 'loading';
        this.isPaused = false;
        this.isGameOver = false;
        this.animationId = null;
        
        this.keys = {
            d: { pressed: false },
            a: { pressed: false },
            w: { pressed: false },
            ArrowRight: { pressed: false },
            ArrowLeft: { pressed: false },
            ArrowUp: { pressed: false },
            Space: { pressed: false }
        };
        
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };
        
        this.collisionBlocks = [];
        this.platformCollisionBlocks = [];
        this.player = null;
        this.background = null;
        
        this.camera = {
            position: {
                x: 0,
                y: -432 + this.scaledCanvas.height
            }
        };
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('jumpQuestHighScore') || '0');
        
        this.init();
    }
    
    init() {
        this.setupCollisions();
        this.setupEventListeners();
        this.loadAssets();
    }
    
    setupCollisions() {
        const floorCollisions2D = [];
        for (let i = 0; i < floorCollisions.length; i += 36) {
            floorCollisions2D.push(floorCollisions.slice(i, i + 36));
        }
        
        floorCollisions2D.forEach((row, y) => {
            row.forEach((symbol, x) => {
                if (symbol === 202) {
                    this.collisionBlocks.push(
                        new CollisionBlock({
                            position: { x: x * 16, y: y * 16 }
                        })
                    );
                }
            });
        });
        
        const platformCollisions2D = [];
        for (let i = 0; i < platformCollisions.length; i += 36) {
            platformCollisions2D.push(platformCollisions.slice(i, i + 36));
        }
        
        platformCollisions2D.forEach((row, y) => {
            row.forEach((symbol, x) => {
                if (symbol === 202) {
                    this.platformCollisionBlocks.push(
                        new CollisionBlock({
                            position: { x: x * 16, y: y * 16 },
                            height: 4
                        })
                    );
                }
            });
        });
    }
    
    loadAssets() {
        let loadedAssets = 0;
        const totalAssets = 1; // Just count background for now
        
        const updateProgress = () => {
            loadedAssets++;
            const progress = (loadedAssets / totalAssets) * 100;
            const progressBar = document.getElementById('loadingProgress');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
            if (loadedAssets >= totalAssets) {
                setTimeout(() => {
                    this.showMainMenu();
                }, 500);
            }
        };
        
        // Try to load background
        const bgImage = new Image();
        bgImage.onload = updateProgress;
        bgImage.onerror = () => {
            console.warn('Background image failed to load, using fallback');
            updateProgress();
        };
        bgImage.src = './assets/img/background.png';
        
        // Initialize audio on first load
        setTimeout(() => {
            audioManager.init();
            audioManager.play('intro');
        }, 100);
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (this.state !== 'playing' || this.isPaused) return;
            
            const key = event.key;
            if (key in this.keys) {
                this.keys[key].pressed = true;
            }
            
            if (key === 'w' || key === 'ArrowUp' || key === ' ') {
                event.preventDefault();
                if (this.player) {
                    this.player.jump();
                }
            }
        });
        
        window.addEventListener('keyup', (event) => {
            const key = event.key;
            if (key in this.keys) {
                this.keys[key].pressed = false;
            }
        });
        
        const setupTouchControl = (elementId, control) => {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls[control] = true;
                if (control === 'jump' && this.player) {
                    this.player.jump();
                }
            });
            
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls[control] = false;
            });
            
            element.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.touchControls[control] = true;
                if (control === 'jump' && this.player) {
                    this.player.jump();
                }
            });
            
            element.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.touchControls[control] = false;
            });
        };
        
        setupTouchControl('moveLeft', 'left');
        setupTouchControl('moveRight', 'right');
        setupTouchControl('jumpBtn', 'jump');
        
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.mobile-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    showMainMenu() {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
        const highScoreDisplay = document.getElementById('highScoreDisplay');
        if (highScoreDisplay) {
            highScoreDisplay.textContent = this.highScore;
        }
        
        if (typeof particlesJS !== 'undefined') {
            try {
                particlesJS('particles-js', {
                    particles: {
                        number: { value: 80 },
                        color: { value: '#ffd700' },
                        shape: { type: 'circle' },
                        opacity: { value: 0.5, random: true },
                        size: { value: 3, random: true },
                        move: {
                            enable: true,
                            speed: 1,
                            direction: 'none',
                            out_mode: 'out'
                        }
                    }
                });
            } catch (e) {
                console.warn('Particles.js error:', e);
            }
        }
        
        this.state = 'menu';
    }
    
    startGame() {
        audioManager.resumeAudioContext();
        audioManager.play('gamestart');
        
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        
        this.background = new Sprite({
            position: { x: 0, y: 0 },
            imageSrc: './assets/img/background.png'
        });
        
        this.player = new Player({
            position: { x: 100, y: 300 },
            collisionBlocks: this.collisionBlocks,
            platformCollisionBlocks: this.platformCollisionBlocks,
            imageSrc: CONFIG.animations.Idle.imageSrc,
            frameRate: CONFIG.animations.Idle.frameRate,
            animations: CONFIG.animations
        });
        
        this.camera.position = {
            x: 0,
            y: -432 + this.scaledCanvas.height
        };
        
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.state = 'playing';
        
        audioManager.startBackgroundMusic();
        
        this.animate();
    }
    
    animate() {
        if (this.state !== 'playing') return;
        
        this.animationId = window.requestAnimationFrame(() => this.animate());
        
        if (this.isPaused || !this.player) return;
        
        this.c.fillStyle = 'white';
        this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.c.save();
        this.c.scale(CONFIG.canvas.scale, CONFIG.canvas.scale);
        this.c.translate(this.camera.position.x, this.camera.position.y);
        
        if (this.background) {
            this.background.update();
        }
        
        this.player.checkForHorizontalCanvasCollision();
        this.player.update();
        
        this.player.velocity.x = 0;
        
        const moveLeft = this.keys.a.pressed || this.keys.ArrowLeft.pressed || this.touchControls.left;
        const moveRight = this.keys.d.pressed || this.keys.ArrowRight.pressed || this.touchControls.right;
        
        if (moveRight) {
            this.player.switchSprite('Run');
            this.player.velocity.x = CONFIG.physics.moveSpeed;
            this.player.lastDirection = 'right';
            this.player.shouldPanCameraToTheLeft({ canvas: this.canvas, camera: this.camera });
        } else if (moveLeft) {
            this.player.switchSprite('RunLeft');
            this.player.velocity.x = -CONFIG.physics.moveSpeed;
            this.player.lastDirection = 'left';
            this.player.shouldPanCameraToTheRight({ canvas: this.canvas, camera: this.camera });
        } else if (this.player.velocity.y === 0) {
            if (this.player.lastDirection === 'right') {
                this.player.switchSprite('Idle');
            } else {
                this.player.switchSprite('IdleLeft');
            }
        }
        
        if (this.player.velocity.y < 0) {
            this.player.shouldPanCameraDown({ camera: this.camera, canvas: this.canvas });
            if (this.player.lastDirection === 'right') {
                this.player.switchSprite('Jump');
            } else {
                this.player.switchSprite('JumpLeft');
            }
        } else if (this.player.velocity.y > 0) {
            this.player.shouldPanCameraUp({ camera: this.camera, canvas: this.canvas });
            if (this.player.lastDirection === 'right') {
                this.player.switchSprite('Fall');
            } else {
                this.player.switchSprite('FallLeft');
            }
        }
        
        this.c.restore();
        
        this.updateHUD();
        
        if (this.player.checkFallDamage()) {
            this.gameOver();
        }
    }
    
    updateHUD() {
        const scoreEl = document.getElementById('scoreValue');
        const heightEl = document.getElementById('heightValue');
        
        if (scoreEl && this.player) {
            scoreEl.textContent = Math.floor(this.player.score);
        }
        if (heightEl && this.player) {
            const height = Math.max(0, Math.floor(Math.abs(this.player.maxHeight) * CONFIG.gameplay.heightMultiplier));
            heightEl.textContent = height + 'm';
        }
    }
    
    pauseGame() {
        if (this.state !== 'playing' || this.isGameOver) return;
        
        this.isPaused = true;
        document.getElementById('pauseMenu').classList.remove('hidden');
        audioManager.stop('running');
        audioManager.play('click');
    }
    
    resumeGame() {
        this.isPaused = false;
        document.getElementById('pauseMenu').classList.add('hidden');
        audioManager.play('click');
        this.animate();
    }
    
    gameOver() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.state = 'gameover';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        audioManager.stop('running');
        audioManager.stopBackgroundMusic();
        audioManager.play('gameover');
        
        const finalScore = Math.floor(this.player.score);
        const finalHeight = Math.max(0, Math.floor(Math.abs(this.player.maxHeight) * CONFIG.gameplay.heightMultiplier));
        
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('jumpQuestHighScore', this.highScore.toString());
            document.getElementById('newRecord').classList.remove('hidden');
        } else {
            document.getElementById('newRecord').classList.add('hidden');
        }
        
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('finalHeight').textContent = finalHeight + 'm';
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    restart() {
        audioManager.play('replay');
        
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
        
        this.startGame();
    }
    
    returnToMenu() {
        audioManager.play('click');
        audioManager.stopBackgroundMusic();
        audioManager.stop('running');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.state = 'menu';
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('highScoreDisplay').textContent = this.highScore;
    }
}