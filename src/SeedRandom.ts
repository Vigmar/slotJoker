export class SeededRandom {
    private seed: number;
    private maxVal: number;

    constructor(maxVal: number, seed?: number) {
        this.maxVal = maxVal;
        if (seed) this.seed = seed ?? Date.now();
    }

    private lcg(): number {
        const a = 1103515245;
        const c = 12345;
        const m = 2 ** 31;
        this.seed = (a * this.seed + c) % m;
        return this.seed;
    }

    public range(min: number, max: number): number {
        return Math.floor((this.lcg() / 2 ** 31) * (max - min + 1)) + min;
    }

    public setSeed(seed: number): void {
        this.seed = seed;
    }

    public getRandomIconKey(): string {
        const index = this.seed
            ? this.range(1, this.maxVal)
            : Phaser.Math.Between(1, this.maxVal);

        return `icon_${index}.png`;
    }
}
