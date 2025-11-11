import Phaser from "phaser";

export const COLS = 6;
export const ROWS = 4;
export const SYMBOL_TYPES = 8;
export const CELL_SIZE = 80;
export const CELL_SIZE_W = 105;
export const GRID_OFFSET_X = 36;
export const GRID_OFFSET_Y = 100;
export const TAPE_STEP_ITEMS_COUNT = 50;
export const ITEM_NAMES = [
    "bar.png",
    "cherry.png",
    "orange.png",
    "plum.png",
    "scatter.png",
    "seven.png",
    "star.png",
    "wild.png",
];

const DRUM_BUFFER = 4; // по 4 сверху и снизу
const TOTAL_DRUM_ITEMS = ROWS + DRUM_BUFFER * 2; // например, 5 + 8 = 13

const maskWidth = COLS * CELL_SIZE_W;
const maskHeight = ROWS * CELL_SIZE;
const maskX = GRID_OFFSET_X;
const maskY = GRID_OFFSET_Y;

const MATHCES = [[], [], [], [], [], []];
const PUSH_NAMES = [
    "push250.png",
    "",
    "push570.png",
    "push-200.png",
    "push5000.png",
];
const BONUS_NAMES = [
    "win_250.png",
    "win_bonus.png",
    "win_570.png",
    "",
    "win_5000.png",
];

const BET_COUNT = [0, 250, 250, 820, 620, 5620];

export default class MainGame extends Phaser.Scene {
    grid = [];
    sliders = [];
    gridTweens = [];

    isProcessing = false;
    isMoving = false;
    gameContainer = null;
    tapeContainer = null;
    gameBackContainer = null;
    cellsFrame = null;
    frameGlow = null;
    backContainer = null;
    uiContainer = null;
    maskGraphics = null;
    cashoutBtn = null;
    spinBtn = null;
    betBtn = null;

    betCount = null;
    betContainer = null;
    downloadBtn = null;
    endTitle = null;

    pushSprite = null;
    bonusSprite = null;
    endEffect = null;
    endSprite = null;
    joker1 = null;
    joker2 = null;
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
        this.load.atlas("items", "assets/joker1.png", "assets/joker1.json");
        this.load.atlas("slider", "assets/jslider.png", "assets/jslider.json");
        this.load.image("table", "assets/table.png");
        this.load.image("tframe", "assets/table_ram.png");
        this.load.image("glow", "assets/glow.png");
        this.load.image("endbg", "assets/background.jpg");
        this.load.image("endbtn", "assets/endbtn.png");
        this.load.image("endeffect", "assets/endeffect.png");
        this.load.image("joker", "assets/joker.png");

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
            this.scale.width > this.scale.height
                ? this.scale.width / 1024
                : this.scale.height / 1024;
        //this.bgItemScale = this.scale.width<this.scale.height?this.scale.width/1920:this.scale.height/1920;
        this.bgItemScale = this.scale.height / 1400;

        this.bg = this.add
            .sprite(this.scale.width / 2, this.scale.height / 2, "endbg")
            .setOrigin(0.5, 0.5)
            .setScale(this.bgScale);

        this.backContainer = this.add.container();

        

        this.anims.create({
            key: "sliders",
            frames: [
                { key: "slider", frame: "slider_1.png" },
                { key: "slider", frame: "slider_2.png" },
                { key: "slider", frame: "slider_3.png" },
                { key: "slider", frame: "slider_4.png" },
                { key: "slider", frame: "slider_5.png" },
                { key: "slider", frame: "slider_6.png" },
                { key: "slider", frame: "slider_7.png" },
                { key: "slider", frame: "slider_8.png" },
                { key: "slider", frame: "slider_9.png" },
            ],
            frameRate: 15,
            repeat: -1,
        });

        this.gameBackContainer = this.add.container();

        this.joker1 = this.add
            .sprite(
                COLS * CELL_SIZE_W + GRID_OFFSET_X - 10,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "joker"
            )
            .setOrigin(0, 0.5)
            .setScale(0.6);

        this.gameBackContainer.add(this.joker1);

        const cellsBack = this.add
            .sprite(GRID_OFFSET_X, GRID_OFFSET_Y - 5, "table")
            .setScale(0.33, 0.33)
            .setOrigin(0, 0);
        this.gameBackContainer.add(cellsBack);

        this.sliders = [];

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

        this.gameBackContainer.add(cellsBack);

        // === КОНТЕЙНЕР ДЛЯ СИМВОЛОВ ===
        this.gameContainer = this.add.container();
        this.gameContainer.setMask(mask);

        this.tapeContainer = this.add.container();
        this.gameContainer.add(this.tapeContainer);

        this.uiContainer = this.add.container();

        this.frameGlow = this.add
            .sprite(GRID_OFFSET_X - 150, GRID_OFFSET_Y - 150, "glow")
            .setScale(0.325, 0.325)
            .setOrigin(0);
        this.uiContainer.add(this.frameGlow);

        this.tweens.add({
            targets: this.frameGlow,
            alpha: 0.5,
            duration: 1000,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
        });

        this.cellsFrame = this.add
            .sprite(GRID_OFFSET_X - 100, GRID_OFFSET_Y - 100, "tframe")
            .setScale(0.325, 0.325)
            .setOrigin(0);
        this.uiContainer.add(this.cellsFrame);

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
                "button1.png"
            )
            .setScale(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                if (!this.isMoving) {
                    this.stopTutorial();
                    
                    this.gameStep += 1;
                    if (this.gameStep < MATHCES.length)
                        this.startNewGame(MATHCES[this.gameStep]);
                }
            });

        this.cashoutBtn = this.add
            .sprite(
                GRID_OFFSET_X + ((COLS + 1) * CELL_SIZE_W) / 2,
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

        this.betBtn = this.add
            .sprite(
                GRID_OFFSET_X,
                GRID_OFFSET_Y + ROWS * CELL_SIZE + 20,
                "items",
                "bet.png"
            )
            .setOrigin(0, 0)
            .setScale(0.5);

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

        this.betContainer = this.add.container();
        //this.betCount = this.createRouletteCounter(0,0, 0.22, 0, 0, 0);
        this.betCount = this.createRouletteCounter(0, 0, 0.22, 0, 0, 0);

        this.betContainer.x = GRID_OFFSET_X + 118;
        this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 55;

        this.uiContainer.add(this.spinBtn);
        this.uiContainer.add(this.betBtn);
        this.uiContainer.add(this.betContainer);
        this.uiContainer.add(this.cashoutBtn);
        this.uiContainer.add(this.tutorSprite);

        this.betContainer.add(this.betCount);

        this.pushSprite = this.add
            .sprite(this.scale.width / 2, -500, "items", PUSH_NAMES[0])
            .setOrigin(0.5, 0)
            .setScale(1);

        this.bonusSprite = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "items",
                BONUS_NAMES[0]
            )
            .setOrigin(0.5, 0.5)
            .setScale(0);

        this.uiContainer.add(this.bonusSprite);

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

        this.initDrums();

        this.scale.on("resize", this.resizeGame, this);
        this.resizeGame();

        this.time.delayedCall(1000, () => {
            this.startTutorial(false);
            if (this.isSoundEnable) {
                if (!this.ambSound) this.ambSound = this.sound.add("ambient");
                this.ambSound.play({
                    loop: true,
                });
            }
        });
    }

    stopTutorial() {
        if (this.tutorTween) {
            this.tutorTween.stop();
        }

        for (let i=0;i<this.gridTweens.length;i++)
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
                1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 6,
                7, 7, 0,
            ],
            [
                1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 6,
                7, 0, 0,
            ],
            [
                4, 7, 7, 6, 6, 6, 6, 6, 6, 1, 1, 1, 2, 2, 2, 3, 3, 3, 5, 5, 5,
                0, 0, 0,
            ],
            [
                0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6,
                7, 7, 7,
            ],
            [
                7, 6, 6, 6, 6, 6, 6, 1, 1, 1, 2, 2, 2, 3, 3, 3, 5, 5, 5, 4, 4,
                4, 0, 0, 0,
            ],
        ];

        this.grid = [[], [], [], [], []];

        let tweenInd = 0;

        for (let l = 0; l < stepItemIds.length; l++)
            Phaser.Utils.Array.Shuffle(stepItemIds[l]);

        for (let i = 0; i < COLS; i++)
            for (let j = 0; j < 6; j++)
                for (let k = 0; k < TAPE_STEP_ITEMS_COUNT; k++) {
                    const offsetX =
                        GRID_OFFSET_X +
                        i * (CELL_SIZE_W - 2) +
                        CELL_SIZE_W / 2 +
                        10;
                    const offsetY =
                        (j * TAPE_STEP_ITEMS_COUNT + k) * CELL_SIZE -
                        TAPE_STEP_ITEMS_COUNT * 6 * CELL_SIZE +
                        CELL_SIZE * 6 -
                        10;

                    let frameId = Phaser.Math.Between(0, SYMBOL_TYPES - 1);

                    if (k > TAPE_STEP_ITEMS_COUNT - 5) {
                        if (j == 5) {
                            if (i == 0) {
                                if (k == TAPE_STEP_ITEMS_COUNT - 4) frameId = 6;
                                else frameId = 3;
                            } else {
                                frameId = 1;
                            }
                        } else {
                            let currIds = stepItemIds[4 - j];
                            frameId =
                                currIds[i * 4 + k - TAPE_STEP_ITEMS_COUNT + 4];

                            this.grid[4 - j][
                                i * 4 + k - TAPE_STEP_ITEMS_COUNT + 4
                            ] = frameId;
                        }
                    }

                    const frameName = "items/" + ITEM_NAMES[frameId];

                    const sprite = this.add
                        .sprite(offsetX, offsetY, "items", frameName)
                        .setScale(0.3);
                    this.tapeContainer.add(sprite);

                    if (k > TAPE_STEP_ITEMS_COUNT - 5 && j == 5) {
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

    resetGame() {
        this.isMoving = true;
        this.isProcessing = true;

        

        if (this.gameStep == 4) {
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
            const row = Math.floor(index / 4);
            const col = index % 4;

            if (
                (this.gameStep == 1 && sym == 1) ||
                (this.gameStep == 3 && (sym == 4 || sym > 5)) ||
                (this.gameStep == 5 && sym > 5)
            ) {
                const effect = this.add
                    .sprite(
                        GRID_OFFSET_X + CELL_SIZE_W * row + 12,
                        GRID_OFFSET_Y + CELL_SIZE * col,
                        "items",
                        "frame/1.png"
                    )
                    .setOrigin(0, 0);
                effect.setScale(0.35);

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
            else this.startTutorial(true);
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
                ? this.scale.width / 1200
                : this.scale.width / 800;

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

        if (PUSH_NAMES[this.gameStep - 1]) {
            this.pushSprite.setTexture("items", PUSH_NAMES[this.gameStep - 1]);

            this.pushSprite.setScale(pushScale * scaleX, pushScale * scaleY);

            this.tweens.add({
                targets: this.pushSprite,
                y: 50 * pushScale,
                duration: 700,
                ease: "Power2",
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        this.pushSprite.y = -1000;
                    });
                },
            });
        }

        this.betCount.destroy();
        this.betCount = this.createRouletteCounter(
            0,
            0,
            0.22,
            BET_COUNT[this.gameStep - 1],
            BET_COUNT[this.gameStep],
            500
        );
        this.betContainer.add(this.betCount);
    }

    startEndScreen() {
        this.joker1.destroy();

        let scaleX = 1;
        let scaleY = 1;
        let scrX = 0;
        let scrY = 0;

        this.spinBtn.x  = 6000;
        this.cashoutBtn.x = 6000;
        this.tutorSprite.x = 6000;

        if (window.innerWidth > window.innerHeight) {
            scaleX = window.innerHeight / window.innerWidth;
            scrX = 800 * (1 - scaleX);
        } else {
            scaleY = window.innerWidth / window.innerHeight;
            scrY = 800 * (1 - scaleY);
        }

        this.stopTutorial();
        this.frameGlow.setVisible(false);
        this.betBtn.setVisible(false);
        this.betContainer.setVisible(false);
        this.spinBtn.setVisible(false);
        this.cashoutBtn.setVisible(false);
        this.gameBackContainer.setVisible(false);
        this.gameContainer.setVisible(false);
        this.cellsFrame.setVisible(false);

        this.endEffect = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "endeffect"
            )
            .setOrigin(0.5, 1)
            .setScale(0.7);
        this.uiContainer.add(this.endEffect);

        this.tweens.add({
            targets: this.endEffect,
            alpha: 0.5,
            duration: 1000,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
        });

        this.joker1 = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X - 250,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2 - 50,
                "joker"
            )
            .setOrigin(0.5, 0.5)
            .setScale(window.innerWidth > window.innerHeight ? 0.45 : 0.6);

        this.uiContainer.add(this.joker1);

        this.joker2 = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X + 250,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2 - 50,
                "joker"
            )
            .setOrigin(0.5, 0.5)
            .setFlipX(true)
            .setScale(window.innerWidth > window.innerHeight ? 0.45 : 0.6);

        this.uiContainer.add(this.joker2);

        this.tweens.add({
            targets: this.joker1,
            scale: (window.innerWidth > window.innerHeight ? 0.45 : 0.6) * 1.05,
            duration: 1000,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
        });

        this.tweens.add({
            targets: this.joker2,
            scale: (window.innerWidth > window.innerHeight ? 0.45 : 0.6) * 1.05,
            duration: 1000,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
        });

        this.endSprite = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2 + GRID_OFFSET_X,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "endbtn"
            )
            .setOrigin(0.5, 0.5)
            .setScale(window.innerWidth > window.innerHeight ? 0.45 : 0.6)
            .setInteractive()
            .on("pointerdown", (pointer) => {
                console.log("CTA pressed");
                //onCtaPressed();
                FbPlayableAd.onCTAClick();
            });

        this.uiContainer.add(this.endSprite);

        if (this.gameStep > 4) {
            if (this.isSoundEnable) this.sound.play("end");
        }

        if (this.gameStep > 4) {
            this.pushSprite.setTexture("items", "push5620.png");

            const pushScale =
                this.scale.width > this.scale.height
                    ? this.scale.width / 1200
                    : this.scale.width / 800;

            this.pushSprite.setScale(pushScale * scaleX, pushScale * scaleY);

            this.tweens.add({
                targets: this.pushSprite,
                y: 50 * pushScale,
                duration: 700,
                ease: "Power2",
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        this.pushSprite.y = -1000;
                    });
                },
            });
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
                ? this.scale.width / 1024
                : this.scale.height / 1024;

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

        if (window.innerWidth > window.innerHeight) {
            (this.cashoutBtn.x =
                GRID_OFFSET_X + ((COLS + 1) * CELL_SIZE_W) / 2),
                (this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 66),
                (this.betBtn.x = GRID_OFFSET_X);
            (this.betBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 20),
                (this.spinBtn.x =
                    GRID_OFFSET_X + COLS * CELL_SIZE_W - CELL_SIZE_W / 2);
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE / 2;
            this.spinBtn.setOrigin(0.5, 0.5);
            this.betBtn.setOrigin(0, 0);
            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.45);
            this.betBtn.setScale(0.4);
            this.betContainer.setScale(1);
            this.betContainer.x = GRID_OFFSET_X + 118;
            this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 55;

            this.joker1.x = COLS * CELL_SIZE_W + GRID_OFFSET_X - 10;
            this.joker1.y = GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2;
            this.joker1.setOrigin(0, 0.5);
            this.joker1.setScale(0.6);
        } else {
            this.cashoutBtn.x = GRID_OFFSET_X + (3 * COLS * CELL_SIZE_W) / 4;
            this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 80;
            this.betBtn.x = GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 4;
            (this.betBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 80),
                (this.spinBtn.x = GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 2);
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE * 2;
            this.spinBtn.setOrigin(0.5, 0);
            this.betBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.55);
            this.betBtn.setScale(0.55);
            this.betContainer.setScale(50 / 40);
            this.betContainer.x = GRID_OFFSET_X + 185;
            this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 65;
            this.joker1.x = COLS * CELL_SIZE_W + GRID_OFFSET_X;
            this.joker1.y = GRID_OFFSET_Y;
            this.joker1.setOrigin(1, 1);
            this.joker1.setScale(0.6);
        }
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

