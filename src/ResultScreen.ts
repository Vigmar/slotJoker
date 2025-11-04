import { FONT_SIZE, MOVE_UI_TIME, WHITE_COLOR } from "./constants";

export class ResultScreen {
    scene: Phaser.Scene;
    shade: Phaser.GameObjects.Rectangle;
    awardText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, scores: number) {
        this.scene = scene;
        this.shade = scene.add
            .rectangle(
                0,
                0,
                scene.scale.width,
                scene.scale.height,
                0x000000,
                0.5
            )
            .setOrigin(0, 0)
            .setInteractive();

        this.awardText = this.scene.add
            .text(
                this.scene.scale.width / 2,
                this.scene.scale.height / 2,
                "YOU WIN! SCORES: " + scores,
                {
                    fontSize: FONT_SIZE,
                    color: WHITE_COLOR,
                    wordWrap: { width: this.scene.scale.width * 0.5 },
                }
            )
            .setOrigin(0.5)
            .setScale(0);

        this.awardText.setOrigin(0.5, 0);

        this.scene.tweens.add({
            targets: this.awardText,
            scale: 1,
            duration: MOVE_UI_TIME,
            ease: "Linear",
        });

        this.shade.visible = true;
    }
}
