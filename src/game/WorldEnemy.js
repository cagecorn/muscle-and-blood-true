import { WorldEntity } from './WorldEntity.js';
import { WorldMeleeAI } from '../ai/WorldMeleeAI.js';
import { Nameplate } from './Nameplate.js';
import { HealthBar } from './HealthBar.js';

export class WorldEnemy extends WorldEntity {
    constructor(scene, gridX, gridY, key, name, tileSize) {
        const worldX = gridX * tileSize + tileSize / 2;
        const worldY = gridY * tileSize + tileSize / 2;
        const container = scene.add.container(worldX, worldY);
        const sprite = scene.add.sprite(0, 0, key)
            .setDisplaySize(tileSize, tileSize)
            .setFlipX(true);
        container.add(sprite);

        const nameplate = new Nameplate(scene, sprite, name);
        const healthBar = new HealthBar(scene, sprite);
        container.add(nameplate.renderTexture);
        container.add(healthBar.renderTexture);

        super(scene, container, tileSize);
        this.sprite = sprite;
        this.nameplate = nameplate;
        this.healthBar = healthBar;
        this.ai = new WorldMeleeAI(this, scene);
    }

    update() {
        if (this.nameplate) this.nameplate.update();
        if (this.healthBar) this.healthBar.update();
    }
}
