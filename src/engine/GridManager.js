import { SizingManager } from './SizingManager.js';

// 전투 그리드의 생성, 좌표 변환, 그리기를 담당하는 매니저
export class GridManager {
    constructor(scene) {
        this.scene = scene;
        
        // SizingManager에서 크기 정보를 가져와 설정
        this.width = SizingManager.GRID_WIDTH;
        this.height = SizingManager.GRID_HEIGHT;
        this.tileSize = SizingManager.TILE_SIZE;

        // 그리드가 화면 중앙에 오도록 오프셋 계산
        this.offsetX = (scene.scale.width - (this.width * this.tileSize)) / 2;
        this.offsetY = (scene.scale.height - (this.height * this.tileSize)) / 2;
    }

    // 그리드 좌표를 실제 화면 좌표로 변환
    getWorldPosition(x, y) {
        return {
            x: this.offsetX + x * this.tileSize + this.tileSize / 2,
            y: this.offsetY + y * this.tileSize + this.tileSize / 2
        };
    }

    // 그리드를 시각적으로 그리는 함수 (개발용)
    draw() {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(1, 0xffffff, 0.2);
        graphics.setDepth(0); // 다른 모든 요소보다 뒤에 그려지도록 설정

        for (let i = 0; i <= this.width; i++) {
            const x = this.offsetX + i * this.tileSize;
            graphics.lineBetween(x, this.offsetY, x, this.offsetY + this.height * this.tileSize);
        }
        for (let j = 0; j <= this.height; j++) {
            const y = this.offsetY + j * this.tileSize;
            graphics.lineBetween(this.offsetX, y, this.offsetX + this.width * this.tileSize, y);
        }
    }
}
