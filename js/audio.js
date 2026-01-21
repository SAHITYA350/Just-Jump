// Audio Manager - Fixed for browser compatibility

class AudioManager {
    constructor() {
        this.sounds = {};
        this.bgMusic = null;
        this.isMuted = false;
        this.masterVolume = 0.7;
        this.sfxEnabled = true;
        this.bgMusicEnabled = true;
        this.audioContext = null;
        this.isInitialized = false;
        this.bgMusicInterval = null;
        this.runningInterval = null;
    }
    
    // Initialize audio context on first user interaction
    init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            console.log('Audio initialized successfully');
        } catch (e) {
            console.warn('Audio not supported:', e);
            this.isInitialized = false;
        }
    }
    
    // Generate a simple beep tone
    generateBeep(frequency = 440, duration = 0.2, type = 'sine') {
        if (!this.isInitialized || !this.sfxEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Sound generation error:', e);
        }
    }
    
    // Generate jump sound (rising pitch)
    generateJumpSound() {
        if (!this.isInitialized || !this.sfxEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        } catch (e) {
            console.warn('Jump sound error:', e);
        }
    }
    
    // Generate game over sound (descending pitch)
    generateGameOverSound() {
        if (!this.isInitialized || !this.sfxEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Game over sound error:', e);
        }
    }
    
    // Generate click/button sound
    generateClickSound() {
        if (!this.isInitialized || !this.sfxEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(this.masterVolume * 0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (e) {
            console.warn('Click sound error:', e);
        }
    }
    
    // Generate success/coin sound
    generateSuccessSound() {
        if (!this.isInitialized || !this.sfxEnabled) return;
        
        try {
            const notes = [523, 659, 784];
            notes.forEach((freq, i) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = this.audioContext.currentTime + (i * 0.1);
                gainNode.gain.setValueAtTime(this.masterVolume * 0.2, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.15);
            });
        } catch (e) {
            console.warn('Success sound error:', e);
        }
    }
    
    // Background music (simple ambient loop)
    startBackgroundMusic() {
        if (!this.isInitialized || !this.bgMusicEnabled || this.bgMusicInterval) return;
        
        try {
            const notes = [261.63, 293.66, 329.63, 392.00]; // C, D, E, G
            
            this.bgMusicInterval = setInterval(() => {
                if (!this.bgMusicEnabled || !this.isInitialized) return;
                
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = randomNote;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.05, this.audioContext.currentTime + 0.1);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.5);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 1.5);
            }, 2000);
        } catch (e) {
            console.warn('Background music error:', e);
        }
    }
    
    stopBackgroundMusic() {
        if (this.bgMusicInterval) {
            clearInterval(this.bgMusicInterval);
            this.bgMusicInterval = null;
        }
    }
    
    // Continuous running sound (looped)
    startRunningSound() {
        if (!this.isInitialized || !this.sfxEnabled || this.runningInterval) return;
        
        try {
            this.runningInterval = setInterval(() => {
                if (!this.sfxEnabled || !this.isInitialized) return;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = 100 + Math.random() * 50;
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(this.masterVolume * 0.05, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.05);
            }, 250);
        } catch (e) {
            console.warn('Running sound error:', e);
        }
    }
    
    stopRunningSound() {
        if (this.runningInterval) {
            clearInterval(this.runningInterval);
            this.runningInterval = null;
        }
    }
    
    // Play named sounds
    play(soundName) {
        this.init(); // Ensure initialized
        
        switch(soundName) {
            case 'intro':
                this.generateBeep(440, 0.1);
                setTimeout(() => this.generateBeep(554, 0.1), 100);
                setTimeout(() => this.generateBeep(659, 0.2), 200);
                break;
            case 'gamestart':
                this.generateSuccessSound();
                break;
            case 'jump':
                this.generateJumpSound();
                break;
            case 'running':
                this.startRunningSound();
                break;
            case 'gameover':
                this.generateGameOverSound();
                break;
            case 'replay':
                this.generateBeep(659, 0.15);
                break;
            case 'click':
                this.generateClickSound();
                break;
            default:
                this.generateBeep();
        }
    }
    
    stop(soundName) {
        if (soundName === 'running') {
            this.stopRunningSound();
        } else if (soundName === 'background') {
            this.stopBackgroundMusic();
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggleSFX(enabled) {
        this.sfxEnabled = enabled;
        if (!enabled) {
            this.stopRunningSound();
        }
    }
    
    toggleBackgroundMusic(enabled) {
        this.bgMusicEnabled = enabled;
        if (enabled) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
    }
    
    resumeAudioContext() {
        this.init();
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();