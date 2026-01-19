import Phaser from "phaser";

export const F_W = 1026;
export const F_H = 840;

const GRID_OFFSET_X = 0;

const B_X = 75;
const B_Y = 230;

const B_X1 = 30;
const B_Y1 = 420;

const ACCEL = 0.1;
const CIRCLE_1 = [420, 420, 400];
const C_R_1 = [190, 270, 0.5];
const ROUTE_1 = [];

export default class MainGame extends Phaser.Scene {
    isProcessing = false;
    isMoving = false;
    gameContainer = null;
    tapeContainer = null;
    gameBackContainer = null;

    backContainer = null;
    uiContainer = null;

    downloadBtn = null;
    endTitle = null;

    soundBtn = null;
    tutorSprite = null;
    tutorTween = null;
    ambSound = null;

    fieldSprite = null;
    frameSprite = null;
    ballSprite = null;

    t1active = false;
    time1 = null;
    angle1 = null;

    isSoundEnable = true;
    gameStep = 0;
    bg = null;
    bgScale = 1;
    bgItemScale = 1;
    fieldScale = 1;
    pushScale = 1;
    shiftX = 0;
    shiftY = 0;
    offsetX = 0;

    fieldW = 1026;
    fielfH = 840;

    preload() {
        this.load.atlas("main", "assets/pach1.png", "assets/pach1.json");

        //this.load.image("start", "assets/startlogo.png");
        this.load.image("endbg", "assets/background.png");
    }

    create() {
        this.bgScale =
            window.innerWidth > window.innerHeight
                ? this.scale.width / 2048
                : this.scale.height / 2048;
        //this.bgItemScale = this.scale.width<this.scale.height?this.scale.width/1920:this.scale.height/1920;

        this.bg = this.add
            .sprite(this.scale.width / 2, this.scale.height / 2, "endbg")
            .setOrigin(0.5, 0.5)
            .setScale(this.bgScale);

        this.backContainer = this.add.container();

        this.gameBackContainer = this.add.container();
        this.frameSprite = this.add
            .sprite(this.fieldW / 2, this.fielfH / 2, "main", "frame.png")
            .setOrigin(0.5, 0.5);
        this.fieldSprite = this.add
            .sprite(this.fieldW / 2, this.fielfH / 2, "main", "field.png")
            .setOrigin(0.5, 0.5);

        this.gameBackContainer.add(this.frameSprite);
        this.gameBackContainer.add(this.fieldSprite);

        this.ballSprite = this.add
            .sprite(B_X, B_Y, "main", "Cells/cell eye.png")
            .setOrigin(0.5, 0.5)
            .setScale(0.5);

        this.gameContainer = this.add.container();
        this.gameContainer.add(this.ballSprite);

        this.uiContainer = this.add.container();

        this.gameBackContainer.setScale(this.fieldScale);
        this.gameContainer.setScale(this.fieldScale);
        this.uiContainer.setScale(this.fieldScale);

        this.scale.on("resize", this.resizeGame, this);
        this.resizeGame();

        this.startGame();
    }

    startGT1() {
        const S1X = 75 + (340 - 75) / 2;
        const S2X = 340;

        // Фаза 1: x и y параллельно
        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: S1X,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
                this.tweens.add({
                    targets: this.ballSprite,
                    x: S2X,
                    duration: 500,
                    ease: "Linear",
                });

                this.tweens.add({
                    targets: this.ballSprite,
                    y: 230,
                    duration: 500,
                    ease: "Sine.In",
                    onComplete: () => {
                        this.startGT2();
                    },
                });
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: 40,
            duration: 500,
            ease: "Sine.Out",
        });
    }

    startGT2() {
        const S3X = 200;
        const S3Y = 410;

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: S3X,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
                this.startGT3();
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: S3Y,
            duration: 500,
            ease: "Sine.In",
        });
    }

    startGT3() {
        const S3X = 275;
        const S3Y = 510;

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: S3X,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
                this.startEndGT();
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: S3Y,
            duration: 500,
            ease: "Sine.In",
        });
    }

    startEndGT() {
        const SX = 275;
        const SY = 510;
        const DX = 14;
        const DY = 35;

        const timeX = 150;
        const easeM = "Sine.InOut";

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: SX - DX,
            y: SY + DY,
            duration: timeX,
            ease: easeM,
            onComplete: () => {
                const tweenX2 = this.tweens.add({
                    targets: this.ballSprite,
                    x: SX,
                    y: SY + 2 * DY,
                    duration: timeX,
                    ease: easeM,
                    onComplete: () => {
                        const tweenX3 = this.tweens.add({
                            targets: this.ballSprite,
                            x: SX - DX,
                            y: SY + 3 * DY,
                            duration: timeX,
                            ease: easeM,
                            onComplete: () => {
                                const tweenX4 = this.tweens.add({
                                    targets: this.ballSprite,
                                    x: SX,
                                    y: SY + 4 * DY + 20,
                                    duration: timeX,
                                    ease: easeM,
                                    onComplete: () => {
                                        this.ballSprite.setVisible(false);
                                    },
                                });
                            },
                        });
                    },
                });
            },
        });
    }

    startRT1() {
        const S1X = 75 + (340 - 75) / 2;
        const S2X = 340;

        // Фаза 1: x и y параллельно
        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: S1X,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
                this.tweens.add({
                    targets: this.ballSprite,
                    x: S2X,
                    duration: 500,
                    ease: "Linear",
                });

                this.tweens.add({
                    targets: this.ballSprite,
                    y: 230,
                    duration: 500,
                    ease: "Sine.In",
                    onComplete: () => {
                        this.startRT2();
                    },
                });
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: 40,
            duration: 500,
            ease: "Sine.Out",
        });
    }

    startRT2() {
        const S3X = 200;
        const S3Y = 410;

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: S3X,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
                this.startRT3();
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: S3Y,
            duration: 500,
            ease: "Sine.In",
        });
    }

    startRT3() {
        const S3X = 275;
        const S3Y = 510;

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: S3X,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
                this.startERT1();
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: S3Y,
            duration: 500,
            ease: "Sine.In",
        });
    }

    startERT1() {
        const S3X = 275;
        const S3Y = 510;

        this.ballSprite.x = S3X;
        this.ballSprite.y = S3Y;

        const SX = 275;
        const SY = 510;
        const DX = 14;
        const DY = 35;
        const timeX = 150;
        const easeM = "Sine.InOut";

        this.tweens.chain({
            targets: this.ballSprite,
            tweens: [
                { x: SX + 30, y: SY - 20, duration: timeX, ease: easeM },
                { x: SX + 18, y: SY + 40, duration: timeX * 1.1, ease: easeM },
            ],
            onComplete: () => {
                //   this.ballSprite.setVisible(false);
                this.startERT2();
            },
        });
    }

    startERT2() {
        const easeM = "Sine.InOut";

        const timeX = 250;

        const S3X = 374;
        const S3Y = 586;

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: S3X,
            duration: timeX,
            ease: "Linear",
            onComplete: () => {
                this.startERT3();
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: S3Y,
            duration: timeX,
            ease: "Cubic.In",
        });
    }

    startERT3() {
        const easeM = "Sine.InOut";

        const timeX = 200;

        const SX = 435;
        const SY = 556;

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: SX,
            duration: timeX,
            ease: "Linear",
            onComplete: () => {
                this.startERT4();
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: SY,
            duration: timeX / 2,
            ease: "Easy.In",
            yoyo: true,
        });
    }

     startERT4() {
        const easeM = "Sine.InOut";

        const timeX = 250;

        const SX = F_W/2;
        const SY = 685;

        const tweenX1 = this.tweens.add({
            targets: this.ballSprite,
            x: SX,
            duration: timeX,
            ease: "Linear",
            onComplete: () => {
                this.ballSprite.setVisible(false);
            },
        });

        const tweenY1 = this.tweens.add({
            targets: this.ballSprite,
            y: SY,
            duration: timeX,
            ease: "Cubic.In",
        });
    }

    startGame() {
        if (Math.random()>0.5)
            this.startRT1();
        else
            this.startGT1();
    }

    stopTutorial() {}

    update(dt) {}

    startEndScreen() {}

    resizeGame() {
        let scaleX = 1;
        let scaleY = 1;
        let scrX = 0;
        let scrY = 0;

        let offsetX = window.innerWidth > window.innerHeight ? 0 : 0;

        if (window.innerWidth > window.innerHeight) {
            scaleX = window.innerHeight / window.innerWidth;
            scrX = 1024 * (1 - scaleX);
        } else {
            scaleY = window.innerWidth / window.innerHeight;
            scrY = 1024 * (1 - scaleY);
        }

        this.bgScale =
            window.innerWidth > window.innerHeight
                ? this.scale.width / 1024
                : this.scale.height / 1024;

        this.fieldScale =
            window.innerWidth < window.innerHeight
                ? this.scale.width / F_W
                : this.scale.height / F_H;

        this.shiftX =
            (this.scale.width - this.fieldScale * (offsetX * 2 + F_W)) / 2;
        this.shiftY = (this.scale.height - this.fieldScale * F_H) / 2 - 20;

        this.gameBackContainer.setScale(
            this.fieldScale * scaleX,
            this.fieldScale * scaleY,
        );
        this.gameContainer.setScale(
            this.fieldScale * scaleX,
            this.fieldScale * scaleY,
        );
        this.uiContainer.setScale(
            this.fieldScale * scaleX,
            this.fieldScale * scaleY,
        );

        this.gameBackContainer.x =
            this.shiftX + scrX - 2 * (GRID_OFFSET_X - offsetX);
        this.gameContainer.x =
            this.shiftX + scrX - 2 * (GRID_OFFSET_X - offsetX);
        this.uiContainer.x = this.shiftX + scrX - 2 * (GRID_OFFSET_X - offsetX);

        const dY = 60;
        this.gameBackContainer.y = this.shiftY + scrY - dY;
        this.gameContainer.y = this.shiftY + scrY - dY;
        this.uiContainer.y = this.shiftY + scrY - dY;

        const scaleBg = scaleX > scaleY ? scaleX / scaleY : scaleY / scaleX;

        this.bg.setScale(
            this.bgScale * scaleX * scaleBg,
            this.bgScale * scaleY * scaleBg,
        );
        this.bg.x = this.scale.width / 2;
        this.bg.y = this.scale.height / 2;
    }
}

