import Phaser from 'phaser';
import { SizingManager } from './SizingManager.js';

// 맵 타일의 생성 및 무작위 배치를 담당하는 매니저
export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.grid = scene.grid;
        this.mapTiles = [];
    }

    // 맵 타일 에셋을 불러오는 함수
    static preload(scene) {
        for (let i = 1; i <= 15; i++) {
            scene.load.image(`mab-tile-${i}`, `images/world-mab/mab-tile-${i}.png`);
        }
    }

    // 맵을 생성하는 함수
    createMap() {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(-2); // 타일보다 뒤에 그려지도록 설정

        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                const tileKey = `mab-tile-${Phaser.Math.Between(1, 15)}`;
                const worldPos = this.grid.getWorldPosition(x, y);
                const tile = this.scene.add.image(worldPos.x, worldPos.y, tileKey);

                // 타일 크기를 그리드 셀에 맞게 조절합니다.
                tile.setDisplaySize(SizingManager.TILE_SIZE, SizingManager.TILE_SIZE);
                tile.setDepth(-1);
                this.mapTiles.push(tile);
            }
        }
    }
}
