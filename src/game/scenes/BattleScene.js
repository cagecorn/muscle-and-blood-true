import { Scene } from 'phaser';
import { UNITS } from '../../data/units.js';
import { MeleeAI } from '../../ai/meleeAI.js';
import { Unit } from '../Unit.js';
import { TurnManager, TurnState } from '../../engine/TurnManager.js';

// 그리드 계산을 도와줄 헬퍼 클래스
class Grid {
    constructor(scene, width, height, tileSize) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        // 그리드가 화면 중앙에 오도록 오프셋 계산
        this.offsetX = (scene.scale.width - (width * tileSize)) / 2;
        this.offsetY = (scene.scale.height - (height * tileSize)) / 2;
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

export class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
        this.grid = null;
        this.turnManager = null;
        this.player = null;
        this.enemies = [];
    }

    create() {
        this.add.image(512, 384, 'battle-background');

        // 1. 그리드 생성
        this.grid = new Grid(this, 16, 9, 64); // 16x9, 타일 크기 64
        this.grid.draw(); // 개발 편의를 위해 그리드를 화면에 표시

        // 2. 턴 매니저 생성
        this.turnManager = new TurnManager(this);

        // 3. 그리드 위에 유닛 배치
        this.player = new Unit(this, 3, 4, UNITS.WARRIOR, '지휘관');
        const enemy = new Unit(this, 12, 4, UNITS.WARRIOR, '적 지휘관');
        enemy.setFlipX(true);
        this.enemies.push(enemy);

        // 4. 적 AI 설정
        enemy.ai = new MeleeAI(enemy);

        // 5. 키보드 입력 설정
        this.input.keyboard.on('keydown', event => this.handleKeyPress(event));
        
        // 이전 카메라/월드맵 이동 코드는 유지
        this.cameras.main.setBounds(0, 0, 1600, 1200);
        this.input.on('pointermove', (p) => { if (p.isDown) { this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom; this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom; }});
        this.input.on('wheel', (p, go, dx, dy) => { const cam = this.cameras.main; if (dy > 0) cam.zoom = Math.max(0.5, cam.zoom - 0.1); else cam.zoom = Math.min(1.5, cam.zoom + 0.1); });
        this.input.keyboard.on('keydown-M', () => { this.scene.start('WorldMap'); });
    }

    // 키 입력을 처리하는 함수
    handleKeyPress(event) {
        // 플레이어 턴일 때만 입력을 받음
        if (this.turnManager.state !== TurnState.PLAYER_INPUT) return;

        let targetX = this.player.gridPosition.x;
        let targetY = this.player.gridPosition.y;

        switch (event.code) {
            case 'ArrowUp': targetY--; break;
            case 'ArrowDown': targetY++; break;
            case 'ArrowLeft': targetX--; break;
            case 'ArrowRight': targetX++; break;
            default: return; // 화살표 키가 아니면 무시
        }
        
        // 이동할 위치가 유효한지 확인 (그리드 범위 안)
        if (targetX >= 0 && targetX < this.grid.width && targetY >= 0 && targetY < this.grid.height) {
            // 턴 매니저에게 플레이어의 행동을 전달
            this.turnManager.playerAction({
                type: 'move',
                unit: this.player,
                targetPosition: { x: targetX, y: targetY }
            });
        }
    }
    
    // BattleScene의 update는 이제 아무것도 하지 않습니다. 모든 로직은 TurnManager가 관리합니다.
    update(time, delta) {}
}

