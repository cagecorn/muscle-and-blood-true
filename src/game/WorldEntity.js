export class WorldEntity {
    constructor(scene, container, tileSize) {
        this.scene = scene;
        this.container = container;
        this.tileSize = tileSize;
    }

    getGridPosition() {
        return {
            x: Math.floor(this.container.x / this.tileSize),
            y: Math.floor(this.container.y / this.tileSize)
        };
    }

    moveToTile(gridX, gridY, onComplete) {
        const targetX = gridX * this.tileSize + this.tileSize / 2;
        const targetY = gridY * this.tileSize + this.tileSize / 2;
        this.scene.tweens.add({
            targets: this.container,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Power2',
            onComplete
        });
    }
}
