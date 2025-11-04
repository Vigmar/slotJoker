import Phaser from "phaser";

export const COLS = 6;
export const ROWS = 4;
export const SYMBOL_TYPES = 8;
export const CELL_SIZE = 80;
export const CELL_SIZE_W = 105;
export const GRID_OFFSET_X = 0;
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

    isProcessing = false;
    isMoving = false;
    gameContainer = null;
    tapeContainer = null;
    gameBackContainer = null;
    cellsFrame = null;
    backContainer = null;
    uiContainer = null;
    maskGraphics = null;
    cashoutBtn = null;
    spinBtn = null;

    betCount = null;
    betContainer = null;
    downloadBtn = null;
    endTitle = null;

    pushSprite = null;
    bonusSprite = null;
    endEffect = null;
    endSprite = null;

    gameStep = 0;
    bg = null;
    bgScale = 1;
    bgItemScale = 1;
    fieldScale = 1;
    pushScale = 1;
    shiftX = 0;
    shiftY = 0;

    preload() {
        this.load.atlas("items", "assets/joker1.png", "assets/joker1.json");
        this.load.image("table", "assets/table.png");
        this.load.image("tframe", "assets/table_ram.png");
        this.load.image("bg", "assets/background.jpg");
        this.load.image("endbtn", "assets/endbtn.png");
        this.load.image("endeffect", "assets/endeffect.png");
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
                ? this.scale.width / 1920
                : this.scale.height / 1920;
        //this.bgItemScale = this.scale.width<this.scale.height?this.scale.width/1920:this.scale.height/1920;
        this.bgItemScale = this.scale.height / 1400;
        this.fieldScale =
            this.scale.width < this.scale.height
                ? this.scale.width /
                  (GRID_OFFSET_X * 2 + CELL_SIZE_W * COLS + 100)
                : this.scale.height /
                  (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS + 100);
        this.bg = this.add
            .sprite(this.scale.width / 2, this.scale.height / 2, "bg")
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

        // === КОНТЕЙНЕР ДЛЯ СИМВОЛОВ ===
        this.gameContainer = this.add.container();
        this.gameContainer.setMask(mask);

        this.tapeContainer = this.add.container();
        this.gameContainer.add(this.tapeContainer);

        this.uiContainer = this.add.container();

        this.cellsFrame = this.add
            .sprite(GRID_OFFSET_X - 100, GRID_OFFSET_Y - 100, "tframe")
            .setScale(0.325, 0.325)
            .setOrigin(0);
        this.uiContainer.add(this.cellsFrame);

        this.gameBackContainer.setScale(this.fieldScale);
        this.gameContainer.setScale(this.fieldScale);
        this.uiContainer.setScale(this.fieldScale);
        this.maskGraphics.setScale(this.fieldScale);

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
                    console.log("click", this.gameStep);
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

        this.betContainer = this.add.container();
        //this.betCount = this.createRouletteCounter(0,0, 0.22, 0, 0, 0);
        this.betCount = this.createRouletteCounter(0, 0, 0.22, 0, 0, 0);

        this.betContainer.x = GRID_OFFSET_X + 118;
        this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 55;

        this.uiContainer.add(this.spinBtn);

        this.uiContainer.add(this.betContainer);
        this.uiContainer.add(this.cashoutBtn);
        this.betContainer.add(this.betCount);

        this.pushSprite = this.add
            .sprite(this.scale.width / 2, -200, "items", PUSH_NAMES[0])
            .setOrigin(0.5, 0)
            .setScale(1);

        this.bonusSprite = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2,
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
                }

        //console.log(this.grid);
    }

    resetGame() {
        this.isMoving = true;
        this.isProcessing = true;

        console.log(this.gameStep);

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

        console.log(this.gameStep, this.grid[this.gameStep - 1]);

        this.grid[this.gameStep - 1].forEach((sym, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;

            if (this.gameStep == 1 && sym == 1 || this.gameStep == 3 && (sym == 4 || sym >5) || this.gameStep == 5 && sym >5) {
                const effect = this.add.sprite(
                    GRID_OFFSET_X + CELL_SIZE_W * row+12,
                    GRID_OFFSET_Y + CELL_SIZE * col,
                    "items",
                    "frame/1.png"
                ).setOrigin(0,0);
                effect.setScale(0.35);

                effect.play("frame_gem");
                this.gameContainer.add(effect);

                effect.on("animationcomplete", () => {
                    effect.destroy();
                });

                this.time.delayedCall(400, () => {
                    const effectBoom = this.add.sprite(
                        GRID_OFFSET_X + CELL_SIZE_W * row+10,
                        GRID_OFFSET_Y + CELL_SIZE * col,
                        "items",
                        "splash/1.png"
                    ).setOrigin(0,0);;
                    effectBoom.setScale(0.35);
                    effectBoom.play("boom_gem");
                    this.gameContainer.add(effectBoom);

                    effectBoom.on("animationcomplete", () => {
                        effectBoom.destroy();
                    });
                });
            }
        });

        this.startPushes();
    }

    update(time: number, dt: number) {}

    startPushes() {
        if (BONUS_NAMES[this.gameStep-1]) {
            this.bonusSprite.setTexture("items", BONUS_NAMES[this.gameStep-1]);
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

        if (PUSH_NAMES[this.gameStep-1]) {
            this.pushSprite.setTexture("items", PUSH_NAMES[this.gameStep-1]);

            const pushScale =
                this.scale.width > this.scale.height
                    ? this.scale.width / 2400
                    : this.scale.width / 1200;

            console.log(pushScale);

            this.pushSprite.setScale(pushScale);

            this.tweens.add({
                targets: this.pushSprite,
                y: 50 * pushScale,
                duration: 700,
                ease: "Power2",
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        this.pushSprite.y = -200;
                    });
                },
            });
        }

        this.betCount.destroy();
        this.betCount = this.createRouletteCounter(
            0,
            0,
            0.22,
            BET_COUNT[this.gameStep-1],
            BET_COUNT[this.gameStep],
            500
        );
        this.betContainer.add(this.betCount);
    }

    startEndScreen() {
        this.betContainer.setVisible(false);
        this.spinBtn.setVisible(false);
        this.cashoutBtn.setVisible(false);
        this.gameBackContainer.setVisible(false);
        this.gameContainer.setVisible(false);
        this.cellsFrame.setVisible(false);

        this.endEffect = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2 - 20,
                "endeffect"
            )
            .setOrigin(0.5, 1)
            .setScale(0.7);
        this.uiContainer.add(this.endEffect);

        this.endSprite = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "endbtn"
            )
            .setOrigin(0.5, 0.5)
            .setScale(0.4);
        this.uiContainer.add(this.endSprite);
    }

    resizeGame() {
        this.bgScale =
            this.scale.width > this.scale.height
                ? this.scale.width / 1920
                : this.scale.height / 1920;

        this.bgItemScale = this.scale.height / 1400;
        this.fieldScale =
            this.scale.width < this.scale.height
                ? this.scale.width /
                  (GRID_OFFSET_X * 2 + CELL_SIZE_W * COLS + 100)
                : this.scale.height /
                  (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS + 100);

        this.shiftX =
            (this.scale.width -
                this.fieldScale * (GRID_OFFSET_X * 2 + CELL_SIZE_W * COLS)) /
            2;
        this.shiftY =
            (this.scale.height -
                this.fieldScale * (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS)) /
                2 -
            20;

        this.gameBackContainer.setScale(this.fieldScale);
        this.gameContainer.setScale(this.fieldScale);
        this.uiContainer.setScale(this.fieldScale);
        this.maskGraphics.setScale(this.fieldScale);
        this.gameBackContainer.x = this.shiftX;
        this.gameContainer.x = this.shiftX;
        this.uiContainer.x = this.shiftX;
        this.maskGraphics.x = this.shiftX;
        this.gameBackContainer.y = this.shiftY;
        this.gameContainer.y = this.shiftY;
        this.uiContainer.y = this.shiftY;
        this.maskGraphics.y = this.shiftY;

        this.bg.setScale(this.bgScale);
        this.bg.x = this.scale.width / 2;
        this.bg.y = this.scale.height / 2;

        if (this.scale.width > this.scale.height) {
            (this.cashoutBtn.x =
                GRID_OFFSET_X + ((COLS + 1) * CELL_SIZE_W) / 2),
                (this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 66),
                (this.spinBtn.x =
                    GRID_OFFSET_X + COLS * CELL_SIZE_W - CELL_SIZE_W / 2);
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE / 2;
            this.spinBtn.setOrigin(0.5, 0.5);

            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.45);
            this.betContainer.setScale(1);
            this.betContainer.x = GRID_OFFSET_X + 118;
            this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 55;
        } else {
            this.cashoutBtn.x = GRID_OFFSET_X + (3 * COLS * CELL_SIZE_W) / 4;
            this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 80;

            this.spinBtn.x = GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 2;
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE * 2;
            this.spinBtn.setOrigin(0.5, 0);
            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.55);
            this.betContainer.setScale(50 / 40);
            this.betContainer.x = GRID_OFFSET_X + 185;
            this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 65;
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

            let frameName = "nums/$.png";
            const sprite = self.add
                .sprite(offsetX, 0, atlasKey, frameName)
                .setScale(0.8);
            container.add(sprite);
            offsetX += spacing;

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

