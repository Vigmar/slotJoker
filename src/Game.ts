import Phaser from "phaser";

export const COLS = 5;
export const ROWS = 3;
export const SYMBOL_TYPES = 16;
export const CELL_SIZE = 90;
export const CELL_SIZE_W = 120;
export const GRID_OFFSET_X = 36;
export const GRID_OFFSET_Y = 100;
export const TAPE_STEP_ITEMS_COUNT = 50;
export const ITEM_NAMES = [
    "10 cell.png",
    "a cell.png",
    "box cell.png",
    "dragonfly cell.png",
    "fish 10.png",
    "fish 100.png",
    "fish 1000.png",
    "fish 30.png",
    "fish 50.png",
    "fishman cell.png",
    "floater cell.png",
    "j cell.png",
    "k cell.png",
    "q cell.png",
    "rod cell.png",
    "scatter cell.png",
];

const DRUM_BUFFER = 4; // по 4 сверху и снизу
const TOTAL_DRUM_ITEMS = ROWS + DRUM_BUFFER * 2; // например, 5 + 8 = 13

const maskWidth = COLS * CELL_SIZE_W;
const maskHeight = ROWS * CELL_SIZE;
const maskX = GRID_OFFSET_X;
const maskY = GRID_OFFSET_Y;

const MATHCES = [[], [], [], [], [], []];

const BONUS_NAMES = ["", "", "win100.png", "win200.png", "win300.png"];

export default class MainGame extends Phaser.Scene {
    grid = [];
    sliders = [];
    gridTweens = [];

    isProcessing = false;
    isMoving = false;
    gameContainer = null;
    tapeContainer = null;
    gameBackContainer = null;

    backContainer = null;
    uiContainer = null;
    maskGraphics = null;
    cashoutBtn = null;
    spinBtn = null;
    startSprite = null;
    startAnim = null;
    startBtn = null;
    wonSprite = null;

    downloadBtn = null;
    endTitle = null;

    bonusSprite = null;
    logoSprite = null;
    logomanSprite = null;

    endSprite = null;
    endBtn = null;
    endCoin1 = null;
    endCoin2 = null;

    soundBtn = null;
    tutorSprite = null;
    tutorTween = null;
    ambSound = null;

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

    preload() {
        this.load.atlas("items", "assets/bb1.png", "assets/bb1.json");
        this.load.atlas("anims", "assets/anim.png", "assets/anim.json");

        //this.load.image("start", "assets/startlogo.png");
        this.load.image("endbg", "assets/background.jpg");
        this.load.image("endcoin1", "assets/endcoin1.png");
        this.load.image("endcoin2", "assets/endcoin2.png");
        this.load.image("superwin", "assets/superwin.png");
        this.load.image("table", "assets/table.png");
        this.load.image("logo", "assets/logogame.png");

        this.load.audio("lose", "sounds/lose.mp3");
        this.load.audio("end", "sounds/end.mp3");
        this.load.audio("win", "sounds/win.mp3");
        this.load.audio("click", "sounds/click.mp3");
        this.load.audio("ambient", "sounds/ambient.mp3");
    }

    create() {
        this.maskGraphics = this.add.graphics();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRect(maskX, maskY, maskWidth, maskHeight);

        const mask = new Phaser.Display.Masks.GeometryMask(
            this,
            this.maskGraphics
        );

        this.maskGraphics.setVisible(false); // саму маску не рисуем

        this.bgScale =
            window.innerWidth > window.innerHeight
                ? this.scale.width / 2048
                : this.scale.height / 2048;
        //this.bgItemScale = this.scale.width<this.scale.height?this.scale.width/1920:this.scale.height/1920;
        this.bgItemScale = this.scale.height / 1400;

        this.bg = this.add
            .sprite(this.scale.width / 2, this.scale.height / 2, "endbg")
            .setOrigin(0.5, 0.5)
            .setScale(this.bgScale);

        this.backContainer = this.add.container();

        console.log("SCR", this.scale.width, this.scale.height);

        this.gameBackContainer = this.add.container();

        const cellsBack = this.add
            .sprite(GRID_OFFSET_X, GRID_OFFSET_Y - 5, "table")
            .setScale(0.33, 0.33)
            .setOrigin(0, 0);
        this.gameBackContainer.add(cellsBack);

        this.sliders = [];

        /*
        for (let i = 0; i < COLS; i++) {
            this.sliders[i] = this.add
                .sprite(
                    GRID_OFFSET_X + CELL_SIZE_W * i,
                    GRID_OFFSET_Y,
                    "slider",
                    "slider_1.png"
                )
                .setScale(0.7, 0.7)
                .setOrigin(0, 0);
            this.sliders[i].play("sliders");
            this.gameBackContainer.add(this.sliders[i]);
        }
        */

        this.gameBackContainer.add(cellsBack);

        // === КОНТЕЙНЕР ДЛЯ СИМВОЛОВ ===
        this.gameContainer = this.add.container();
        this.gameContainer.setMask(mask);

        this.tapeContainer = this.add.container();
        this.gameContainer.add(this.tapeContainer);

        this.uiContainer = this.add.container();

        this.gameBackContainer.setScale(this.fieldScale);
        this.gameContainer.setScale(this.fieldScale);
        this.uiContainer.setScale(this.fieldScale);
        this.maskGraphics.setScale(this.fieldScale);

        this.soundBtn = this.add
            .sprite(0 + 10, this.scale.height - 50, "items", "volumeOff.png")
            .setOrigin(0, 1)
            .setScale(0.42 * this.fieldScale)
            .setInteractive()
            .on("pointerdown", () => {
                let scaleX = 1;
                let scaleY = 1;
                let scrX = 0;
                let scrY = 0;

                if (window.innerWidth > window.innerHeight) {
                    scaleX = window.innerHeight / window.innerWidth;
                    scrX = 800 * (1 - scaleX);
                } else {
                    scaleY = window.innerWidth / window.innerHeight;
                    scrY = 800 * (1 - scaleY);
                }

                if (!this.isSoundEnable) {
                    if (!this.ambSound)
                        this.ambSound = this.sound.add("ambient");

                    this.ambSound.play({
                        loop: true,
                    });
                    this.isSoundEnable = true;
                    this.soundBtn.setTexture("items", "volumeOff.png");
                    this.soundBtn.setScale(
                        0.42 * this.fieldScale * scaleX,
                        0.42 * this.fieldScale * scaleY
                    );
                } else {
                    this.isSoundEnable = false;
                    if (this.ambSound) this.ambSound.stop();

                    this.soundBtn.setTexture("items", "volumeOn.png");
                    this.soundBtn.setScale(
                        0.7 * this.fieldScale * scaleX,
                        0.7 * this.fieldScale * scaleY
                    );
                }
            });

        this.spinBtn = this.add
            .sprite(
                GRID_OFFSET_X + COLS * CELL_SIZE_W - CELL_SIZE_W / 2,
                GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE / 2,
                "items",
                "spin.png"
            )
            .setScale(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                if (!this.isMoving) {
                    this.stopTutorial();
                    console.log("click", this.gameStep);
                    this.gameStep += 1;
                    if (this.gameStep < MATHCES.length)
                        this.startNewGame(MATHCES[this.gameStep]);
                }
            });

        this.cashoutBtn = this.add
            .sprite(
                GRID_OFFSET_X + ((COLS + 1) * CELL_SIZE_W) / 3,
                GRID_OFFSET_Y + ROWS * CELL_SIZE + 66,
                "items",
                "cash_out.png"
            )
            .setScale(0.45)
            .setInteractive()
            .on("pointerdown", () => {
                if (!this.isMoving) {
                    this.startEndScreen();
                }
            });

        this.tutorSprite = this.add
            .sprite(
                this.spinBtn.x - 10,
                this.spinBtn.y - 90,
                "items",
                "tutor_hand.png"
            )
            .setOrigin(0.5, 0)
            .setAngle(180)
            .setScale(0.6)
            .setVisible(false);

        this.uiContainer.add(this.spinBtn);
        this.uiContainer.add(this.cashoutBtn);
        this.uiContainer.add(this.tutorSprite);

        this.bonusSprite = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "items",
                BONUS_NAMES[0]
            )
            .setOrigin(0.5, 0.5)
            .setScale(0);

        this.logoSprite = this.add
            .sprite((COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X, 5, "logo")
            .setOrigin(0.5, 0)
            .setScale(0.3);

        this.logomanSprite = this.add
            .sprite((COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X, 45, "anims","1.png")
            .setOrigin(0.5, 1)
            .setScale(0.3);

        this.uiContainer.add(this.logomanSprite);
        this.uiContainer.add(this.logoSprite);
        
        this.uiContainer.add(this.bonusSprite);

        if (window.innerWidth>window.innerHeight) this.logomanSprite.setVisible(false);

        this.anims.create({
            key: "frame_gem",
            frames: [
                { key: "items", frame: "frame/1.png" },
                { key: "items", frame: "frame/2.png" },
                { key: "items", frame: "frame/3.png" },
                { key: "items", frame: "frame/4.png" },
                { key: "items", frame: "frame/5.png" },
                { key: "items", frame: "frame/6.png" },
                { key: "items", frame: "frame/7.png" },
                { key: "items", frame: "frame/8.png" },
            ],
            frameRate: 15,
            repeat: 2,
        });

        this.anims.create({
            key: "boom_gem",
            frames: [
                { key: "items", frame: "splash/1.png" },
                { key: "items", frame: "splash/2.png" },
                { key: "items", frame: "splash/3.png" },
                { key: "items", frame: "splash/4.png" },
                { key: "items", frame: "splash/5.png" },
                { key: "items", frame: "splash/6.png" },
                { key: "items", frame: "splash/7.png" },
                { key: "items", frame: "splash/8.png" },
                { key: "items", frame: "splash/9.png" },
                { key: "items", frame: "splash/10.png" },
            ],
            frameRate: 15,
        });

        this.anims.create({
            key: "man_start",
            frames: [
                { key: "anims", frame: "001.png" },
                { key: "anims", frame: "002.png" },
                { key: "anims", frame: "003.png" },
                { key: "anims", frame: "004.png" },
                { key: "anims", frame: "005.png" },
                { key: "anims", frame: "006.png" },
            ],
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: "man_end",
            frames: [
                { key: "anims", frame: "1.png" },
                { key: "anims", frame: "2.png" },
                { key: "anims", frame: "3.png" },
                { key: "anims", frame: "4.png" },
                { key: "anims", frame: "5.png" },
                { key: "anims", frame: "6.png" },
            ],
            frameRate: 6,
            repeat: -1,
        });

        this.initDrums();

        this.scale.on("resize", this.resizeGame, this);
        this.resizeGame();

        this.gameBackContainer.setVisible(false);
        this.gameContainer.setVisible(false);
        this.backContainer.setVisible(false);
        this.spinBtn.setVisible(false);
        this.cashoutBtn.setVisible(false);
        this.logoSprite.setVisible(false);
        this.logomanSprite.setVisible(false);

        this.time.delayedCall(1000, () => {
            //this.startTutorial(false);
            if (this.isSoundEnable) {
                if (!this.ambSound) this.ambSound = this.sound.add("ambient");
                this.ambSound.play({
                    loop: true,
                });
            }
        });

        this.startSprite = this.add
            .sprite(
                GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 2,
                10,
                "anims",
                "start_b.png"
            )
            .setOrigin(0.5, 0)
            .setScale(0.4);
            

        this.startAnim = this.add
            .sprite(
                GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 2,
                GRID_OFFSET_Y+ROWS*CELL_SIZE/2,
                "anims",
                "001.png"
            ).setScale(1.3);
            

            this.startAnim.play("man_start");

        this.startBtn = this.add
            .sprite(
                GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 2,
                GRID_OFFSET_Y+ROWS*CELL_SIZE+200,
                "anims",
                "start_a.png"
            )
            .setOrigin(0.5, 1)
            .setScale(0.8)
            .setInteractive()
            .on("pointerdown", () => {
                this.startGame();
            });

        this.uiContainer.add(this.startAnim);
        this.uiContainer.add(this.startSprite);
        this.uiContainer.add(this.startBtn);
    }

    startGame() {
        this.startSprite.setVisible(false);
        this.startAnim.setVisible(false);
        this.startBtn.setVisible(false);
        this.gameBackContainer.setVisible(true);
        this.gameContainer.setVisible(true);
        this.backContainer.setVisible(true);
        this.spinBtn.setVisible(true);
        this.cashoutBtn.setVisible(true);
        this.logoSprite.setVisible(true);
        if (window.innerWidth<window.innerHeight) this.logomanSprite.setVisible(true);
        this.startTutorial(false);
    }

    stopTutorial() {
        if (this.tutorTween) {
            this.tutorTween.stop();
        }

        for (let i = 0; i < this.gridTweens.length; i++)
            this.gridTweens[i].stop();

        this.tutorSprite.setVisible(false);
    }

    startTutorial(isCashout) {
        if (this.tutorTween) {
            this.tutorTween.stop();
        }

        this.tutorSprite.setVisible(true);
        if (isCashout) {
            this.tutorSprite.x = this.cashoutBtn.x - 10;
            this.tutorSprite.y = this.cashoutBtn.y - 90;

            this.tutorTween = this.tweens.add({
                targets: this.tutorSprite,
                y: this.cashoutBtn.y - 50,
                duration: 700,
                ease: "Linear",
                yoyo: true,
                repeat: -1,
            });
        } else {
            this.tutorSprite.x = this.spinBtn.x - 10;
            this.tutorSprite.y = this.spinBtn.y - 90;

            this.tutorTween = this.tweens.add({
                targets: this.tutorSprite,
                y: this.spinBtn.y - 50,
                duration: 700,
                ease: "Linear",
                yoyo: true,
                repeat: -1,
            });
        }
    }

    startNewGame() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        this.resetGame();
    }

    initDrums() {
        const stepItemIds = [
            [
                0, 0, 0, 1, 1, 1, 3, 3, 3, 13, 13, 13, 12, 12, 12, 11, 11, 11,
                7, 7,
            ],
            [0, 0, 0, 1, 1, 1, 3, 3, 3, 4, 4, 4, 12, 13, 12, 11, 13, 11, 7],
            [
                0, 0, 0, 1, 4, 0, 12, 3, 11, 13, 13, 13, 12, 12, 12, 11, 14, 10,
                11, 12,
            ],
            [6, 6, 6, 6, 6, 2, 0, 0, 0, 1, 1, 1, 3, 3, 3],
            [6, 6, 6, 6, 3, 3, 3, 2, 1, 1, 0, 12, 13, 14, 5],
        ];

        this.grid = [[], [], [], [], []];

        let tweenInd = 0;

        for (let l = 0; l < stepItemIds.length; l++)
            Phaser.Utils.Array.Shuffle(stepItemIds[l]);

        let fishId = 5 + Math.floor(Math.random() * 3);

        for (let i = 0; i < 5; i++) {
            // 5 колонок
            for (let j = 0; j < 6; j++) {
                // 6 шагов
                for (let k = 0; k < TAPE_STEP_ITEMS_COUNT; k++) {
                    // 5 объектов в шаге
                    const offsetX =
                        GRID_OFFSET_X +
                        i * (CELL_SIZE_W - 2) +
                        CELL_SIZE_W / 2 +
                        25;

                    const offsetY =
                        (j * TAPE_STEP_ITEMS_COUNT + k) * CELL_SIZE -
                        TAPE_STEP_ITEMS_COUNT * 6 * CELL_SIZE +
                        CELL_SIZE * 5 -
                        30;

                    let frameId = Phaser.Math.Between(0, SYMBOL_TYPES - 1);

                    // Если это один из 3 нижних элементов в шаге (k >= 2)
                    if (k >= TAPE_STEP_ITEMS_COUNT - 3) {
                        // Индекс в grid (шаги идут сверху вниз, поэтому инвертируем j)
                        const gridRow = 5 - j - 1; // 5 шагов: 0..5 → 5..0
                        const gridCol =
                            i * 3 + (k - (TAPE_STEP_ITEMS_COUNT - 3)); // 3 элемента в строке: 0,1,2

                        if (j < 5) {
                            // не последний шаг
                            let currIds = stepItemIds[gridRow];
                            frameId = currIds[gridCol];

                            if (
                                j == 2 &&
                                (gridCol == 4 || gridCol == 7 || gridCol == 10)
                            ) {
                                frameId = fishId;
                            }

                            this.grid[gridRow][gridCol] = frameId;
                        }
                    }

                    const frameName = "cells/" + ITEM_NAMES[frameId];
                    const sprite = this.add
                        .sprite(offsetX, offsetY, "items", frameName)
                        .setScale(0.3);
                    this.tapeContainer.add(sprite);

                    // Анимация для последнего шага (j === 5) и нижних 3 элементов
                    if (k >= TAPE_STEP_ITEMS_COUNT - 3 && j === 5) {
                        this.gridTweens[tweenInd] = this.tweens.add({
                            targets: sprite,
                            scale: 0.35,
                            duration: 700,
                            ease: "Power2",
                            yoyo: true,
                            repeat: -1,
                        });
                        tweenInd++;
                    }
                }
            }
        }

        console.log(this.grid[0].length);
    }

    resetGame() {
        this.isMoving = true;
        this.isProcessing = true;

        console.log(this.gameStep);

        if (this.gameStep < 3) {
            if (this.isSoundEnable) this.sound.play("lose");
        } else {
            if (this.isSoundEnable) this.sound.play("win");
        }

        const targetY =
            this.tapeContainer.y + TAPE_STEP_ITEMS_COUNT * CELL_SIZE;

        this.tweens.add({
            targets: this.tapeContainer,
            y: targetY,
            duration: 700,
            ease: "Power2",
            onComplete: () => {
                this.isProcessing = false;
                this.isMoving = false;
                this.checkMatches();
            },
        });
    }

    checkMatches() {
        if (this.isProcessing) return;

        this.grid[this.gameStep - 1].forEach((sym, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;

            if (
                (this.gameStep == 3 && col == 1 && row > 0 && row < 4) ||
                (this.gameStep == 4 && (sym == 6 || sym == 2)) ||
                (this.gameStep == 5 && (sym == 6 || sym == 2 || sym == 3))
            ) {
                const effect = this.add
                    .sprite(
                        GRID_OFFSET_X + CELL_SIZE_W * row + 5,
                        GRID_OFFSET_Y + CELL_SIZE * col,
                        "items",
                        "frame/1.png"
                    )
                    .setOrigin(0, 0);
                effect.setScale(0.4);

                effect.play("frame_gem");
                this.gameContainer.add(effect);

                effect.on("animationcomplete", () => {
                    effect.destroy();
                });

                this.time.delayedCall(400, () => {
                    const effectBoom = this.add
                        .sprite(
                            GRID_OFFSET_X + CELL_SIZE_W * row + 10,
                            GRID_OFFSET_Y + CELL_SIZE * col,
                            "items",
                            "splash/1.png"
                        )
                        .setOrigin(0, 0);
                    effectBoom.setScale(0.35);
                    effectBoom.play("boom_gem");
                    this.gameContainer.add(effectBoom);

                    effectBoom.on("animationcomplete", () => {
                        effectBoom.destroy();
                    });
                });
            }
        });

        this.time.delayedCall(2000, () => {
            if (this.gameStep < 5) this.startTutorial(false);
            else {
                this.startTutorial(true);

                if (!this.wonSprite) {
                    this.wonSprite = this.add
                        .sprite(
                            (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                            -1000,
                            "superwin"
                        )
                        .setOrigin(0.5, 0.5)
                        .setScale(1.5 / this.fieldScale);

                    this.uiContainer.add(this.wonSprite);

                    const finalY = GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2;

                    this.tweens.add({
                        targets: this.wonSprite,
                        y: finalY,
                        duration: 500,
                        ease: "Linear",
                    });

                    this.time.delayedCall(2000, () => {
                        this.tweens.add({
                            targets: this.wonSprite,
                            y: -1000,
                            duration: 500,
                            ease: "Linear",
                        });
                    });
                }
            }
        });

        this.startPushes();
    }

    update() {}

    startPushes() {
        let scaleX = 1;
        let scaleY = 1;
        let scrX = 0;
        let scrY = 0;

        if (window.innerWidth > window.innerHeight) {
            scaleX = window.innerHeight / window.innerWidth;
            scrX = 800 * (1 - scaleX);
        } else {
            scaleY = window.innerWidth / window.innerHeight;
            scrY = 800 * (1 - scaleY);
        }

        const pushScale =
            window.innerWidth > window.innerHeight
                ? this.scale.width / 1600
                : this.scale.width / 1200;

        if (BONUS_NAMES[this.gameStep - 1]) {
            this.bonusSprite.setTexture(
                "items",
                BONUS_NAMES[this.gameStep - 1]
            );
            this.bonusSprite.setScale(0);

            this.tweens.add({
                targets: this.bonusSprite,
                scale: 0.8,
                duration: 700,
                ease: "Power2",
                yoyo: true,
                onComplete: () => {
                    this.bonusSprite.setScale(0);
                },
            });
        }
    }

    startEndScreen() {
        if (this.wonSprite) {
            this.wonSprite.setVisible(false);
            this.wonSprite.x = 6000;
        }
        if (this.isSoundEnable) this.sound.play("end");
        let scaleX = 1;
        let scaleY = 1;
        let scrX = 0;
        let scrY = 0;

        this.logoSprite.setVisible(false);
        this.logomanSprite.setVisible(false);
        this.tutorSprite.x = 6000;

        if (window.innerWidth > window.innerHeight) {
            scaleX = window.innerHeight / window.innerWidth;
            scrX = 800 * (1 - scaleX);
        } else {
            scaleY = window.innerWidth / window.innerHeight;
            scrY = 800 * (1 - scaleY);
        }

        this.stopTutorial();

        this.spinBtn.setVisible(false);
        this.cashoutBtn.setVisible(false);
        this.gameBackContainer.setVisible(false);
        this.gameContainer.setVisible(false);

        this.endSprite = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "anims",
                "1.png"
            )
            .setOrigin(0.5, 0.5)
            .setScale(0.75)
            .setInteractive()
            .on("pointerdown", (pointer) => {
                console.log("CTA pressed");
                //onCtaPressed();
                FbPlayableAd.onCTAClick();
            });

        this.endSprite.play("man_end");

        this.endCoin1 = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "endcoin1"
            )
            .setOrigin(0.5, 0.5)
            .setScale(window.innerWidth > window.innerHeight ? 0.45 : 0.6);

        this.endCoin2 = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "endcoin2"
            )
            .setOrigin(0.5, 0.5)
            .setScale(window.innerWidth > window.innerHeight ? 0.45 : 0.6);

        this.endBtn = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE)+30,
                "items",
                "cashout.png"
            )
            .setOrigin(0.5, 0)
            .setScale(0.75)
            .setInteractive()
            .on("pointerdown", (pointer) => {
                console.log("CTA pressed");
                //onCtaPressed();
                FbPlayableAd.onCTAClick();
            });

        this.uiContainer.add(this.endCoin1);
        this.uiContainer.add(this.endSprite);
        this.uiContainer.add(this.endCoin2);
        this.uiContainer.add(this.endBtn);

        this.tweens.add({
            targets: this.endCoin1,
            y: this.endCoin1.y + 30,
            duration: 1200,
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });

        this.tweens.add({
            targets: this.endCoin2,
            y: this.endCoin2.y - 30,
            duration: 1200,
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });

        if (this.gameStep > 4) {
        }
    }

    resizeGame() {
        let scaleX = 1;
        let scaleY = 1;
        let scrX = 0;
        let scrY = 0;

        let offsetX =
            window.innerWidth > window.innerHeight ? 0 : GRID_OFFSET_X;

        if (window.innerWidth > window.innerHeight) {
            scaleX = window.innerHeight / window.innerWidth;
            scrX = 800 * (1 - scaleX);
        } else {
            scaleY = window.innerWidth / window.innerHeight;
            scrY = 800 * (1 - scaleY);
        }

        this.bgScale =
            window.innerWidth > window.innerHeight
                ? this.scale.width / 2048
                : this.scale.height / 2048;

        this.bgItemScale = this.scale.height / 1400;

        this.fieldScale =
            window.innerWidth < window.innerHeight
                ? this.scale.width / (offsetX * 2 + CELL_SIZE_W * COLS + 100)
                : this.scale.height /
                  (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS + 200);

        this.shiftX =
            (this.scale.width -
                this.fieldScale * (offsetX * 2 + CELL_SIZE_W * COLS)) /
            2;
        this.shiftY =
            (this.scale.height -
                this.fieldScale * (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS)) /
                2 -
            20;

        //this.gameBackContainer.setScale(this.fieldScale);
        //this.gameContainer.setScale(this.fieldScale);
        //this.uiContainer.setScale(this.fieldScale);
        //this.maskGraphics.setScale(this.fieldScale);
        //this.gameBackContainer.x = this.shiftX;
        //this.gameContainer.x = this.shiftX;
        //this.uiContainer.x = this.shiftX;
        //this.maskGraphics.x = this.shiftX;
        //this.gameBackContainer.y = this.shiftY;
        //this.gameContainer.y = this.shiftY;
        //this.uiContainer.y = this.shiftY;
        //this.maskGraphics.y = this.shiftY;

        this.soundBtn.y = this.scale.height - 50;
        this.soundBtn.setScale(
            0.42 * this.fieldScale * scaleX,
            0.42 * this.fieldScale * scaleY
        );

        this.gameBackContainer.setScale(
            this.fieldScale * scaleX,
            this.fieldScale * scaleY
        );
        this.gameContainer.setScale(
            this.fieldScale * scaleX,
            this.fieldScale * scaleY
        );
        this.uiContainer.setScale(
            this.fieldScale * scaleX,
            this.fieldScale * scaleY
        );
        this.maskGraphics.setScale(
            this.fieldScale * scaleX,
            this.fieldScale * scaleY
        );
        this.gameBackContainer.x =
            this.shiftX + scrX - 2 * (GRID_OFFSET_X - offsetX);
        this.gameContainer.x =
            this.shiftX + scrX - 2 * (GRID_OFFSET_X - offsetX);
        this.uiContainer.x = this.shiftX + scrX - 2 * (GRID_OFFSET_X - offsetX);
        this.maskGraphics.x =
            this.shiftX + scrX - 2 * (GRID_OFFSET_X - offsetX);

        const dY = 60;
        this.gameBackContainer.y = this.shiftY + scrY - dY;
        this.gameContainer.y = this.shiftY + scrY - dY;
        this.uiContainer.y = this.shiftY + scrY - dY;
        this.maskGraphics.y = this.shiftY + scrY - dY;

        const scaleBg = scaleX > scaleY ? scaleX / scaleY : scaleY / scaleX;

        this.bg.setScale(
            this.bgScale * scaleX * scaleBg,
            this.bgScale * scaleY * scaleBg
        );
        this.bg.x = this.scale.width / 2;
        this.bg.y = this.scale.height / 2;

        //if (window.innerWidth > window.innerHeight)
        {
            (this.cashoutBtn.x =
                GRID_OFFSET_X + ((COLS + 1) * CELL_SIZE_W) / 3),
                (this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 66),
                (this.spinBtn.x =
                    GRID_OFFSET_X + COLS * CELL_SIZE_W - CELL_SIZE_W / 2);
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE / 2;
            this.spinBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.45);
        }
        /*
        else {
            this.cashoutBtn.x = GRID_OFFSET_X + (1 * COLS * CELL_SIZE_W) / 4;
            this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 80;

            this.spinBtn.x = GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 2;
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE * 2;
            this.spinBtn.setOrigin(0.5, 0);
            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.55);
        }
            */
    }

    createRouletteCounter(x, y, scale, min, max, duration) {
        const atlasKey = "items";
        const container = this.add.container(x, y);
        container.setScale(scale);

        const spacing = 55;
        const decimals = 2;
        const formatWidth = 7; // Максимум: "1000.00" → 7 символов

        let currentVal = min;
        const totalFrames = duration / 16.6; // ~60 FPS
        const increment = (max - min) / totalFrames;

        const self = this;

        // Функция форматирования числа: 12.3 → "12.30", 5 → "5.00", 1000 → "1000.00"
        function formatNumber(num) {
            const fixed = num.toFixed(decimals);
            return fixed
                .padStart(formatWidth - decimals - 1, " ")
                .replace(" ", "0"); // Дополняем нулями слева
        }

        // Функция обновления отображения
        function updateDisplay(value) {
            const str = "" + Math.floor(value);
            //formatNumber(value);
            container.removeAll(true);

            let offsetX = 0;

            let frameName = "nums/e.png";
            const sprite = self.add
                .sprite(offsetX, 0, atlasKey, frameName)
                .setScale(0.9);
            container.add(sprite);
            offsetX += spacing * 1.1;

            for (let char of str) {
                if (char === " ") continue;

                let frameName;
                if (char === ".") {
                    frameName = "nums/dot.png";
                } else if (/[0-9]/.test(char)) {
                    frameName = `nums/${char}.png`;
                } else {
                    continue;
                }

                const sprite = self.add.sprite(offsetX, 0, atlasKey, frameName);
                container.add(sprite);
                offsetX += spacing;
            }

            offsetX -= spacing / 3;
        }

        // Первое отображение
        updateDisplay(currentVal);

        // Анимация
        if (duration > 0) {
            const timer = this.time.addEvent({
                delay: 16.6, // ~60 FPS
                callback: () => {
                    currentVal += increment;
                    if (currentVal >= max) {
                        currentVal = max;
                        updateDisplay(currentVal);
                        timer.remove(); // Завершаем
                    } else {
                        updateDisplay(currentVal);
                    }
                },
                repeat: Math.floor(totalFrames),
            });
        }

        // Добавим метод для остановки вручную
        container.stop = () => {
            if (timer) timer.remove();
            updateDisplay(max);
        };

        return container;
    }
}

