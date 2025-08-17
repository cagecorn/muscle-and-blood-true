import { SizingManager } from '../engine/SizingManager.js';

export class HealthBar {
    /**
     * @param {Phaser.Scene} scene - 현재 씬
     * @param {Phaser.GameObjects.GameObject} owner - 체력바가 따라갈 오브젝트
     */
    constructor(scene, owner) {
        this.scene = scene;
        this.owner = owner;
        this.width = SizingManager.HEALTHBAR_WIDTH;
        this.height = SizingManager.HEALTHBAR_HEIGHT;
        this.offset = SizingManager.HEALTHBAR_Y_OFFSET;
        this.current = 100;
        this.max = 100;

        this.renderTexture = scene.add.renderTexture(0, 0, this.width * 2, this.height * 2);
        this.renderTexture.setScale(0.5);
        this.renderTexture.setDepth(2);
        this._draw();
    }

    _draw() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        g.clear();
        g.fillStyle(0x000000, 0.5);
        g.fillRect(0, 0, this.width * 2, this.height * 2);
        g.fillStyle(0x00ff00, 1);
        g.fillRect(0, 0, this.width * 2 * (this.current / this.max), this.height * 2);
        this.renderTexture.clear();
        this.renderTexture.draw(g, 0, 0);
        g.destroy();
    }

    setHealth(current, max = this.max) {
        this.current = current;
        this.max = max;
        this._draw();
    }

    update() {
        this.renderTexture.setPosition(this.owner.x, this.owner.y + this.offset);
    }

    destroy() {
        this.renderTexture.destroy();
    }
}
