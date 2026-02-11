export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // --- Display a loading bar (optional but recommended) ---
        // You'll need to add listener events for this (see resources for a full tutorial)
        this.add.text(400, 300, 'Loading...', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        
        this.load.atlas("main", "assets/pach1.png", "assets/pach1.json");

        //this.load.image("start", "assets/startlogo.png");
        this.load.image("endbg", "assets/background.jpg");
        this.load.image("fr1", "assets/frame.png");
        this.load.video("v1", "assets/v1.mp4");
        this.load.audio("ball", "assets/ball.mp3");
        this.load.audio("click", "assets/click.mp3");
        this.load.audio("sndbg", "assets/background.mp3");
        
        // Set a base URL or specific paths for assets if needed
        // this.load.setBaseURL('https://labs.phaser.io'); 
    }

    create() {
        // Assets are loaded. Start the main Game Scene
        this.scene.start('MainGame');
    }
}
