import { Scene } from 'phaser';
import { UNITS } from '../../data/units.js';
import { MeleeAI } from '../../ai/meleeAI.js';
import { Unit } from '../Unit.js';
import { TurnManager, TurnState } from '../../engine/TurnManager.js';
import { GridManager } from '../../engine/GridManager.js'; // 그리드 매니저 불러오기
import { MapManager } from '../../engine/MapManager.js'; // MapManager를 불러옵니다.

export class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
        this.grid = null; 
        this.mapManager = null; // mapManager 속성 추가
        this.turnManager = null;
        this.player = null;
        this.enemies = [];
    }

    create() {
        // this.add.image(512, 384, 'battle-background').setDepth(-1); // MapManager가 배경을 그리므로 주석 처리

        // 1. 매니저들 생성
        this.grid = new GridManager(this);
        this.mapManager = new MapManager(this); // MapManager 인스턴스 생성
        this.turnManager = new TurnManager(this);

        // MapManager를 사용하여 맵 타일을 생성합니다.
        this.mapManager.createMap();

        // 개발 편의를 위해 그리드를 화면에 표시
        this.grid.draw();

        // 2. 그리드 위에 유닛 배치 (30x30에 맞게 위치 조정)
        this.player = new Unit(this, 5, 15, UNITS.WARRIOR, '지휘관');
        const enemy = new Unit(this, 24, 15, UNITS.WARRIOR, '적 지휘관');
        enemy.setFlipX(true);
        this.enemies.push(enemy);
        enemy.ai = new MeleeAI(enemy);

        // 3. 입력 및 기타 설정
        this.input.keyboard.on('keydown', event => this.handleKeyPress(event));
        this.input.keyboard.on('keydown-M', () => { this.scene.start('WorldMap'); });

        // --- 카메라 드래그 및 확대/축소 기능 추가 ---
        const worldWidth = this.grid.width * this.grid.tileSize;
        const worldHeight = this.grid.height * this.grid.tileSize;
        this.cameras.main.setBounds(this.grid.offsetX, this.grid.offsetY, worldWidth, worldHeight);

        // 카메라가 플레이어를 따라다니도록 설정
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.5); // 초기 줌 레벨 설정

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) {
                return;
            }

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (deltaY > 0) {
                this.cameras.main.zoom = Math.max(0.5, this.cameras.main.zoom * 0.9);
            } else if (deltaY < 0) {
                this.cameras.main.zoom = Math.min(3, this.cameras.main.zoom * 1.1);
            }
        });
    }

    handleKeyPress(event) {
        if (this.turnManager.state !== TurnState.PLAYER_INPUT) return;

        let targetX = this.player.gridPosition.x;
        let targetY = this.player.gridPosition.y;

        switch (event.code) {
            case 'ArrowUp': targetY--; break;
            case 'ArrowDown': targetY++; break;
            case 'ArrowLeft': targetX--; break;
            case 'ArrowRight': targetX++; break;
            default: return;
        }
        
        if (targetX >= 0 && targetX < this.grid.width && targetY >= 0 && targetY < this.grid.height) {
            this.turnManager.playerAction({
                type: 'move',
                unit: this.player,
                targetPosition: { x: targetX, y: targetY }
            });
        }
    }
    
    update(time, delta) {}
}
