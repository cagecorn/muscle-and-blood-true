import { Scene } from 'phaser';
import { UNITS } from '../../data/units.js';
import { MeleeAI } from '../../ai/meleeAI.js';
import { Unit } from '../Unit.js';
import { TurnManager, TurnState } from '../../engine/TurnManager.js';
import { GridManager } from '../../engine/GridManager.js'; // 그리드 매니저 불러오기

export class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
        this.grid = null; // 이제 GridManager 인스턴스를 담습니다.
        this.turnManager = null;
        this.player = null;
        this.enemies = [];
    }

    create() {
        this.add.image(512, 384, 'battle-background').setDepth(-1);

        // 1. 매니저들 생성
        this.grid = new GridManager(this);
        this.turnManager = new TurnManager(this);
        
        // 개발 편의를 위해 그리드를 화면에 표시
        this.grid.draw();

        // 2. 그리드 위에 유닛 배치
        this.player = new Unit(this, 3, 4, UNITS.WARRIOR, '지휘관');
        const enemy = new Unit(this, 12, 4, UNITS.WARRIOR, '적 지휘관');
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

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) {
                return;
            }

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (deltaY > 0) {
                this.cameras.main.zoom *= 0.9;
            } else if (deltaY < 0) {
                this.cameras.main.zoom *= 1.1;
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
