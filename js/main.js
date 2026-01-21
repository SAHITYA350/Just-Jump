// Main Application Entry Point - FIXED

let game;
window.DEBUG_MODE = false; // Set to true to see collision blocks

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initializing Premium Jump Quest...');
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    game = new Game();
    
    setupUIControls();
    
    console.log('✅ Game initialized successfully!');
});

function checkOrientation() {
    const rotateOverlay = document.getElementById('rotateOverlay');
    if (!rotateOverlay) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && window.innerHeight > window.innerWidth) {
        rotateOverlay.classList.remove('hidden');
    } else {
        rotateOverlay.classList.add('hidden');
    }
}

function setupUIControls() {
    // Main Menu Buttons
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            audioManager.resumeAudioContext();
            audioManager.play('click');
            setTimeout(() => game.startGame(), 100);
        });
    }
    
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            audioManager.resumeAudioContext();
            audioManager.play('click');
            document.getElementById('settingsPanel').classList.remove('hidden');
        });
    }
    
    const instructionsBtn = document.getElementById('instructionsBtn');
    if (instructionsBtn) {
        instructionsBtn.addEventListener('click', () => {
            audioManager.resumeAudioContext();
            audioManager.play('click');
            document.getElementById('instructionsPanel').classList.remove('hidden');
        });
    }
    
    // Settings Panel
    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            audioManager.play('click');
            document.getElementById('settingsPanel').classList.add('hidden');
        });
    }
    
    const masterVolumeSlider = document.getElementById('masterVolume');
    if (masterVolumeSlider) {
        masterVolumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audioManager.setMasterVolume(volume);
            const volumeValue = document.querySelector('.volume-value');
            if (volumeValue) {
                volumeValue.textContent = e.target.value + '%';
            }
        });
    }
    
    const bgMusicToggle = document.getElementById('bgMusicToggle');
    if (bgMusicToggle) {
        bgMusicToggle.addEventListener('change', (e) => {
            audioManager.toggleBackgroundMusic(e.target.checked);
        });
    }
    
    const sfxToggle = document.getElementById('sfxToggle');
    if (sfxToggle) {
        sfxToggle.addEventListener('change', (e) => {
            audioManager.toggleSFX(e.target.checked);
        });
    }
    
    // Instructions Panel
    const closeInstructions = document.getElementById('closeInstructions');
    if (closeInstructions) {
        closeInstructions.addEventListener('click', () => {
            audioManager.play('click');
            document.getElementById('instructionsPanel').classList.add('hidden');
        });
    }
    
    // Game HUD Controls
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (game) game.pauseGame();
        });
    }
    
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', (e) => {
            audioManager.resumeAudioContext();
            const currentState = audioManager.bgMusicEnabled;
            audioManager.toggleBackgroundMusic(!currentState);
            audioManager.toggleSFX(!currentState);
            e.target.textContent = currentState ? '🔇' : '🔊';
            audioManager.play('click');
        });
    }
    
    const quitBtn = document.getElementById('quitBtn');
    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to quit?')) {
                if (game) game.returnToMenu();
            }
        });
    }
    
    // Pause Menu
    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            if (game) game.resumeGame();
        });
    }
    
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (game) game.restart();
        });
    }
    
    const mainMenuBtn = document.getElementById('mainMenuBtn');
    if (mainMenuBtn) {
        mainMenuBtn.addEventListener('click', () => {
            if (game) game.returnToMenu();
        });
    }
    
    // Game Over Screen
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            if (game) game.restart();
        });
    }
    
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            if (game) game.returnToMenu();
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && game && game.state === 'playing') {
            if (game.isPaused) {
                game.resumeGame();
            } else {
                game.pauseGame();
            }
        }
        
        if (e.key === 'Enter') {
            if (game && game.state === 'menu') {
                audioManager.resumeAudioContext();
                game.startGame();
            } else if (game && game.state === 'gameover') {
                game.restart();
            }
        }
    });
    
    // Click anywhere to initialize audio
    const initAudio = () => {
        audioManager.init();
        audioManager.resumeAudioContext();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
    };
    
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
}

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && game.state === 'playing' && !game.isPaused) {
        game.pauseGame();
    }
});

// Prevent zoom on mobile
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// Double tap prevention
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

console.log('%c🎮 PREMIUM JUMP QUEST 🎮', 'color: #ffd700; font-size: 24px; font-weight: bold;');
console.log('%cVersion 1.0.0', 'color: #c0c0c0; font-size: 14px;');
console.log('%cControls: WASD or Arrow Keys + Space to jump', 'color: #00ff41; font-size: 12px;');